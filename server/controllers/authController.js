const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { JWT_SECRET } = require('../middleware/auth');

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate a signed JWT token
 */
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * POST /api/auth/register
 */
async function register(req, res) {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Full name is required.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, error: 'Email address is required.' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, error: 'Please provide a valid email address.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
    }
    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ success: false, error: 'Passwords do not match.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check existing email
    const existingResult = await db.query('SELECT id FROM users WHERE email = $1', [cleanEmail]);
    if (existingResult.rowCount > 0) {
      return res.status(409).json({
        success: false,
        error: 'An account with this email address already exists. Please login instead.'
      });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Default role is USER for public registration
    const newUserResult = await db.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, is_active, created_at`,
      [name.trim(), cleanEmail, passwordHash, 'USER']
    );

    const newUser = newUserResult.rows[0];

    // Initialize default preferences
    await db.query(
      `INSERT INTO user_preferences (user_id, default_city, alert_aqi_threshold, email_notifications, push_notifications)
       VALUES ($1, $2, $3, $4, $5)`,
      [newUser.id, 'Chennai', 100, true, false]
    );

    // Initial favorite city
    await db.query(
      `INSERT INTO favorite_cities (user_id, city)
       VALUES ($1, $2)`,
      [newUser.id, 'Chennai']
    );

    // Audit log
    await db.query(
      `INSERT INTO audit_logs (user_id, action, details, ip_address)
       VALUES ($1, $2, $3, $4)`,
      [newUser.id, 'USER_REGISTER', `New user registered: ${cleanEmail}`, req.ip || '127.0.0.1']
    );

    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to EcoSense.',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isActive: newUser.is_active,
        createdAt: newUser.created_at
      }
    });
  } catch (err) {
    console.error('[Auth Controller] Registration error:', err);
    return res.status(500).json({ success: false, error: 'Registration failed due to a server error.' });
  }
}

/**
 * POST /api/auth/login
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Both email and password are required.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Query user
    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [cleanEmail]);
    if (userResult.rowCount === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.'
      });
    }

    const user = userResult.rows[0];

    if (user.is_active === false) {
      return res.status(403).json({
        success: false,
        error: 'Your EcoSense account has been deactivated. Please contact support.'
      });
    }

    // Compare bcrypt hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.'
      });
    }

    // Audit log
    await db.query(
      `INSERT INTO audit_logs (user_id, action, details, ip_address)
       VALUES ($1, $2, $3, $4)`,
      [user.id, 'USER_LOGIN', `User logged in: ${user.email} (${user.role})`, req.ip || '127.0.0.1']
    );

    const token = generateToken(user);

    return res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.is_active,
        createdAt: user.created_at
      }
    });
  } catch (err) {
    console.error('[Auth Controller] Login error:', err);
    return res.status(500).json({ success: false, error: 'Login failed due to a server error.' });
  }
}

/**
 * GET /api/auth/me
 */
async function getMe(req, res) {
  try {
    const userId = req.user.id;

    // Fetch user details
    const userResult = await db.query('SELECT id, name, email, role, is_active, created_at, updated_at FROM users WHERE id = $1', [userId]);
    if (userResult.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    const user = userResult.rows[0];

    // Fetch preferences
    let preferences = null;
    const prefResult = await db.query('SELECT * FROM user_preferences WHERE user_id = $1', [userId]);
    if (prefResult.rowCount > 0) {
      preferences = prefResult.rows[0];
    } else {
      preferences = {
        default_city: 'Chennai',
        alert_aqi_threshold: 100,
        email_notifications: true,
        push_notifications: false
      };
    }

    // Fetch favorite cities
    const favResult = await db.query('SELECT city FROM favorite_cities WHERE user_id = $1', [userId]);
    const favorites = favResult.rows.map(r => r.city);

    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.is_active,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      },
      preferences,
      favorites
    });
  } catch (err) {
    console.error('[Auth Controller] getMe error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve user profile.' });
  }
}

/**
 * PUT /api/auth/profile
 */
async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Name cannot be empty.' });
    }

    const updated = await db.query('UPDATE users SET name = $1 WHERE id = $2 RETURNING id, name, email, role', [name.trim(), userId]);

    await db.query(
      `INSERT INTO audit_logs (user_id, action, details, ip_address)
       VALUES ($1, $2, $3, $4)`,
      [userId, 'PROFILE_UPDATE', `User updated name to: ${name.trim()}`, req.ip || '127.0.0.1']
    );

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: updated.rows[0]
    });
  } catch (err) {
    console.error('[Auth Controller] updateProfile error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update profile.' });
  }
}

/**
 * PUT /api/auth/change-password
 */
async function changePassword(req, res) {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Current password and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'New password must be at least 6 characters.' });
    }

    const userResult = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Current password is incorrect.' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, userId]);

    await db.query(
      `INSERT INTO audit_logs (user_id, action, details, ip_address)
       VALUES ($1, $2, $3, $4)`,
      [userId, 'PASSWORD_CHANGE', 'User changed their password', req.ip || '127.0.0.1']
    );

    return res.json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (err) {
    console.error('[Auth Controller] changePassword error:', err);
    return res.status(500).json({ success: false, error: 'Failed to change password.' });
  }
}

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword
};
