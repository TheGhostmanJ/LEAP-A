const path = require('path');
// 1. Load the .env file located one folder up from this file
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg'); // <-- 2. ESSENTIAL: Imports the PG Pool class

const app = express();
const PORT = process.env.PORT || 3001;

// 3. ESSENTIAL: Defines the 'pool' variable globally in this file
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test database connection on startup
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring database client:', err.stack);
  }
  console.log('Successfully connected to the PostgreSQL database.');
  release();
});

// Middleware Configurations
app.use(cors());                  
app.use(express.json());          

// Base Verification Route
app.get('/api/health', async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend server is running smoothly.',
  });
});

// --- LOGIN ROUTE ---
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Uses the globally defined 'pool' variable above
   const queryText = `
      SELECT 
        a.username, 
        a.email, 
        a.system_access_level,
        a.contact_number,
        a.password,
        e.employee_key,
        e.employee_id,
        e.first_name,        -- REPLACED full_name
        e.middle_name,       -- NEW
        e.last_name,         -- NEW
        e.department,
        e.position_title,
        e.civil_status,
        e.date_of_birth,
        e.gender,
        e.salary_grade,
        (SELECT salary_amount 
     FROM public.dim_salary_history 
     WHERE employee_key = e.employee_key 
     ORDER BY effective_date DESC 
     LIMIT 1) AS current_salary_amount,
        e.hire_date,
        e.employment_type,
        e.civil_service_eligibility,
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, e.hire_date)) AS years_of_service
      FROM public.dim_accounts a
      INNER JOIN public.dim_employee e ON a.employee_key = e.employee_key
      WHERE a.username = $1
    `;

    const userQuery = await pool.query(queryText, [username]);
    
    if (userQuery.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid username or password' 
      });
    }

    const activeUser = userQuery.rows[0];

    if (activeUser.password !== password) { 
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid username or password' 
      });
    }

    // Further down inside the same route on success:
    res.status(200).json({
      success: true,
      message: 'Login successful!',
      user: {
        username: activeUser.username,
        email: activeUser.email,
        contact_number: activeUser.contact_number,
        employee_key: activeUser.employee_key,
        employee_id: activeUser.employee_id,
        // --- REPLACE full_name WITH THESE 3 LINES ---
        first_name: activeUser.first_name,
        middle_name: activeUser.middle_name,
        last_name: activeUser.last_name,
        // --------------------------------------------
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
    res.status(500).json({ 
      success: false, 
      message: error.message // Keeps raw database error visibility active for debugging
    });
  }
});

app.put('/api/profile/:employee_key', async (req, res) => {
  const { employee_key } = req.params;
  // Destructure the separated names instead of full_name
  const { first_name, middle_name, last_name, civil_status, contact_number, email } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Update dim_employee table with the 3 separate name columns
    const updateEmployeeQuery = `
      UPDATE public.dim_employee 
      SET first_name = $1, middle_name = $2, last_name = $3, civil_status = $4
      WHERE employee_key = $5
    `;
    await client.query(updateEmployeeQuery, [first_name, middle_name, last_name, civil_status, employee_key]);

    // Update dim_accounts table
    const updateAccountQuery = `
      UPDATE public.dim_accounts 
      SET contact_number = $1, email = $2
      WHERE employee_key = $3
    `;
    await client.query(updateAccountQuery, [contact_number, email, employee_key]);

    await client.query('COMMIT');
    res.status(200).json({ success: true, message: 'Profile updated successfully.' });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Profile update error:", error);
    res.status(500).json({ success: false, message: 'Failed to update profile data' });
  } finally {
    client.release();
  }
});

