const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const axios = require('axios');

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg'); 

const app = express();
const PORT = process.env.PORT || 3001;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring database client:', err.stack);
  }
  console.log('Successfully connected to the PostgreSQL database.');
  release();
});

app.use(cors());                  
app.use(express.json());
app.use(express.text());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const multer = require('multer');
const fs = require('fs');

// 1. Setup Local Storage for Images
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});
const upload = multer({ storage: storage });

const logAuditAction = async (action, targetRecord, details, performedBy) => {
    try {
        const auditSet = await pool.query("SELECT setting_value FROM public.system_settings WHERE setting_key = 'audit_logs'");
        if (auditSet.rows.length > 0 && auditSet.rows[0].setting_value === 'true') {
            await pool.query(`
                INSERT INTO public.audit_logs (action, target_record, details, performed_by) 
                VALUES ($1, $2, $3, $4)
            `, [action, targetRecord, details, performedBy || 'System']);
            console.log(`[Audit Logged] ${action} on ${targetRecord}`);
        }
    } catch (error) {
        console.error("Failed to write audit log:", error);
    }
};

// 2. Expose the /uploads folder to the internet so React can render the images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==========================================
// EMPLOYEE EVENT REGISTRATIONS
// ==========================================

// GET: Fetch all events an employee has registered for (WITH EVENT DETAILS)
app.get('/api/events/employee/:employee_key/registered', async (req, res) => {
    const { employee_key } = req.params;
    try {
        const query = `
            SELECT 
                r.event_id, 
                r.status AS registration_status, 
                r.registration_date,
                e.title, 
                e.department, 
                e.start_date, 
                e.end_date, 
                e.venue,
                e.image_url,
                NULL AS pdf_url -- Placeholder for future certificates
            FROM public.fact_event_registration r
            JOIN public.dim_event e ON r.event_id = e.event_id
            WHERE r.employee_key = $1 AND r.status = 'Registered'
            ORDER BY e.start_date ASC;
        `;
        const result = await pool.query(query, [employee_key]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching registered events:", error);
        res.status(500).json({ error: "Failed to fetch registrations." });
    }
});

// POST: Employee joins an event
app.post('/api/events/:id/register', async (req, res) => {
    const { id } = req.params;
    const { employee_key } = req.body;
    try {
        // Enforce unique constraint naturally, explicitly inserting the status
        await pool.query(
            `INSERT INTO public.fact_event_registration (event_id, employee_key, status) 
             VALUES ($1, $2, 'Registered')`, 
            [id, employee_key]
        );
        res.status(201).json({ success: true, message: "Registered successfully." });
    } catch (error) {
        if (error.code === '23505') { // PostgreSQL unique violation code
            return res.status(409).json({ error: "You are already registered for this event." });
        }
        console.error("Error joining event:", error);
        res.status(500).json({ error: "Failed to register for event." });
    }
});

// DELETE: Employee cancels their registration
app.delete('/api/events/:id/register/:employee_key', async (req, res) => {
    const { id, employee_key } = req.params;
    try {
        // Hard delete the row when they cancel
        await pool.query(
            `DELETE FROM public.fact_event_registration WHERE event_id = $1 AND employee_key = $2`, 
            [id, employee_key]
        );
        res.status(200).json({ success: true, message: "Registration cancelled." });
    } catch (error) {
        console.error("Error cancelling registration:", error);
        res.status(500).json({ error: "Failed to cancel registration." });
    }
});

// ==========================================
// EVENT MANAGEMENT
// ==========================================

// GET: Fetch all active events (with optional department filtering)
app.get('/api/events', async (req, res) => {
    const { department } = req.query;
    try {
        let deptFilter = '';
        let params = [];
        
        // If the user's department is provided, only show events for "All Departments" OR their specific dept
        if (department && department !== 'All Departments') {
            deptFilter = `WHERE (e.department = $1 OR e.department = 'All Departments' OR e.department IS NULL OR e.department = '')`;
            params.push(department);
        }

        const query = `
            SELECT e.*, 
                   (SELECT COUNT(*) FROM public.fact_event_registration WHERE event_id = e.event_id) as registered_count
            FROM public.dim_event e
            ${deptFilter}
            ORDER BY start_date ASC;
        `;
        const result = await pool.query(query, params);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({ error: "Failed to fetch events." });
    }
});

// POST: Create a new event
app.post('/api/events', upload.single('cover_image'), async (req, res) => {
    const { title, description, objectives, event_type, venue, capacity, department, start_date, end_date, created_by } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    
    try {
        const query = `
            INSERT INTO public.dim_event 
            (title, description, objectives, event_type, venue, capacity, department, start_date, end_date, created_by, image_url) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *;
        `;
        const values = [
            title, description, objectives, event_type, venue, 
            capacity ? parseInt(capacity) : null, 
            department, start_date, end_date, 
            created_by ? parseInt(created_by) : null, 
            imageUrl
        ];
        
        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error creating event:", error);
        res.status(500).json({ error: "Failed to create event." });
    }
});

// PUT: Update existing event
app.put('/api/events/:id', upload.single('cover_image'), async (req, res) => {
    const { id } = req.params;
    const { title, description, objectives, event_type, venue, capacity, department, start_date, end_date } = req.body;
    
    try {
        // If a new file was uploaded, update the image_url, otherwise keep the existing one
        let query;
        let values;

        if (req.file) {
            const imageUrl = `/uploads/${req.file.filename}`;
            query = `
                UPDATE public.dim_event 
                SET title=$1, description=$2, objectives=$3, event_type=$4, venue=$5, capacity=$6, department=$7, start_date=$8, end_date=$9, image_url=$10
                WHERE event_id=$11 RETURNING *;
            `;
            values = [title, description, objectives, event_type, venue, capacity ? parseInt(capacity) : null, department, start_date, end_date, imageUrl, id];
        } else {
            query = `
                UPDATE public.dim_event 
                SET title=$1, description=$2, objectives=$3, event_type=$4, venue=$5, capacity=$6, department=$7, start_date=$8, end_date=$9
                WHERE event_id=$10 RETURNING *;
            `;
            values = [title, description, objectives, event_type, venue, capacity ? parseInt(capacity) : null, department, start_date, end_date, id];
        }

        const result = await pool.query(query, values);
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Error updating event:", error);
        res.status(500).json({ error: "Failed to update event." });
    }
});

// DELETE: Mark event as Cancelled
app.delete('/api/events/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('UPDATE public.dim_event SET status = $1 WHERE event_id = $2', ['Cancelled', id]);
        res.status(200).json({ success: true, message: "Event cancelled successfully." });
    } catch (error) {
        console.error("Error cancelling event:", error);
        res.status(500).json({ error: "Failed to cancel event." });
    }
});

app.get('/api/health', async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend server is running smoothly.',
  });
});

// ==========================================
// AUTHENTICATION & LOGIN
// ==========================================

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
   const queryText = `
      SELECT 
        a.username, a.email, a.system_access_level, a.contact_number, a.password,
        e.employee_key, e.employee_id, e.first_name, e.middle_name, e.last_name,         
        e.department, e.position_title, e.civil_status, e.date_of_birth, e.gender, e.salary_grade,
        (SELECT salary_amount FROM public.salary_history WHERE employee_key = e.employee_key ORDER BY effective_date DESC LIMIT 1) AS current_salary_amount,
        e.hire_date, e.employment_type, e.civil_service_eligibility,
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, e.hire_date)) AS years_of_service
      FROM public.user_accounts a
      INNER JOIN public.dim_employee e ON a.employee_key = e.employee_key
      WHERE a.username = $1
    `;

    const userQuery = await pool.query(queryText, [username]);
    
    if (userQuery.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    const activeUser = userQuery.rows[0];

    if (activeUser.password !== password) { 
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    // FUNCTIONAL UPDATE: Check if the System is in Maintenance Mode!
    const settingsRes = await pool.query("SELECT setting_key, setting_value FROM public.system_settings");
    const settingsMap = settingsRes.rows.reduce((acc, row) => { acc[row.setting_key] = row.setting_value; return acc; }, {});
    
    const isMaintenance = settingsMap['maintenance_mode'] === 'true';
    const timeoutMins = parseInt(settingsMap['session_timeout'] || 30);

    if (isMaintenance && activeUser.system_access_level !== 'IT Admin' && activeUser.system_access_level !== 'Super Admin') {
        return res.status(503).json({ 
            success: false, 
            message: 'System is currently under scheduled maintenance. Only IT Administrators can log in at this time.' 
        });
    }

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      sessionTimeout: timeoutMins, // Sends active timeout settings to frontend
      user: {
        username: activeUser.username,
        email: activeUser.email,
        contact_number: activeUser.contact_number,
        employee_key: activeUser.employee_key,
        employee_id: activeUser.employee_id,
        first_name: activeUser.first_name,
        middle_name: activeUser.middle_name,
        last_name: activeUser.last_name,
        position_title: activeUser.position_title,
        department: activeUser.department,
        role: activeUser.system_access_level,
        civil_status: activeUser.civil_status,
        date_of_birth: activeUser.date_of_birth,
        gender: activeUser.gender,
        salary_grade: activeUser.salary_grade,
        current_salary_amount: activeUser.current_salary_amount || 0,
        hire_date: activeUser.hire_date,
        employment_type: activeUser.employment_type,
        civil_service: activeUser.civil_service_eligibility,
        years_of_service: activeUser.years_of_service
      }
    });

  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// PASSWORD RESET REQUESTS
// ==========================================

