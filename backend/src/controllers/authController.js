const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Load admin configuration from environment variables
const ADMIN_USER = (process.env.ADMIN_USERNAME || 'suraj').toLowerCase().trim();
const ADMIN_HASH = process.env.ADMIN_PASSWORD_HASH || '$2b$10$Eamv0IR5AIHly4BA.wfeWOg8o1POUEAX5owpvt1gEygqig6QhFeTu';
const JWT_SECRET = process.env.JWT_SECRET || '9799f45376c83a8f0d3ffa613cf4cbb0c9856b887c0d2c9dcf75450b225a59ea';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '2h';

/**
 * Handle user sign-in
 * Securely validates credentials using bcrypt and issues HttpOnly JWT cookie
 */
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const cleanUser = String(username).toLowerCase().trim();
    const cleanPass = String(password).trim();

    // Verify against authorized administrator credentials
    if (cleanUser !== ADMIN_USER) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const isMatch = await bcrypt.compare(cleanPass, ADMIN_HASH);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const userPayload = {
      username: ADMIN_USER,
      role: process.env.ADMIN_ROLE || 'ADMIN',
      name: process.env.ADMIN_NAME || 'Suraj (PZ7550)',
      email: process.env.ADMIN_EMAIL || 'suraj-v@adityabirla.com',
      company: 'UltraTech Cement Ltd. - Unit Birla White'
    };

    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // Store in HttpOnly, Secure, SameSite=Strict cookie
    res.cookie('bw_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'lax' for local dev, 'none' with secure for cross-site if needed
      maxAge: 2 * 60 * 60 * 1000 // 2 hours
    });

    res.json({
      success: true,
      user: userPayload,
      token // Also returned in body for non-cookie SPA clients
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Authentication failed due to server error' });
  }
};

/**
 * Handle user sign-out
 * Clears HttpOnly session cookie
 */
exports.logout = (req, res) => {
  res.clearCookie('bw_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });
  res.json({ success: true, message: 'Logged out successfully' });
};

/**
 * Verify currently authenticated session
 */
exports.me = (req, res) => {
  // Populated by requireAuth middleware
  res.json({
    authenticated: true,
    user: req.user
  });
};