// --- GOOGLE SINGLE-SIGN-ON AUTHENTICATION ROUTE ---
app.post('/api/login/google', async (req, res) => {
  const { token } = req.body;

  try {
    // 1. Send token to Google's public token verification API
    const googleVerifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`;
    const googleResponse = await fetch(googleVerifyUrl);
    const googleUserData = await googleResponse.json();

    if (!googleResponse.ok) {
      return res.status(401).json({ success: false, message: "Invalid Google token payload validation." });
    }

    // Google returns the user's verified email address as 'email'
    const googleEmail = googleUserData.email;

    // 2. Check if this specific email address exists inside your public.dim_accounts database
    const queryText = `
      SELECT 
        a.username, 
        a.email, 
        a.system_access_level,
        a.contact_number,
        a.password,
        e.employee_key,
        e.employee_id,
        e.first_name,        -- REPLACED full_name
        e.middle_name,       -- NEW
        e.last_name,         -- NEW
        e.department,
        e.position_title,
        e.civil_status,
        e.date_of_birth,
        e.gender,
        e.salary_grade,
        (SELECT salary_amount 
     FROM public.dim_salary_history 
     WHERE employee_key = e.employee_key 
     ORDER BY effective_date DESC 
     LIMIT 1) AS current_salary_amount,
        e.hire_date,
        e.employment_type,
        e.civil_service_eligibility,
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, e.hire_date)) AS years_of_service
      FROM public.dim_accounts a
      INNER JOIN public.dim_employee e ON a.employee_key = e.employee_key
      WHERE a.email = $1
    `;
    const result = await pool.query(queryText, [googleEmail]);

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: `The Google account (${googleEmail}) is not linked to any active employee profile account records.` 
      });
    }

    const activeUser = result.rows[0];

    // 3. Return the exact same user object context format back to your React layout state engine!
    res.status(200).json({
      success: true,
      message: 'Login successful!',
      user: {
        username: activeUser.username,
        email: activeUser.email,
        contact_number: activeUser.contact_number,
        employee_key: activeUser.employee_key,
        employee_id: activeUser.employee_id,
        // --- REPLACE full_name WITH THESE 3 LINES ---
        first_name: activeUser.first_name,
        middle_name: activeUser.middle_name,
        last_name: activeUser.last_name,
        // --------------------------------------------
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
    console.error("Google SSO route runtime error:", error);
    res.status(500).json({ success: false, message: "Internal server error handling Google verification processing." });
  }
});

app.post('/api/leave/apply', async (req, res) => {
    // 1. Destructure with default values
    const { 
        employee_key, leave_type, filingDate, start_date, 
        end_date, remarks, working_days, department, 
        position, salary, status 
    } = req.body;

    try {
        // 2. Safety check: Use current date if filingDate is missing
        const safeFilingDate = filingDate || new Date().toISOString().split('T')[0];
        const date_key = parseInt(safeFilingDate.replace(/-/g, ''), 10);

        const queryText = `
            INSERT INTO public.fact_leave_application 
            (
                employee_key, date_key, leave_type, start_date, end_date, 
                remarks, working_days, department, position, salary, status
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `;
        
        await pool.query(queryText, [
            employee_key, date_key, leave_type, start_date, end_date, 
            remarks, working_days, department, position, salary, status
        ]);
        
        res.status(201).json({ success: true, message: 'Application submitted!' });
    } catch (error) {
        console.error("Database Insert Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// --- FETCH RECENT LEAVE APPLICATIONS ---
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

// --- ATTENDANCE SUMMARY ROUTE ---
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
    
    // Parse counts (Postgres returns counts as strings)
    const presentDays = parseInt(stats.present_days, 10) || 0;
    const totalDays = parseInt(stats.total_days, 10) || 0;
    
    // Calculate percentage safely to avoid division by zero
    const percentage = totalDays === 0 ? 0 : Math.round((presentDays / totalDays) * 100);

    res.status(200).json({ 
      presentDays, 
      percentage 
    });

  } catch (error) {
    console.error("Database query error for attendance:", error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve attendance metrics' 
    });
  }
});

// Logic for your approval route (pseudocode)
const approveLeave = async (application_id, employee_key, days_used, type) => {
    // 1. Record the deduction in the Ledger
    await pool.query(`
        INSERT INTO public.fact_leave_ledger 
        (employee_key, leave_type, transaction_type, amount, reference_id, remarks)
        VALUES ($1, $2, 'Deduction', $3, $4, 'Approved Leave Application')
    `, [employee_key, type, -days_used, application_id]);

    // 2. Update the Balance Table
    await pool.query(`
        UPDATE public.dim_leave_balance 
        SET remaining_credits = remaining_credits - $1,
            last_updated = CURRENT_TIMESTAMP
        WHERE employee_key = $2 AND leave_type = $3
    `, [days_used, employee_key, type]);
};

// Inside your app.post('/api/salary/update')
app.post('/api/salary/update', async (req, res) => {
    const { employee_key, salary_amount, salary_grade, reason } = req.body;
    const client = await pool.connect();

    try {
        await client.query('BEGIN'); // Start transaction

        // 1. Insert into history (The Audit Ledger)
        await client.query(`
            INSERT INTO public.dim_salary_history 
            (employee_key, salary_amount, salary_grade, effective_date, reason)
            VALUES ($1, $2, $3, CURRENT_DATE, $4)
        `, [employee_key, salary_amount, salary_grade, reason]);

        // 2. Update the "Active" salary in the employee table (The State)
        await client.query(`
            UPDATE public.dim_employee 
            SET current_salary_amount = $1, current_salary_grade = $2
            WHERE employee_key = $3
        `, [salary_amount, salary_grade, employee_key]);

        await client.query('COMMIT'); // Save both
        res.status(200).json({ message: "Salary updated successfully" });
    } catch (error) {
        await client.query('ROLLBACK'); // If anything fails, undo everything
        res.status(500).json({ error: "Failed to update salary" });
    } finally {
        client.release();
    }
});

// Add this to your Express backend routes
app.get('/api/departments', async (req, res) => {
    try {
        const query = `
            SELECT 
                d.department_id AS id,
                d.department_name AS name,
                COALESCE(e.first_name || ' ' || e.last_name, 'Unassigned') AS head,
                d.max_capacity AS max,
                -- Subquery to dynamically count active employees assigned to this department
                (
                    SELECT COUNT(*)::integer 
                    FROM dim_employee e2 
                    WHERE e2.department = d.department_name 
                    AND e2.is_active = true
                ) AS headcount
            FROM public.dim_department d
            LEFT JOIN public.dim_employee e ON d.department_head_key = e.employee_key
            ORDER BY d.department_id ASC;
        `;
        
        const result = await pool.query(query); // Assuming you are using 'pg' pool
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching departments:", err);
        res.status(500).json({ error: "Internal server error retrieving organizational structure." });
    }
});

// POST: Create a new department
app.post('/api/departments', async (req, res) => {
    const { department_id, department_name, max_capacity } = req.body;

    // Basic validation
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
        // Catch PostgreSQL unique constraint violation (duplicate ID or Name)
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
// EMPLOYEE MANAGEMENT ROUTES
// ==========================================

// GET: Fetch all active employees for the directory
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

// POST: Onboard a new employee (Multi-table Transaction)
app.post('/api/employees', async (req, res) => {
    const { employee_id, first_name, last_name, department, position_title } = req.body;
    
    // Check out a client directly from the pool to handle the transaction
    const client = await pool.connect();

    try {
        await client.query('BEGIN'); 

        // 1. Insert into dim_employee (The core profile)
        const empQuery = `
            INSERT INTO public.dim_employee 
            (employee_id, first_name, last_name, department, position_title, is_active, hire_date) 
            VALUES ($1, $2, $3, $4, $5, true, CURRENT_DATE) 
            RETURNING employee_key;
        `;
        const empValues = [employee_id.toUpperCase(), first_name, last_name, department, position_title];
        const empResult = await client.query(empQuery, empValues);
        
        // Grab the newly generated primary key to link the account
        const newEmployeeKey = empResult.rows[0].employee_key;

        // 2. Generate a default system account in dim_accounts
        // Automatically formats the username to lowercase (e.g., emp-2026-001)
        const defaultPassword = 'City' + new Date().getFullYear(); // e.g., City2026
        const accQuery = `
            INSERT INTO public.dim_accounts 
            (employee_key, username, password, system_access_level) 
            VALUES ($1, $2, $3, 'Employee Self-Service');
        `;
        const accValues = [newEmployeeKey, employee_id.toLowerCase(), defaultPassword];
        await client.query(accQuery, accValues);

        await client.query('COMMIT'); 
        res.status(201).json({ success: true, message: "Employee onboarded successfully." });
        
    } catch (error) {
        await client.query('ROLLBACK'); 
        console.error("Error onboarding employee:", error);
        
        // Catch duplicate Employee IDs
        if (error.code === '23505') {
            return res.status(409).json({ error: "An employee with this ID already exists." });
        }
        res.status(500).json({ error: "Internal server error during onboarding." });
    } finally {
        client.release();
    }
});

// PUT: Update an existing employee profile
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
// PROFILE EDIT REQUESTS ROUTES
// ==========================================

// GET: Fetch all profile edit requests
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
            FROM public.fact_profile_request r
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

// PUT: Approve or Reject a profile edit request
app.put('/api/profile-requests/:id', async (req, res) => {
    const { id } = req.params;
    const { action, reviewer_key } = req.body; // 'Approved' or 'Rejected'

    try {
        const query = `
            UPDATE public.fact_profile_request 
            SET status = $1, reviewed_by_key = $2, reviewed_date = CURRENT_TIMESTAMP 
            WHERE request_id = $3 
            RETURNING *;
        `;
        // Pass the reviewer's employee_key if available, otherwise null
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


// Start listening for API calls
app.listen(PORT, () => {
  console.log(`Node.js server executing on http://localhost:${PORT}`);
});