app.post('/api/password-reset-requests', async (req, res) => {
  const { 
    employee_id, 
    first_name, 
    middle_name, 
    last_name, 
    department, 
    position_title 
  } = req.body;

  // 1. Basic Payload Validation
  if (!employee_id || !first_name || !last_name || !department || !position_title) {
    return res.status(400).json({ 
      error: "Missing required verification fields." 
    });
  }

  try {
    // 2. Verify identity against active records in dim_employee
    // Uses TRIM and ILIKE/UPPER to avoid false rejections due to capitalization or trailing spaces
    const checkUserQuery = `
      SELECT employee_key, department, position_title
      FROM public.dim_employee 
      WHERE UPPER(TRIM(employee_id)) = UPPER(TRIM($1))
        AND TRIM(first_name) ILIKE TRIM($2)
        AND TRIM(last_name) ILIKE TRIM($3)
        AND is_active = true
      LIMIT 1;
    `;
    
    const checkResult = await pool.query(checkUserQuery, [
      employee_id, 
      first_name, 
      last_name
    ]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ 
        error: "Employee details do not match our active records. Please check your credentials." 
      });
    }

    const matchedEmployee = checkResult.rows[0];

    // 3. Extract client IP address for security logging
    const requesterIp = 
      req.headers['x-forwarded-for']?.split(',')[0].trim() || 
      req.socket.remoteAddress || 
      null;

    // 4. Insert into the password_reset_requests table
    const insertRequestQuery = `
      INSERT INTO public.password_reset_requests (
        employee_id_input,
        employee_key,
        first_name,
        middle_name,
        last_name,
        department,
        position_title,
        status,
        requester_ip
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'Pending', $8)
      RETURNING request_id, requested_at;
    `;

    const insertResult = await pool.query(insertRequestQuery, [
      employee_id.trim(),
      matchedEmployee.employee_key,
      first_name.trim(),
      middle_name ? middle_name.trim() : null,
      last_name.trim(),
      department.trim(),
      position_title.trim(),
      requesterIp
    ]);

    return res.status(201).json({ 
      success: true, 
      message: "Password reset request submitted successfully.",
      requestId: insertResult.rows[0].request_id 
    });

  } catch (error) {
    console.error("Password reset error:", error);
    return res.status(500).json({ 
      error: "Internal server error processing password request." 
    });
  }
});

// ==========================================
// NOTIFICATIONS SYSTEM
// ==========================================

// GET: Fetch all notifications for a specific employee
app.get('/api/notifications/:employee_key', async (req, res) => {
    const { employee_key } = req.params;
    try {
        const query = `
            SELECT notification_id, title, message, type, related_id, is_read, created_at 
            FROM public.notifications 
            WHERE employee_key = $1 
            ORDER BY created_at DESC 
            LIMIT 20;
        `;
        const result = await pool.query(query, [employee_key]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ error: "Failed to fetch notifications." });
    }
});

// PATCH: Mark a single notification as read
app.patch('/api/notifications/:id/read', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query(`
            UPDATE public.notifications 
            SET is_read = true 
            WHERE notification_id = $1
        `, [id]);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error marking notification read:", error);
        res.status(500).json({ error: "Failed to update notification." });
    }
});

// PATCH: Mark all notifications as read for an employee
app.patch('/api/notifications/:employee_key/read-all', async (req, res) => {
    const { employee_key } = req.params;
    try {
        await pool.query(`
            UPDATE public.notifications 
            SET is_read = true 
            WHERE employee_key = $1 AND is_read = false
        `, [employee_key]);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error marking all notifications read:", error);
        res.status(500).json({ error: "Failed to clear notifications." });
    }
});

// GET: Fetch detailed attendance records by month
app.get('/api/attendance/:employee_key', async (req, res) => {
    const { employee_key } = req.params;
    const { month } = req.query; // Expected format: 'YYYY-MM'

    try {
        let monthFilter = '';
        let queryParams = [employee_key];

        // Apply month filtering if provided from the frontend picker
        if (month) {
            const [year, m] = month.split('-');
            // FIX: Added a space before AND so it doesn't crash the SQL query
            monthFilter = ` AND EXTRACT(YEAR FROM d.full_date) = $2 AND EXTRACT(MONTH FROM d.full_date) = $3`;
            queryParams.push(year, m);
        }

        // FIX: Cast employee_key to TEXT to ensure it matches the database schema
        const query = `
            SELECT 
                a.attendance_id,
                a.status,
                a.hours_worked,
                a.tardy_minutes,
                d.full_date
            FROM public.fact_attendance a
            JOIN public.dim_date d ON a.date_key = d.date_key
            WHERE a.employee_key::TEXT = $1::TEXT
            ${monthFilter}
            ORDER BY d.full_date DESC;
        `;
        
        const result = await pool.query(query, queryParams);

        // Transform data to populate the UI table format
        const records = result.rows.map(row => {
            const dateObj = new Date(row.full_date);
            const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            
            let timeIn = "08:00 AM";
            let timeOut = "05:00 PM";
            let remarks = "Biometric Verified";

            // Determine Time In/Out strings based on factual DW data
            if (row.status === 'Tardy' || row.tardy_minutes > 0) {
                const inHour = 8 + Math.floor(row.tardy_minutes / 60);
                const inMin = (row.tardy_minutes % 60).toString().padStart(2, '0');
                timeIn = `0${inHour}:${inMin} AM`;
                remarks = `Grace period exceeded (${row.tardy_minutes} mins)`;
            } else if (row.status === 'Absent') {
                timeIn = "—";
                timeOut = "—";
                remarks = "No record found";
            } else if (row.status === 'Leave') {
                timeIn = "—";
                timeOut = "—";
                remarks = "Approved Leave";
            }

            return {
                date: formattedDate,
                timeIn,
                timeOut,
                status: row.status,
                remarks: remarks,
                tardy_minutes: row.tardy_minutes
            };
        });

        res.status(200).json(records);
    } catch (error) {
        console.error("Attendance fetch error:", error);
        res.status(500).json({ error: "Failed to fetch attendance history." });
    }
});

// GET: Fetch dynamic high-level stats for the HOD Dashboard top cards
app.get('/api/department/stats', async (req, res) => {
    const { name } = req.query;
    
    if (!name) {
        return res.status(400).json({ error: "Department name is required" });
    }

    try {
        // 1. Total Active Employees in this specific department
        const empQuery = `
            SELECT COUNT(*) as total 
            FROM public.dim_employee 
            WHERE department = $1 AND is_active = true
        `;
        const empRes = await pool.query(empQuery, [name]);

        // 2. Total active Anomaly Alerts for this specific department
        const anomalyQuery = `
            SELECT a.risk_score 
            FROM public.fact_anomaly_alerts a
            JOIN public.dim_employee e ON a.employee_key = e.employee_key
            WHERE e.department = $1 AND a.status IN ('Flagged', 'Investigating')
        `;
        const anomalyRes = await pool.query(anomalyQuery, [name]);

        const anomalies = anomalyRes.rows;
        
        // Calculate High vs Medium Risk (Assuming 0.75+ is High Risk)
        const highRisk = anomalies.filter(a => parseFloat(a.risk_score) >= 0.75).length;
        const mediumRisk = anomalies.filter(a => parseFloat(a.risk_score) < 0.75).length;

        res.status(200).json({
            total_employees: parseInt(empRes.rows[0].total) || 0,
            total_anomalies: anomalies.length,
            high_risk: highRisk,
            medium_risk: mediumRisk
        });
    } catch (error) {
        console.error("Error fetching department stats:", error);
        res.status(500).json({ error: "Failed to fetch department stats" });
    }
});

// ==========================================
// LEAVE & ATTENDANCE ROUTES
// ==========================================

// 1. GET: Fetch leave applications for a specific department (For HOD Approvals)
app.get('/api/leave-applications/department', async (req, res) => {
    const { name } = req.query;

    if (!name) {
        return res.status(400).json({ error: "Department name is required" });
    }

    try {
        // Mapped exactly to your fact_leave_application columns!
        const query = `
            SELECT 
                f.id AS application_id, 
                f.start_date_key AS date_key, 
                f.created_at AS date_filed,
                f.leave_type, 
                f.start_date, 
                f.end_date, 
                f.remarks, 
                f.hod_remarks,
                f.working_days, 
                f.status,
                f.pdf_document,
                f.attachment_data,
                f.employee_key,
                f.position,         -- Pulled from fact_leave_application
                f.department,       -- Pulled from fact_leave_application
                e.first_name,
                e.last_name
            FROM public.fact_leave_application f
            JOIN public.dim_employee e ON f.employee_key = e.employee_key
            WHERE f.department = $1
            ORDER BY f.created_at DESC;
        `;
        const result = await pool.query(query, [name]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching department leave applications:", error.message);
        res.status(500).json({ error: `Database error: ${error.message}` });
    }
});

// 2. GET: Fetch ALL Leaves & Analytics Summary for Employee Leave History
app.get('/api/leave-applications/:employee_key', async (req, res) => {
    const { employee_key } = req.params;

    try {
        const historyQuery = `
            SELECT 
                f.id AS application_id, 
                f.start_date_key AS date_key, 
                f.created_at AS date_filed,
                f.leave_type, 
                f.start_date, 
                f.end_date, 
                f.remarks, 
                f.hod_remarks,
                f.working_days, 
                f.status, 
                f.created_at,
                f.pdf_document,
                f.attachment_data
            FROM public.fact_leave_application f
            WHERE f.employee_key = $1
            ORDER BY f.created_at DESC;
        `;
        const historyResult = await pool.query(historyQuery, [employee_key]);

        const summaryQuery = `
            SELECT leave_type, SUM(ABS(amount)) AS used_days
            FROM public.fact_leave_ledger
            WHERE employee_key = $1 AND transaction_type = 'Deduction'
            GROUP BY leave_type;
        `;
        const summaryResult = await pool.query(summaryQuery, [employee_key]);
        
        const summaryObj = {};
        summaryResult.rows.forEach(row => {
            summaryObj[row.leave_type] = { used: parseFloat(row.used_days) || 0 };
        });

        res.status(200).json({
            history: historyResult.rows,
            summary: summaryObj
        });
    } catch (error) {
        console.error("Error fetching employee leave data:", error.message);
        res.status(500).json({ error: `Database error: ${error.message}` });
    }
});

// PUT: Approve, Reject, or Require Revision for a leave request
app.put('/api/leave-applications/leave-approvals/:id', async (req, res) => {
    const { id } = req.params;
    const { action, remarks } = req.body; 
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Update the status and attach HOD remarks
        const updateQuery = `
            UPDATE public.fact_leave_application 
            SET status = $1, hod_remarks = $2 
            WHERE id = $3 
            RETURNING employee_key, leave_type, working_days;
        `;
        const result = await client.query(updateQuery, [action, remarks, id]);

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: "Leave application not found." });
        }

        // If Approved, correctly deduct the employee's leave balance in the ledger
        if (action === 'Approved') {
            const { employee_key, leave_type, working_days } = result.rows[0];

            // Record the deduction in the ledger
            await client.query(`
                INSERT INTO public.fact_leave_ledger 
                (employee_key, leave_type, transaction_type, amount, reference_id, remarks)
                VALUES ($1, $2, 'Deduction', $3, $4, 'Approved Leave Application')
            `, [employee_key, leave_type, -working_days, id]);

            // Adjust the actual remaining credits balance
            await client.query(`
                UPDATE public.leave_balances 
                SET remaining_credits = remaining_credits - $1,
                    last_updated = CURRENT_TIMESTAMP
                WHERE employee_key = $2 AND leave_type = $3
            `, [working_days, employee_key, leave_type]);
        }

        await client.query('COMMIT');
        res.status(200).json({ success: true, message: `Leave marked as ${action}` });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Leave approval transaction failed:", error);
        res.status(500).json({ error: "Failed to process leave approval." });
    } finally {
        client.release();
    }
});

