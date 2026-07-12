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
        e.full_name,
        e.department,
        e.position_title,
        e.civil_status
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
        full_name: activeUser.full_name,
        department: activeUser.department,
        role: activeUser.system_access_level,
        civil_status: activeUser.civil_status
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
  const { full_name, civil_status, contact_number, email } = req.body;

  // Get a client from the pool to run a multi-query transaction
  const client = await pool.connect();

  try {
    // Start Transaction
    await client.query('BEGIN');

    // 1. Update dim_employee table
    const updateEmployeeQuery = `
      UPDATE public.dim_employee 
      SET full_name = $1, civil_status = $2
      WHERE employee_key = $3
    `;
    await client.query(updateEmployeeQuery, [full_name, civil_status, employee_key]);

    // 2. Update dim_accounts table
    const updateAccountQuery = `
      UPDATE public.dim_accounts 
      SET contact_number = $1, email = $2
      WHERE employee_key = $3
    `;
    await client.query(updateAccountQuery, [contact_number, email, employee_key]);

    // Commit Transaction to save changes permanently
    await client.query('COMMIT');

    res.status(200).json({ 
      success: true, 
      message: 'Profile records updated seamlessly across tables.' 
    });

  } catch (error) {
    // If anything fails, roll back everything so data doesn't get corrupted
    await client.query('ROLLBACK');
    console.error("Profile update transaction error:", error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update profile data',
      error: error.message 
    });
  } finally {
    // Always release the database client back to the pool
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
        e.employee_key,
        e.full_name,
        e.department,
        e.position_title,
        e.civil_status
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
      message: 'Google login successful!',
      user: {
        username: activeUser.username,
        email: activeUser.email,
        contact_number: activeUser.contact_number,
        employee_key: activeUser.employee_key,
        full_name: activeUser.full_name,
        department: activeUser.department,
        role: activeUser.system_access_level,
        civil_status: activeUser.civil_status
      }
    });

  } catch (error) {
    console.error("Google SSO route runtime error:", error);
    res.status(500).json({ success: false, message: "Internal server error handling Google verification processing." });
  }
});

// Start listening for API calls
app.listen(PORT, () => {
  console.log(`Node.js server executing on http://localhost:${PORT}`);
});