// ==========================================
// ATTENDANCE: MANUAL & HARDWARE SYNC
// ==========================================

// POST: Manual Attendance Entry
app.post('/api/attendance/manual-entry', async (req, res) => {
    const { employeeKey, date, time, type } = req.body;

    const empKey = parseInt(employeeKey, 10);
    const punchType = parseInt(type, 10) || 0;

    if (!empKey || !date || !time) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Combine date and time into standard PostgreSQL timestamp
    const timestamp = `${date} ${time}:00`;

    try {
        const query = `
            INSERT INTO public.fact_attendance_log (employee_key, punch_time, punch_type, source) 
            VALUES ($1, $2, $3, 'Manual Entry')
        `;
        await pool.query(query, [empKey, timestamp, punchType]);
        
        res.status(200).json({ success: true, message: "Manual entry saved successfully." });
    } catch (error) {
        console.error("Manual Entry Error:", error);
        res.status(500).json({ error: "Failed to save manual attendance." });
    }
});

// POST: Upload NGTeco .dat File
app.post('/api/attendance/upload-dat', async (req, res) => {
    // req.body contains the raw text string because we added app.use(express.text())
    const rawText = req.body; 

    if (!rawText || typeof rawText !== 'string') {
        return res.status(400).json({ error: 'Invalid or missing file data' });
    }

    const lines = rawText.split('\n');
    const client = await pool.connect();

    try {
        await client.query('BEGIN'); // Start transaction

        for (let line of lines) {
            line = line.trim();
            if (!line) continue;

            // NGTeco .dat files are strictly tab-separated
            const parts = line.split('\t');

            if (parts.length >= 3) {
                const empKey = parseInt(parts[0].trim(), 10);
                const timestamp = parts[1].trim();
                const punchType = parseInt(parts[2].trim(), 10) || 0;

                if (!isNaN(empKey)) {
                    const query = `
                        INSERT INTO public.fact_attendance_log (employee_key, punch_time, punch_type, source) 
                        VALUES ($1, $2, $3, 'NGTeco Scanner')
                    `;
                    await client.query(query, [empKey, timestamp, punchType]);
                }
            }
        }

        await client.query('COMMIT'); // Save all rows safely
        res.status(200).json({ success: true, message: "Dat file processed successfully." });
    } catch (error) {
        await client.query('ROLLBACK'); // If anything fails, undo all inserts
        console.error('DAT Upload Error:', error);
        res.status(500).json({ error: "Failed to process attendance file." });
    } finally {
        client.release();
    }
});

// ==========================================
// DEPARTMENT ANALYTICS & REPORTS
// ==========================================

app.get('/api/reports/department', async (req, res) => {
    const { name } = req.query;
    
    // If the user is HR Admin, they might not pass a name (viewing global data). 
    // If they are a HOD, they will pass their department name.
    const deptFilter = name ? `WHERE department = $1` : '';
    const params = name ? [name] : [];

    try {
        // 1. Leave Distribution (Pie Chart Data)
        const distQuery = `
            SELECT leave_type, COUNT(*) as total
            FROM public.fact_leave_application
            ${deptFilter}
            GROUP BY leave_type;
        `;
        const distResult = await pool.query(distQuery, params);

        const totalLeaves = distResult.rows.reduce((sum, row) => sum + parseInt(row.total), 0);
        const distribution = distResult.rows.map(r => ({
            type: r.leave_type,
            percentage: totalLeaves > 0 ? Math.round((parseInt(r.total) / totalLeaves) * 100) : 0
        }));

        // 2. Monthly Trend (Stacked Bar Chart Data for Current Year)
        const trendQuery = `
            SELECT 
                TRIM(TO_CHAR(created_at, 'Mon')) as month_name, 
                EXTRACT(MONTH FROM created_at) as month_num,
                leave_type, 
                COUNT(*) as total
            FROM public.fact_leave_application
            ${name ? `WHERE department = $1 AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)` : `WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)`}
            GROUP BY TRIM(TO_CHAR(created_at, 'Mon')), EXTRACT(MONTH FROM created_at), leave_type
            ORDER BY month_num ASC;
        `;
        const trendResult = await pool.query(trendQuery, params);

        // Map into { 'Jan': { 'Sick Leave': 5, 'Vacation Leave': 2 }, 'Feb': ... }
        const monthlyData = {};
        trendResult.rows.forEach(r => {
            if (!monthlyData[r.month_name]) monthlyData[r.month_name] = {};
            monthlyData[r.month_name][r.leave_type] = parseInt(r.total);
        });

        res.status(200).json({
            distribution,
            monthlyData,
            anomaly: {
                peak: '94% Consistency',
                avgCheckIn: '07:51 AM'
            }
        });

    } catch (error) {
        console.error("Error generating department report:", error);
        res.status(500).json({ error: "Failed to generate analytics report." });
    }
});

// ==========================================
// WORKFORCE FORECAST & ANALYTICS (WITH ML ENGINE BRIDGE)
// ==========================================

app.get('/api/workforce-forecast', async (req, res) => {
    const { department } = req.query;
    
    const deptFilterEmp = department ? `WHERE department = $1 AND employment_status = 'Active'` : `WHERE employment_status = 'Active'`;
    const deptFilterLeave = department ? `AND department = $1` : ``;
    const params = department ? [department] : [];

    try {
        // 1. Get Total Active Staff
        const staffRes = await pool.query(`SELECT COUNT(*) as total FROM public.dim_employee ${deptFilterEmp}`, params);
        const totalStaff = parseInt(staffRes.rows[0].total) || 0;

        // 2. Get Pending Approvals count
        const pendingRes = await pool.query(`
            SELECT COUNT(*) as pending 
            FROM public.fact_leave_application 
            WHERE status = 'Pending' ${deptFilterLeave}
        `, params);
        const pendingLeaves = parseInt(pendingRes.rows[0].pending) || 0;

        // 3. Fetch SQL historical overlaps (Used as a fallback if Python ML is offline)
        const leavesQuery = `
            SELECT start_date, end_date, status 
            FROM public.fact_leave_application
            WHERE (status = 'Approved' OR status = 'Pending') 
              AND end_date >= CURRENT_DATE 
              AND start_date <= CURRENT_DATE + INTERVAL '30 days'
            ${deptFilterLeave};
        `;
        const leavesRes = await pool.query(leavesQuery, params);
        const activeLeaves = leavesRes.rows;

        // 4. 🔥 BRIDGE TO PYTHON ML ENGINE 🔥
        let mlPredictions = null;
        try {
            const pythonApiUrl = process.env.PYTHON_API_URL || 'http://127.0.0.1:5000';
            const mlResponse = await axios.get(`${pythonApiUrl}/api/forecast/workforce`, {
                params: { department: department || '' }
            });
            
            if (mlResponse.data && mlResponse.data.forecast) {
                mlPredictions = {}; // Convert array to a fast dictionary lookup
                mlResponse.data.forecast.forEach(item => {
                    mlPredictions[item.date] = item.predicted_absences;
                });
                console.log("✅ ML Engine Forecast applied successfully.");
            }
        } catch (mlError) {
            console.warn("⚠️ ML Engine offline. Falling back to SQL date overlaps.");
        }

        // 5. Calculate daily availability over 30 days
        const forecast = [];
        let onLeaveToday = 0;
        const requiredStaff = Math.ceil(totalStaff * 0.90); // 90% operational requirement

        const today = new Date();
        today.setHours(0,0,0,0);

        for (let i = 0; i < 30; i++) {
            const targetDate = new Date(today);
            targetDate.setDate(targetDate.getDate() + i);
            
            const isWeekend = targetDate.getDay() === 0 || targetDate.getDay() === 6;
            
            // Format date to YYYY-MM-DD to match Python output
            const yyyy = targetDate.getFullYear();
            const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
            const dd = String(targetDate.getDate()).padStart(2, '0');
            const targetDateStr = `${yyyy}-${mm}-${dd}`;
            
            let absences = 0;

            // 🧠 DECISION LOGIC: Use ML if available, otherwise fallback to SQL
            if (mlPredictions && mlPredictions[targetDateStr] !== undefined) {
                absences = mlPredictions[targetDateStr]; // Python Prophet Prediction
            } else {
                // SQL Overlap Fallback
                activeLeaves.forEach(leave => {
                    const s = new Date(leave.start_date);
                    const e = new Date(leave.end_date);
                    if (targetDate >= s && targetDate <= e && leave.status === 'Approved') {
                        absences++;
                    }
                });
            }

            if (i === 0) onLeaveToday = absences;

            const available = Math.max(0, totalStaff - absences);
            const percentage = totalStaff > 0 ? (available / totalStaff) * 100 : 100;

            forecast.push({
                dateStr: targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                isWeekend,
                available,
                absences,
                availablePercentage: isWeekend ? 100 : percentage // Assume full availability on weekends
            });
        }

        // 6. Generate Breakdowns and Alerts
        const breakdowns = [];
        const alerts = [];
        let suggestion = null;

        const criticalDays = forecast.filter(f => f.availablePercentage < 90 && !f.isWeekend);
        
        if (criticalDays.length > 0) {
            const firstCrit = criticalDays[0].dateStr;
            const lastCrit = criticalDays[criticalDays.length - 1].dateStr;
            
            breakdowns.push({
                dateRange: firstCrit === lastCrit ? firstCrit : `${firstCrit} -${lastCrit}`,
                available: criticalDays[0].available,
                required: requiredStaff,
                riskLevel: criticalDays[0].availablePercentage < 80 ? 'High' : 'Moderate'
            });

            alerts.push({
                type: criticalDays[0].availablePercentage < 80 ? 'critical' : 'warning',
                tag: 'Critical Dip',
                message: `Availability drops to ${Math.round(criticalDays[0].availablePercentage)}\% around${firstCrit}.`
            });

            suggestion = `For the ${firstCrit} risk period, deferring${requiredStaff - criticalDays[0].available} pending leave requests restores the minimum 90% operational requirement.`;
        }

        if (pendingLeaves > 3) {
            alerts.push({
                type: 'warning',
                tag: 'Concurrent Leaves',
                message: `${pendingLeaves} staff members have overlapping requested leaves.`
            });
        }

        res.status(200).json({
            totalStaff,
            availableToday: Math.max(0, totalStaff - onLeaveToday),
            onLeaveToday,
            pendingLeaves,
            forecast,
            breakdowns,
            alerts,
            suggestion
        });

    } catch (error) {
        console.error("Error generating workforce forecast:", error);
        res.status(500).json({ error: "Failed to generate workforce forecast." });
    }
});

// POST: Ask Python ML to scan for anomalies and save them to the database
app.post('/api/anomalies/run-ai-scan', async (req, res) => {
    try {
        const pythonApiUrl = process.env.PYTHON_API_URL || 'http://127.0.0.1:5000';
        
        // 1. Tell the Python Engine to run the Isolation Forest
        console.log("Triggering ML Anomaly Scan...");
        const mlResponse = await axios.get(`${pythonApiUrl}/api/detect-anomalies`);
        
        if (!mlResponse.data.anomalies || mlResponse.data.anomalies.length === 0) {
            return res.status(200).json({ success: true, message: "Scan complete. No new anomalies detected." });
        }

        const anomalies = mlResponse.data.anomalies;
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // 2. Loop through the AI's findings and save them to the database
            for (const anomaly of anomalies) {
                // Check if this exact anomaly pattern was already flagged recently to prevent spam
                const checkQuery = `
                    SELECT alert_id FROM public.fact_anomaly_alerts 
                    WHERE employee_key = $1 AND status IN ('Flagged', 'Investigating')
                `;
                const existing = await client.query(checkQuery, [anomaly.employee_key]);

                if (existing.rows.length === 0) {
                    const insertQuery = `
                        INSERT INTO public.fact_anomaly_alerts 
                        (employee_key, anomaly_pattern, risk_score, status) 
                        VALUES ($1, $2, $3, 'Flagged')
                    `;
                    await client.query(insertQuery, [
                        anomaly.employee_key, 
                        anomaly.anomaly_pattern, 
                        anomaly.risk_score
                    ]);
                }
            }

            await client.query('COMMIT');
            res.status(200).json({ 
                success: true, 
                message: `Scan complete. Found ${anomalies.length} potential anomalies.` 
            });

        } catch (dbError) {
            await client.query('ROLLBACK');
            throw dbError;
        } finally {
            client.release();
        }

    } catch (error) {
        // 🔴 ENHANCED DEBUGGING: Find out EXACTLY why the scan failed
        let errorMessage = error.message;
        
        if (error.response) {
            // Python API was reached, but Python crashed or sent an error
            errorMessage = `Python Engine Error: ${JSON.stringify(error.response.data)}`;
        } else if (error.request) {
            // Node.js couldn't reach Python AT ALL (Bad URL, trailing slash, or offline)
            errorMessage = `Could not connect to Python Engine at ${process.env.PYTHON_API_URL}. Is it offline?`;
        }
        console.error("ML Scan Error:", error.message);
        res.status(500).json({ error: "Failed to run AI Anomaly Scan." });
    }
});

// ==========================================
// ML ANOMALY DETECTION ALERTS
// ==========================================

// GET: Fetch Anomaly Alerts & Stats
app.get('/api/anomalies', async (req, res) => {
    const { department } = req.query;
    
    const deptFilter = department ? `WHERE e.department = $1 AND a.status IN ('Flagged', 'Investigating')` : `WHERE a.status IN ('Flagged', 'Investigating')`;
    const params = department ? [department] : [];

    try {
        // 1. Fetch active alerts
        const alertsQuery = `
            SELECT 
                a.alert_id, 
                a.anomaly_pattern, 
                a.risk_score, 
                a.status, 
                a.flagged_at, 
                e.first_name || ' ' || e.last_name AS employee_name,
                e.department
            FROM public.fact_anomaly_alerts a
            JOIN public.dim_employee e ON a.employee_key = e.employee_key
            ${deptFilter}
            ORDER BY a.risk_score DESC, a.flagged_at DESC;
        `;
        const alertsResult = await pool.query(alertsQuery, params);

        // 2. Calculate Stats
        const totalFlagged = alertsResult.rows.filter(r => r.status === 'Flagged').length;
        const highRisk = alertsResult.rows.filter(r => parseFloat(r.risk_score) >= 0.75).length;
        
        const resolvedFilter = department ? `WHERE e.department = $1 AND a.status = 'Resolved' AND EXTRACT(MONTH FROM a.resolved_at) = EXTRACT(MONTH FROM CURRENT_DATE)` : `WHERE a.status = 'Resolved' AND EXTRACT(MONTH FROM a.resolved_at) = EXTRACT(MONTH FROM CURRENT_DATE)`;
        
        const resolvedQuery = `
            SELECT COUNT(*) as resolved_count
            FROM public.fact_anomaly_alerts a
            JOIN public.dim_employee e ON a.employee_key = e.employee_key
            ${resolvedFilter};
        `;
        const resolvedResult = await pool.query(resolvedQuery, params);
        const resolvedThisMonth = parseInt(resolvedResult.rows[0].resolved_count) || 0;

        res.status(200).json({
            alerts: alertsResult.rows,
            stats: {
                totalFlagged,
                highRisk,
                resolvedThisMonth
            }
        });
    } catch (error) {
        console.error("Error fetching anomaly alerts:", error);
        res.status(500).json({ error: "Failed to fetch anomaly data." });
    }
});

// PUT: Update Anomaly Status (Investigate, Dismiss, Resolve)
app.put('/api/anomalies/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const timestampUpdate = (status === 'Dismissed' || status === 'Resolved') 
            ? `, resolved_at = CURRENT_TIMESTAMP` 
            : ``;

        const query = `
            UPDATE public.fact_anomaly_alerts 
            SET status = $1 ${timestampUpdate}
            WHERE alert_id = $2
        `;
        await pool.query(query, [status, id]);
        
        res.status(200).json({ success: true, message: `Anomaly marked as ${status}` });
    } catch (error) {
        console.error("Error updating anomaly status:", error);
        res.status(500).json({ error: "Failed to update anomaly status." });
    }
});

// ==========================================
// EMPLOYEE PROFILE & PAYROLL
// ==========================================

app.post('/api/salary/update', async (req, res) => {
    const { employee_key, salary_amount, salary_grade, reason } = req.body;
    const client = await pool.connect();

    try {
        await client.query('BEGIN'); 

        await client.query(`
            INSERT INTO public.salary_history 
            (employee_key, salary_amount, salary_grade, effective_date, reason)
            VALUES ($1, $2, $3, CURRENT_DATE, $4)
        `, [employee_key, salary_amount, salary_grade, reason]);

        await client.query(`
            UPDATE public.dim_employee 
            SET salary_grade = $1
            WHERE employee_key = $2
        `, [salary_grade, employee_key]);

        await client.query('COMMIT'); 
        res.status(200).json({ message: "Salary updated successfully" });
    } catch (error) {
        await client.query('ROLLBACK'); 
        res.status(500).json({ error: "Failed to update salary" });
    } finally {
        client.release();
    }
});

// GET: Unified Credit Ledger & Balance Data for Employee Dashboard
app.get('/api/credit-ledger/:employee_key', async (req, res) => {
    const { employee_key } = req.params;

    try {
        // 1. Fetch current balances
        const balanceQuery = `
            SELECT leave_type, remaining_credits 
            FROM public.leave_balances 
            WHERE employee_key = $1;
        `;
        const balances = await pool.query(balanceQuery, [employee_key]);

        // 2. Fetch used credits for the CURRENT YEAR
        const usedQuery = `
            SELECT leave_type, SUM(ABS(amount)) as used_days
            FROM public.fact_leave_ledger
            WHERE employee_key = $1 
              AND transaction_type = 'Deduction' 
              AND EXTRACT(YEAR FROM transaction_date) = EXTRACT(YEAR FROM CURRENT_DATE)
            GROUP BY leave_type;
        `;
        const used = await pool.query(usedQuery, [employee_key]);

        // 3. Fetch unified ledger history (Leave Applications + Monetizations)
        const historyQuery = `
            SELECT 
                created_at as date, 
                leave_type as type, 
                'Leave Application' as transaction, 
                status, 
                working_days as days, 
                'Department Head' as approver
            FROM public.fact_leave_application 
            WHERE employee_key = $1
            
            UNION ALL
            
            SELECT 
                request_date as date, 
                leave_type as type, 
                'Leave Monetization' as transaction, 
                status, 
                credits_converted as days, 
                'HR Admin' as approver
            FROM public.fact_leave_monetization 
            WHERE employee_key = $1
            
            ORDER BY date DESC;
        `;
        const history = await pool.query(historyQuery, [employee_key]);

        res.status(200).json({
            balances: balances.rows,
            used: used.rows,
            history: history.rows
        });
    } catch (error) {
        console.error("Error fetching credit ledger:", error);
        res.status(500).json({ error: "Failed to fetch credit ledger data." });
    }
});

// ==========================================
// LEAVE & ATTENDANCE ROUTES
// ==========================================

app.post('/api/leave/apply', async (req, res) => {
    const { 
        employee_key, leave_type, filingDate, start_date, 
        end_date, remarks, working_days, department, 
        position, salary, status, others_specify,
        vacation_spl_location, abroad_specify, sick_leave_type,
        illness_specify, study_leave_purpose, others_purpose, commutation,
        pdfBase64, attachments 
    } = req.body;

    try {
        const safeFilingDate = filingDate || new Date().toISOString().split('T')[0];
        const date_key = parseInt(safeFilingDate.replace(/-/g, ''), 10);
        
        // Convert the attachments array to a JSON string so it safely stores in the DB
        const attachmentsJson = attachments && attachments.length > 0 ? JSON.stringify(attachments) : null;

        const queryText = `
            INSERT INTO public.fact_leave_application 
            (
                employee_key, start_date_key, leave_type, start_date, end_date, 
                remarks, working_days, department, position, salary, status,
                others_specify, vacation_spl_location, abroad_specify,
                sick_leave_type, illness_specify, study_leave_purpose,
                others_purpose, commutation, pdf_document, attachment_data
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
            RETURNING id;
        `;
        
        const values = [
            employee_key, date_key, leave_type, start_date, end_date, 
            remarks || 'Filed via System', working_days, department, position, salary, status,
            others_specify, vacation_spl_location, abroad_specify,
            sick_leave_type, illness_specify, study_leave_purpose,
            others_purpose, commutation, pdfBase64, attachmentsJson
        ];

        await pool.query(queryText, values);
        
        res.status(201).json({ success: true, message: 'Application submitted successfully!' });
    } catch (error) {
        console.error("Database Insert Error:", error);
        res.status(500).json({ success: false, message: error.message || 'Failed to submit application.' });
    }
});

app.get('/api/leave/recent/:employee_key', async (req, res) => {
    const { employee_key } = req.params;

    try {
        const queryText = `
            SELECT date_key, leave_type, status, remarks 
            FROM public.fact_leave_application 
            WHERE employee_key = $1 
            ORDER BY date_key DESC 
            LIMIT 5
        `;
        const result = await pool.query(queryText, [employee_key]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching recent leaves:", error);
        res.status(500).json({ success: false, message: 'Failed to fetch data' });
    }
});

app.get('/api/attendance/summary/:employee_key', async (req, res) => {
  const { employee_key } = req.params;

  try {
    const queryText = `
      SELECT 
        COUNT(CASE WHEN status = 'Present' THEN 1 END) AS present_days,
        COUNT(*) AS total_days
      FROM public.fact_attendance
      WHERE employee_key = $1
    `;
    const result = await pool.query(queryText, [employee_key]);
    const stats = result.rows[0];
    
    const presentDays = parseInt(stats.present_days, 10) || 0;
    const totalDays = parseInt(stats.total_days, 10) || 0;
    const percentage = totalDays === 0 ? 0 : Math.round((presentDays / totalDays) * 100);

    res.status(200).json({ presentDays, percentage });

  } catch (error) {
    console.error("Database query error for attendance:", error);
    res.status(500).json({ success: false, message: 'Failed to retrieve attendance metrics' });
  }
});

// ==========================================
// HOD: LEAVE APPROVALS 
// ==========================================

app.get('/api/leave-approvals', async (req, res) => {
    try {
        const query = `
            SELECT 
                l.application_id AS id,
                e.first_name || ' ' || e.last_name AS name,
                e.department,
                l.leave_type AS type,
                l.status,
                l.start_date AS date,
                l.working_days
            FROM public.fact_leave_application l
            JOIN public.dim_employee e ON l.employee_key = e.employee_key
            ORDER BY 
                CASE WHEN l.status = 'Pending' THEN 1 ELSE 2 END,
                l.application_id DESC;
        `;
        const result = await pool.query(query);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching leave approvals:", error);
        res.status(500).json({ error: "Failed to fetch leave requests." });
    }
});

app.put('/api/leave-approvals/:id', async (req, res) => {
    const { id } = req.params;
    const { action } = req.body; 
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const updateQuery = `
            UPDATE public.fact_leave_application 
            SET status = $1 
            WHERE application_id = $2 
            RETURNING employee_key, leave_type, working_days;
        `;
        const result = await client.query(updateQuery, [action, id]);

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: "Leave application not found." });
        }

        if (action === 'Approved') {
            const { employee_key, leave_type, working_days } = result.rows[0];

            await client.query(`
                INSERT INTO public.fact_leave_ledger 
                (employee_key, leave_type, transaction_type, amount, reference_id, remarks)
                VALUES ($1, $2, 'Deduction', $3, $4, 'Approved Leave Application')
            `, [employee_key, leave_type, -working_days, id]);

            await client.query(`
                UPDATE public.leave_balances 
                SET remaining_credits = remaining_credits - $1,
                    last_updated = CURRENT_TIMESTAMP
                WHERE employee_key = $2 AND leave_type = $3
            `, [working_days, employee_key, leave_type]);
        }

        await client.query('COMMIT');
        res.status(200).json({ success: true, message: `Leave firmly ${action}` });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Leave approval transaction failed:", error);
        res.status(500).json({ error: "Failed to process leave approval." });
    } finally {
        client.release();
    }
});

// ==========================================
// HR DEPARTMENT MANAGEMENT
// ==========================================

// GET: Fetch all departments with live headcount and assigned Head
app.get('/api/departments', async (req, res) => {
    try {
        const query = `
            SELECT 
                d.department_id, 
                d.department_name, 
                d.max_capacity,
                (
                    SELECT COUNT(*) 
                    FROM public.dim_employee 
                    WHERE department = d.department_name 
                      AND employment_status = 'Active'
                ) AS current_headcount,
                (
                    SELECT first_name || ' ' || last_name 
                    FROM public.dim_employee 
                    WHERE department = d.department_name 
                      AND position_title ILIKE '%Head%' -- FIXED: Uses position_title instead of role
                    LIMIT 1
                ) AS head_name
            FROM public.dim_department d
            ORDER BY d.department_name ASC;
        `;
        const result = await pool.query(query);
        res.status(200).json(result.rows);
    } catch (error) {
        // Sending the exact database error to the browser for easier debugging!
        console.error("Error fetching departments:", error.message);
        res.status(500).json({ error: `Database error: ${error.message}` });
    }
});

// POST: Create a new department
app.post('/api/departments', async (req, res) => {
    const { department_id, department_name, max_capacity } = req.body;

    if (!department_id || !department_name || !max_capacity) {
        return res.status(400).json({ error: "Department code, name, and capacity are required." });
    }

    try {
        const query = `
            INSERT INTO public.dim_department 
            (department_id, department_name, max_capacity) 
            VALUES ($1, $2, $3) 
            RETURNING *;
        `;
        const values = [department_id.toUpperCase(), department_name, parseInt(max_capacity)];
        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Error creating department:", err);
        if (err.code === '23505') {
            return res.status(409).json({ error: "A department with this Code or Name already exists." });
        }
        res.status(500).json({ error: "Internal server error while creating department." });
    }
});

// PUT: Update an existing department
app.put('/api/departments/:id', async (req, res) => {
    const { id } = req.params;
    const { department_name, max_capacity } = req.body;

    try {
        const query = `
            UPDATE public.dim_department 
            SET department_name = $1, max_capacity = $2 
            WHERE department_id = $3 
            RETURNING *;
        `;
        const values = [department_name, parseInt(max_capacity), id];
        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Department not found." });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error("Error updating department:", err);
        res.status(500).json({ error: "Internal server error while updating department." });
    }
});

// ==========================================
// HR DASHBOARD METRICS
// ==========================================

app.get('/api/hr/dashboard-stats', async (req, res) => {
    try {
        // 1. Total Active Employees
        const empResult = await pool.query(`
            SELECT COUNT(*) as total 
            FROM public.dim_employee 
            WHERE is_active = true
        `);
        const totalWorkforce = parseInt(empResult.rows[0].total) || 0;

        // 2. Pending Profile Edits
        const profileResult = await pool.query(`
            SELECT COUNT(*) as pending 
            FROM public.profile_requests 
            WHERE status = 'Pending'
        `);
        const pendingEdits = parseInt(profileResult.rows[0].pending) || 0;

        // 3. Employees currently on leave (Approved and within current date window)
        const leaveResult = await pool.query(`
            SELECT COUNT(DISTINCT employee_key) as on_leave 
            FROM public.fact_leave_application 
            WHERE status = 'Approved' 
            AND CURRENT_DATE >= start_date 
            AND CURRENT_DATE <= end_date
        `);
        const onLeave = parseInt(leaveResult.rows[0].on_leave) || 0;

        res.status(200).json({
            totalWorkforce: totalWorkforce,
            activeEmployees: totalWorkforce - onLeave, // Total active minus those currently out
            onLeave: onLeave,
            pendingEdits: pendingEdits,
            anomalies: 18 // Static placeholder for UI layout until the anomaly engine is integrated
        });
    } catch (error) {
        console.error("Error fetching HR stats:", error);
        res.status(500).json({ error: "Failed to fetch HR dashboard stats" });
    }
});

// ==========================================
// EMPLOYEE DIRECTORY & ONBOARDING
// ==========================================

app.get('/api/employees', async (req, res) => {
    try {
        const query = `
            SELECT 
                employee_key, 
                employee_id, 
                first_name, 
                last_name, 
                department, 
                position_title 
            FROM public.dim_employee 
            WHERE is_active = true
            ORDER BY employee_key DESC;
        `;
        const result = await pool.query(query);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching employees:", error);
        res.status(500).json({ error: "Failed to fetch employee roster." });
    }
});

app.post('/api/employees', async (req, res) => {
    const { employee_id, first_name, last_name, department, position_title } = req.body;
    const client = await pool.connect();

    try {
        await client.query('BEGIN'); 

        const empQuery = `
            INSERT INTO public.dim_employee 
            (employee_id, first_name, last_name, department, position_title, is_active, hire_date) 
            VALUES ($1, $2, $3, $4, $5, true, CURRENT_DATE) 
            RETURNING employee_key;
        `;
        const empValues = [employee_id.toUpperCase(), first_name, last_name, department, position_title];
        const empResult = await client.query(empQuery, empValues);
        
        const newEmployeeKey = empResult.rows[0].employee_key;
        
        // Auto-generate a dummy email to satisfy the NOT NULL constraint in user_accounts
        const defaultEmail = `${employee_id.toLowerCase()}@lipacity.gov.ph`;
        const defaultPassword = 'City' + new Date().getFullYear();
        
        const accQuery = `
            INSERT INTO public.user_accounts 
            (employee_key, username, password, system_access_level, email) 
            VALUES ($1, $2, $3, 'Employee Self-Service', $4);
        `;
        const accValues = [newEmployeeKey, employee_id.toLowerCase(), defaultPassword, defaultEmail];
        await client.query(accQuery, accValues);
        
        const onboardQuery = `
            INSERT INTO public.onboarding_tasks 
            (employee_key, target_start_date, setup_status, it_provisioning_done, documents_submitted) 
            VALUES ($1, CURRENT_DATE + INTERVAL '14 days', 'Pending Setup', false, false);
        `;
        await client.query(onboardQuery, [newEmployeeKey]);

        await client.query('COMMIT'); 
        res.status(201).json({ success: true, message: "Employee onboarded successfully." });
        
    } catch (error) {
        await client.query('ROLLBACK'); 
        console.error("Error onboarding employee:", error);
        
        if (error.code === '23505') {
            return res.status(409).json({ error: "An employee with this ID already exists." });
        }
        res.status(500).json({ error: "Internal server error during onboarding." });
    } finally {
        client.release();
    }
});

app.put('/api/employees/:key', async (req, res) => {
    const { key } = req.params;
    const { first_name, last_name, department, position_title } = req.body;

    try {
        const query = `
            UPDATE public.dim_employee 
            SET first_name = $1, last_name = $2, department = $3, position_title = $4 
            WHERE employee_key = $5 
            RETURNING *;
        `;
        const values = [first_name, last_name, department, position_title, key];
        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Employee not found." });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Error updating employee:", error);
        res.status(500).json({ error: "Failed to update employee profile." });
    }
});

// ==========================================
// PAYROLL & LEAVE MONETIZATION
// ==========================================

// GET: Payroll Dashboard Metrics
app.get('/api/payroll/stats', async (req, res) => {
    try {
        // Calculate Total Disbursed (Where status is 'Credited')
        const disbursedQuery = `
            SELECT SUM(calculated_amount) as total_disbursed 
            FROM public.fact_leave_monetization 
            WHERE status = 'Credited'
        `;
        const disbursedResult = await pool.query(disbursedQuery);
        const totalDisbursed = disbursedResult.rows[0].total_disbursed || 0;

        // Calculate Pending Requests
        const pendingQuery = `
            SELECT COUNT(*) as pending_count 
            FROM public.fact_leave_monetization 
            WHERE status = 'Pending Review'
        `;
        const pendingResult = await pool.query(pendingQuery);
        const pendingCount = pendingResult.rows[0].pending_count || 0;

        res.status(200).json({
            disbursed: parseFloat(totalDisbursed),
            pending: parseInt(pendingCount)
        });
    } catch (error) {
        console.error("Error fetching payroll stats:", error);
        res.status(500).json({ error: "Failed to fetch payroll statistics." });
    }
});

// GET /api/payroll/records
app.get('/api/payroll/records', async (req, res) => {
  try {
    const query = `
      SELECT 
        p.payroll_ref_code,
        e.first_name || ' ' || e.last_name AS employee_name,
        e.department,
        e.position_title,
        p.base_salary,
        p.deductions,
        p.net_pay,
        p.status,
        TO_CHAR(p.pay_period_start, 'Mon DD') || '–' || TO_CHAR(p.pay_period_end, 'DD') AS pay_period
      FROM public.fact_payroll p
      JOIN public.dim_employee e ON p.employee_key = e.employee_key
      ORDER BY p.payroll_id DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching payroll records:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET: Full Monetization Ledger
app.get('/api/payroll/monetizations', async (req, res) => {
    try {
        // Join the monetization requests with employee details
        const query = `
            SELECT 
                m.monetization_id,
                m.leave_type,
                m.credits_converted,
                m.calculated_amount,
                m.status,
                m.request_date,
                e.first_name,
                e.last_name,
                e.department
            FROM public.fact_leave_monetization m
            JOIN public.dim_employee e ON m.employee_key = e.employee_key
            ORDER BY m.request_date DESC;
        `;
        const result = await pool.query(query);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching monetization ledger:", error);
        res.status(500).json({ error: "Failed to fetch monetization records." });
    }
});

// ==========================================
// PROFILE EDIT REQUESTS
// ==========================================

app.get('/api/profile-requests', async (req, res) => {
    try {
        const query = `
            SELECT 
                r.request_id AS id,
                e.first_name || ' ' || e.last_name AS employee,
                r.field_to_change AS field,
                r.old_value,
                r.new_value,
                r.proof_document_path,
                r.status,
                r.request_date
            FROM public.profile_requests r
            JOIN public.dim_employee e ON r.employee_key = e.employee_key
            ORDER BY 
                CASE WHEN r.status = 'Pending' THEN 1 ELSE 2 END, 
                r.request_date DESC;
        `;
        const result = await pool.query(query);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching profile requests:", error);
        res.status(500).json({ error: "Failed to fetch profile requests." });
    }
});

app.put('/api/profile-requests/:id', async (req, res) => {
    const { id } = req.params;
    const { action, reviewer_key } = req.body; 

    try {
        const query = `
            UPDATE public.profile_requests 
            SET status = $1, reviewed_by_key = $2, reviewed_date = CURRENT_TIMESTAMP 
            WHERE request_id = $3 
            RETURNING *;
        `;
        const values = [action, reviewer_key || null, id];
        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Request not found." });
        }

        res.status(200).json({ success: true, message: `Request ${action}` });
    } catch (error) {
        console.error("Error updating request status:", error);
        res.status(500).json({ error: "Failed to update request status." });
    }
});

// ==========================================
// ONBOARDING TRACKER
// ==========================================

app.get('/api/onboarding', async (req, res) => {
    try {
        const query = `
            SELECT 
                o.onboarding_id, 
                e.first_name || ' ' || e.last_name AS employee_name, 
                e.department, 
                e.position_title, 
                o.target_start_date, 
                o.setup_status, 
                o.it_provisioning_done, 
                o.documents_submitted 
            FROM public.onboarding_tasks o
            JOIN public.dim_employee e ON o.employee_key = e.employee_key
            ORDER BY o.onboarding_id DESC;
        `;
        const result = await pool.query(query);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching onboarding records:", error);
        res.status(500).json({ error: "Failed to fetch onboarding tracker data." });
    }
});

app.put('/api/onboarding/:id', async (req, res) => {
    const { id } = req.params;
    const { it_provisioning_done, documents_submitted, setup_status } = req.body;

    try {
        const query = `
            UPDATE public.onboarding_tasks 
            SET it_provisioning_done = $1, documents_submitted = $2, setup_status = $3 
            WHERE onboarding_id = $4 
            RETURNING *;
        `;
        const values = [it_provisioning_done, documents_submitted, setup_status, id];
        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Onboarding record not found." });
        }
        res.status(200).json({ success: true, message: "Checklist updated successfully." });
    } catch (error) {
        console.error("Error updating checklist:", error);
        res.status(500).json({ error: "Failed to update checklist." });
    }
});

// GET: Fetch live PostgreSQL Database Metrics
app.get('/api/database/metrics', async (req, res) => {
    try {
        // 1. Get total database storage size
        const sizeRes = await pool.query(`SELECT pg_size_pretty(pg_database_size(current_database())) AS total_storage`);

        // 2. Get active and max connections
        const connRes = await pool.query(`SELECT count(*) AS active_connections FROM pg_stat_activity`);
        const maxConnRes = await pool.query(`SHOW max_connections`);

        // 3. Get top tables by size and row count
        const tablesRes = await pool.query(`
            SELECT 
                relname AS name,
                n_live_tup AS rows,
                pg_size_pretty(pg_total_relation_size(relid)) AS size,
                -- Generating a mocked bloat percentage for dashboard visuals 
                -- (Real Postgres bloat calculation requires heavy external extensions)
                ROUND((RANDOM() * 2.5)::numeric, 1) || '%' AS bloat,
                'Healthy' AS status
            FROM pg_stat_user_tables
            ORDER BY pg_total_relation_size(relid) DESC
            LIMIT 10;
        `);

        res.status(200).json({
            totalStorage: sizeRes.rows[0].total_storage,
            activeConnections: connRes.rows[0].active_connections,
            maxConnections: maxConnRes.rows[0].max_connections,
            tables: tablesRes.rows
        });
    } catch (error) {
        console.error("Error fetching database metrics:", error);
        res.status(500).json({ error: "Failed to fetch database metrics." });
    }
});



// ==========================================
// API GATEWAY TRAFFIC LOGGER (Middleware)
// ==========================================
const apiTrafficLogs = [];

// Intercept all incoming requests
app.use((req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        // Only track /api/ routes to avoid logging static images or frontend files
        if (req.originalUrl.startsWith('/api')) {
            const duration = Date.now() - start;
            
            const newLog = {
                id: Date.now().toString() + Math.random().toString(36).substring(7),
                time: new Date().toLocaleTimeString('en-GB', { hour12: false }), // HH:MM:SS
                method: req.method,
                endpoint: req.originalUrl.split('?')[0], // Clean URL without query params
                status: res.statusCode,
                latency: duration >= 1000 ? `${(duration / 1000).toFixed(1)}s` : `${duration}ms`,
                latencyMs: duration // Keep raw number for math averages
            };
            
            // Add to the beginning of the array
            apiTrafficLogs.unshift(newLog);
            
            // Keep memory clean by only storing the last 50 requests
            if (apiTrafficLogs.length > 50) {
                apiTrafficLogs.pop();
            }
        }
    });
    next();
});

// GET: Expose the live logs to the IT Dashboard
app.get('/api/gateway/logs', (req, res) => {
    res.status(200).json(apiTrafficLogs);
});

// ==========================================
// IT OPERATIONS: ROLE MANAGEMENT (RBAC)
// ==========================================

// GET: Fetch all users and their roles
app.get('/api/roles', async (req, res) => {
    try {
        const query = `
            SELECT 
                a.username,
                e.employee_id AS id,
                e.first_name || ' ' || e.last_name AS name,
                e.department AS dept,
                a.system_access_level AS "currentRole",
                CASE WHEN e.is_active = true THEN 'Active' ELSE 'Suspended' END AS status
            FROM public.user_accounts a
            JOIN public.dim_employee e ON a.employee_key = e.employee_key
            ORDER BY 
                CASE WHEN a.system_access_level = 'Disabled' THEN 2 ELSE 1 END,
                e.last_name ASC;
        `;
        const result = await pool.query(query);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching roles:", error);
        res.status(500).json({ error: "Failed to fetch accounts." });
    }
});

// PUT: Update user system_access_level
app.put('/api/roles/:username', async (req, res) => {
    const { username } = req.params;
    const { role, updated_by } = req.body;
    
    try {
        const query = `
            UPDATE public.user_accounts 
            SET system_access_level = $1 
            WHERE username = $2 
            RETURNING username, system_access_level;
        `;
        const result = await pool.query(query, [role, username]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Account not found." });
        }
        
        // FUNCTIONAL UPDATE: Trigger Audit Log automatically if setting is enabled!
        await logAuditAction("Role Changed", username, `Role updated to ${role}`, updated_by);

        res.status(200).json({ success: true, message: "Role updated successfully." });
    } catch (error) {
        console.error("Error updating role:", error);
        res.status(500).json({ error: "Failed to update role." });
    }
});

app.put('/api/profile/:employee_key', async (req, res) => {
  const { employee_key } = req.params;
  const { first_name, middle_name, last_name, civil_status, contact_number, email, updated_by } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const updateEmployeeQuery = `
      UPDATE public.dim_employee 
      SET first_name = $1, middle_name = $2, last_name = $3, civil_status = $4
      WHERE employee_key = $5
    `;
    await client.query(updateEmployeeQuery, [first_name, middle_name, last_name, civil_status, employee_key]);

    const updateAccountQuery = `
      UPDATE public.user_accounts 
      SET contact_number = $1, email = $2
      WHERE employee_key = $3
    `;
    await client.query(updateAccountQuery, [contact_number, email, employee_key]);

    await client.query('COMMIT');
    
    // FUNCTIONAL UPDATE: Trigger Audit Log automatically!
    await logAuditAction("Profile Edited", employee_key, `Profile and contact info updated`, updated_by);

    res.status(200).json({ success: true, message: 'Profile updated successfully.' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Profile update error:", error);
    res.status(500).json({ success: false, message: 'Failed to update profile data' });
  } finally {
    client.release();
  }
});

// ==========================================
// IT DASHBOARD: PASSWORD RESET MANAGEMENT
// ==========================================

// GET: Fetch all password reset requests for the IT Dashboard
app.get('/api/password-reset-requests', async (req, res) => {
    try {
        const query = `
            SELECT 
                request_id,
                employee_key,
                employee_id_input,
                first_name,
                middle_name,
                last_name,
                department,
                position_title,
                status,
                requested_at
            FROM public.password_reset_requests
            ORDER BY 
                CASE WHEN status = 'Pending' THEN 1 ELSE 2 END,
                requested_at DESC;
        `;
        const result = await pool.query(query);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching password reset requests:", error);
        res.status(500).json({ error: "Failed to fetch password reset requests." });
    }
});

// PUT: Approve request, generate Temp Password, and update User Account
app.put('/api/password-reset-requests/:id/approve', async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // 1. Get the requested record to find the employee_key
        const reqQuery = await client.query(
            'SELECT employee_key FROM public.password_reset_requests WHERE request_id = $1', 
            [id]
        );
        
        if (reqQuery.rows.length === 0) throw new Error('Request not found');
        
        const employeeKey = reqQuery.rows[0].employee_key;
        if (!employeeKey) throw new Error('Cannot approve an unmatched request automatically.');

        // 2. Generate a Temporary Password (e.g., Temp@8392)
        const tempPassword = `Temp@${Math.floor(1000 + Math.random() * 9000)}`;
        
        // 3. Update the actual employee's password in user_accounts
        await client.query(
            `UPDATE public.user_accounts SET password = $1 WHERE employee_key = $2`, 
            [tempPassword, employeeKey]
        );
        
        // 4. Mark the request as Approved
        await client.query(
            `UPDATE public.password_reset_requests 
             SET status = 'Approved', resolved_at = CURRENT_TIMESTAMP 
             WHERE request_id = $1`, 
            [id]
        );
        
        await client.query('COMMIT');
        
        // Send the temporary password back to the frontend to show in the modal
        res.status(200).json({ success: true, tempPassword });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error approving password reset:", error);
        res.status(500).json({ message: error.message || "Failed to approve request." });
    } finally {
        client.release();
    }
});

// PUT: Reject the password reset request
app.put('/api/password-reset-requests/:id/reject', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query(`
            UPDATE public.password_reset_requests 
            SET status = 'Rejected', resolved_at = CURRENT_TIMESTAMP 
            WHERE request_id = $1
        `, [id]);
        
        res.status(200).json({ success: true, message: "Request rejected." });
    } catch (error) {
        console.error("Error rejecting password reset:", error);
        res.status(500).json({ message: "Failed to reject request." });
    }
});

// ==========================================
// SYSTEM SETTINGS & CONFIGURATION
// ==========================================

// GET: Fetch System Configurations
app.get('/api/system-settings', async (req, res) => {
    try {
        const result = await pool.query('SELECT setting_key, setting_value FROM public.system_settings');
        // Convert rows [{setting_key: 'x', setting_value: 'y'}] into a single object {x: 'y'}
        const settingsObj = result.rows.reduce((acc, row) => {
            acc[row.setting_key] = row.setting_value;
            return acc;
        }, {});
        res.status(200).json(settingsObj);
    } catch (error) {
        console.error("Error fetching settings:", error);
        res.status(500).json({ error: "Failed to fetch settings." });
    }
});

// PUT: Bulk Update System Configurations
app.put('/api/system-settings', async (req, res) => {
    const settings = req.body;
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        for (const [key, value] of Object.entries(settings)) {
            if (key !== 'updated_by') {
                await client.query(
                    `UPDATE public.system_settings 
                     SET setting_value = $1, updated_at = CURRENT_TIMESTAMP, updated_by = $2 
                     WHERE setting_key = $3`,
                    [value, settings.updated_by || null, key]
                );
            }
        }
        
        await client.query('COMMIT');

        // Restart the ML Background Sync Timer whenever settings change!
        if (typeof setupMlSyncTimer === 'function') {
            setupMlSyncTimer(); 
        }

        res.status(200).json({ success: true, message: "Settings updated successfully." });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error saving settings:", error);
        res.status(500).json({ error: "Failed to save settings." });
    } finally {
        client.release();
    }
});

// POST: Simulated Action Handlers for IT Danger Zone
app.post('/api/system-action/:action', async (req, res) => {
    const { action } = req.params;
    
    // Simulate server processing time (1.5 seconds)
    setTimeout(() => {
        console.log(`IT Operation executed: [${action.toUpperCase()}]`);
        res.status(200).json({ success: true, message: `${action} executed successfully.` });
    }, 1500);
});

// ==========================================
// BACKGROUND TASKS (ML INTERVAL FUNCTION)
// ==========================================
let mlSyncTimer = null;

const setupMlSyncTimer = async () => {
    try {
        const intRes = await pool.query("SELECT setting_value FROM public.system_settings WHERE setting_key = 'ml_interval'");
        const hours = intRes.rows.length > 0 ? parseInt(intRes.rows[0].setting_value) : 24;
        
        if (mlSyncTimer) clearInterval(mlSyncTimer);
        console.log(`[System Task] ML Analytics Background Sync initialized to every ${hours} hours.`);
        
        const intervalMs = hours * 60 * 60 * 1000;
        
        // This timer will automatically trigger the Python scan behind the scenes
        mlSyncTimer = setInterval(async () => {
            console.log(`[System Task] Executing scheduled Automated ML Scan...`);
            try {
                const pythonApiUrl = process.env.PYTHON_API_URL || 'http://127.0.0.1:5000';
                await axios.get(`${pythonApiUrl}/api/detect-anomalies`);
            } catch (e) {
                console.log(`[System Task] Python ML Engine offline. Scheduled scan skipped.`);
            }
        }, intervalMs);
        
    } catch (error) {
        console.error("Failed to setup ML background timer:", error);
    }
};

// MOBILE APP

const { GoogleGenerativeAI } = require('@google/generative-ai');

// POST: Secure bridge for the Flutter app's AI Assistant
app.post('/api/ai/chat', async (req, res) => {
    const { message } = req.body;
    
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            systemInstruction: "You are an HR assistant for LEAP-A, a Human Capital Management system for Lipa City personnel. Be helpful, concise, and professional. You help users navigate their leave balances, training events, and HR rules."
        });

        const result = await model.generateContent(message);
        const responseText = result.response.text();
        
        res.status(200).json({ success: true, text: responseText });
    } catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({ success: false, text: "Sorry, I am having trouble connecting to the AI service right now." });
    }
});

// ==========================================
// HR OPERATIONS: HIRING (SUCCESSION/PROMOTION)
// ==========================================

// GET: All vacancies (department head is inactive or missing)
app.get('/api/succession/vacancies', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT d.department_id, d.department_name, d.department_head_key,
                   e.first_name, e.last_name, e.is_active
            FROM public.dim_department d
            LEFT JOIN public.dim_employee e ON e.employee_key = d.department_head_key
            WHERE e.is_active = false OR d.department_head_key IS NULL
        `);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching vacancies:", error);
        res.status(500).json({ error: "Failed to fetch vacancies." });
    }
});

// GET: Seniority-ranked shortlist for a department, with any existing offer status
app.get('/api/succession/shortlist/:departmentId', async (req, res) => {
    const { departmentId } = req.params;
    try {
        const result = await pool.query(`
            SELECT e.employee_key, e.first_name, e.last_name, e.position_title,
                   e.hire_date,
                   EXTRACT(YEAR FROM AGE(NOW(), e.hire_date)) AS years_of_service,
                   so.offer_id, so.status AS offer_status, so.offer_rank
            FROM public.dim_employee e
            LEFT JOIN public.succession_offer so
              ON so.employee_key = e.employee_key AND so.department_id = $1
            WHERE e.department = (SELECT department_name FROM public.dim_department WHERE department_id = $1)
              AND e.is_active = true
            ORDER BY e.hire_date ASC
        `, [departmentId]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching shortlist:", error);
        res.status(500).json({ error: "Failed to fetch shortlist." });
    }
});

// POST: Create an offer (used to send the first offer manually)
app.post('/api/succession/offer', async (req, res) => {
    const { department_id, employee_key, offer_rank } = req.body;
    try {
        const result = await pool.query(`
            INSERT INTO public.succession_offer (department_id, employee_key, offer_rank, status, offered_date)
            VALUES ($1, $2, $3, 'Offered', NOW())
            RETURNING *
        `, [department_id, employee_key, offer_rank]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error creating offer:", error);
        res.status(500).json({ error: "Failed to create offer." });
    }
});

// POST: Accept/decline an offer — declining auto-offers the next candidate
app.post('/api/succession/respond/:offerId', async (req, res) => {
    const { offerId } = req.params;
    const { status } = req.body; // 'Accepted' or 'Declined'
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const offerResult = await client.query(
            `SELECT * FROM public.succession_offer WHERE offer_id = $1`,
            [offerId]
        );
        const offer = offerResult.rows[0];
        if (!offer) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Offer not found' });
        }

        await client.query(
            `UPDATE public.succession_offer SET status = $1, responded_date = NOW() WHERE offer_id = $2`,
            [status, offerId]
        );

        if (status === 'Accepted') {
            await client.query(
                `UPDATE public.dim_department SET department_head_key = $1 WHERE department_id = $2`,
                [offer.employee_key, offer.department_id]
            );
            await client.query('COMMIT');
            return res.status(200).json({ success: true, message: 'Offer accepted, department head updated.' });
        }

        if (status === 'Declined') {
            const nextResult = await client.query(`
                SELECT e.employee_key
                FROM public.dim_employee e
                WHERE e.department = (SELECT department_name FROM public.dim_department WHERE department_id = $1)
                  AND e.is_active = true
                  AND e.employee_key NOT IN (
                      SELECT employee_key FROM public.succession_offer WHERE department_id = $1
                  )
                ORDER BY e.hire_date ASC
                LIMIT 1
            `, [offer.department_id]);

            if (nextResult.rows.length > 0) {
                const nextCandidate = nextResult.rows[0];
                const nextOffer = await client.query(`
                    INSERT INTO public.succession_offer (department_id, employee_key, offer_rank, status, offered_date)
                    VALUES ($1, $2, $3, 'Offered', NOW())
                    RETURNING *
                `, [offer.department_id, nextCandidate.employee_key, offer.offer_rank + 1]);

                await client.query('COMMIT');
                return res.status(200).json({ success: true, message: 'Declined. Next candidate offered.', nextOffer: nextOffer.rows[0] });
            } else {
                await client.query('COMMIT');
                return res.status(200).json({
                    success: true,
                    message: 'Declined. No more candidates — position open to external hiring.',
                    status: 'Open - External'
                });
            }
        }

        await client.query('COMMIT');
        res.status(200).json({ success: true, message: 'Status updated.' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error responding to offer:", error);
        res.status(500).json({ error: "Failed to respond to offer." });
    } finally {
        client.release();
    }
});

// ==========================================
// SUCCESSION & OPEN POSITIONS API ROUTES
// ==========================================

// 1. GET OPEN POSITIONS (Employee View)
app.get('/api/succession/open-positions', async (req, res) => {
  try {
    const query = `
      SELECT 
        svs.department_id,
        d.department_name,
        svs.status AS vacancy_stage,
        svs.updated_at
      FROM succession_vacancy_status svs
      JOIN dim_department d ON svs.department_id = d.department_id
      WHERE svs.status = 'Open - External' OR svs.status = 'Open - Internal'
      ORDER BY svs.updated_at DESC;
    `;
    const result = await db.query(query); // Replace db with your pg pool or client
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching open positions:", err);
    res.status(500).json({ error: "Failed to fetch open positions." });
  }
});

// 2. POST APPLY TO A VACANCY (Employee View)
app.post('/api/succession/apply', async (req, res) => {
  const { department_id, employee_key } = req.body;

  if (!department_id || !employee_key) {
    return res.status(400).json({ error: "Department ID and Employee Key are required." });
  }

  try {
    const insertQuery = `
      INSERT INTO succession_application (department_id, employee_key, status)
      VALUES ($1, $2, 'Applied')
      RETURNING *;
    `;
    const result = await db.query(insertQuery, [department_id, employee_key]);
    res.status(201).json({ message: "Application submitted successfully!", application: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') { // Unique constraint violation (already applied)
      return res.status(400).json({ error: "You have already applied for this position." });
    }
    console.error("Error submitting application:", err);
    res.status(500).json({ error: "Failed to submit application." });
  }
});

// 3. GET APPLICANTS FOR A DEPARTMENT (HR View - hiring.jsx)
app.get('/api/succession/applicants/:departmentId', async (req, res) => {
  const { departmentId } = req.params;

  try {
    const query = `
      SELECT 
        sa.application_id,
        sa.department_id,
        sa.employee_key,
        sa.status,
        sa.applied_date,
        e.first_name,
        e.last_name,
        e.email,
        d.department_name AS current_department
      FROM succession_application sa
      JOIN dim_employee e ON sa.employee_key = e.employee_key
      LEFT JOIN dim_department d ON e.department_id = d.department_id
      WHERE sa.department_id = $1
      ORDER BY sa.applied_date ASC;
    `;
    const result = await db.query(query, [departmentId]);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching applicants:", err);
    res.status(500).json({ error: "Failed to fetch applicants." });
  }
});

// 4. PUT DECISION ON APPLICANT (HR View - hiring.jsx)
app.put('/api/succession/applicants/:applicationId/decision', async (req, res) => {
  const { applicationId } = req.params;
  const { decision, department_id } = req.body; // decision: 'Appointed' or 'Rejected'

  if (!['Appointed', 'Rejected'].includes(decision)) {
    return res.status(400).json({ error: "Invalid decision value." });
  }

  try {
    // Update candidate application status
    const updateAppQuery = `
      UPDATE succession_application 
      SET status = $1 
      WHERE application_id = $2 
      RETURNING *;
    `;
    const appResult = await db.query(updateAppQuery, [decision, applicationId]);

    // If appointed, close the vacancy stage in succession_vacancy_status
    if (decision === 'Appointed' && department_id) {
      await db.query(`
        UPDATE succession_vacancy_status 
        SET status = 'Filled', updated_at = NOW() 
        WHERE department_id = $1;
      `, [department_id]);
    }

    res.json({ message: `Applicant ${decision.toLowerCase()} successfully!`, application: appResult.rows[0] });
  } catch (err) {
    console.error("Error updating applicant status:", err);
    res.status(500).json({ error: "Failed to update decision." });
  }
});

// 5. UPDATE RESPOND TO OFFER (Modifies stage to 'Open - External' when internal list is exhausted)
app.post('/api/succession/respond/:offerId', async (req, res) => {
  const { offerId } = req.params;
  const { response, department_id } = req.body; // response: 'Accepted' or 'Declined'

  try {
    if (response === 'Accepted') {
      // Mark offer as accepted and vacancy filled
      await db.query(`UPDATE succession_vacancy_status SET status = 'Filled', updated_at = NOW() WHERE department_id = $1;`, [department_id]);
      return res.json({ message: "Offer accepted. Position filled." });
    } else {
      // Check if more internal candidates remain; if exhausted, set to 'Open - External'
      await db.query(`
        INSERT INTO succession_vacancy_status (department_id, status, updated_at)
        VALUES ($1, 'Open - External', NOW())
        ON CONFLICT (department_id) 
        DO UPDATE SET status = 'Open - External', updated_at = NOW();
      `, [department_id]);

      return res.json({ message: "Offer declined. Position status set to Open - External." });
    }
  } catch (err) {
    console.error("Error processing response:", err);
    res.status(500).json({ error: "Failed to process offer response." });
  }
});

// Start listening for API calls
app.listen(PORT, () => {
  console.log(`Node.js server executing on http://localhost:${PORT}`);
  setupMlSyncTimer(); // Boot up the background task manager!
});
