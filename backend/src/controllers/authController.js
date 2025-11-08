const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");

// Generate JWT token
const generateToken = (userId, email) => {
  return jwt.sign({ userId, email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Sign up
exports.signup = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        status: 400,
        message: "Email and password are required",
      });
    }

    // Check if user exists
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "User already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = await pool.query(
      "INSERT INTO users (email, password_hash, name, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id, email, name",
      [email, hashedPassword, name || null]
    );

    const user = result.rows[0];
    const token = generateToken(user.id, user.email);

    res.status(201).json({
      status: "ok",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      status: 500,
      message: "Server error during signup",
    });
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        status: 400,
        message: "Email and password are required",
      });
    }

    // Get user
    const result = await pool.query(
      "SELECT id, email, name, password_hash FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        status: 401,
        message: "Invalid credentials",
      });
    }

    const user = result.rows[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        status: 401,
        message: "Invalid credentials",
      });
    }

    const token = generateToken(user.id, user.email);

    res.json({
      status: "ok",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      status: 500,
      message: "Server error during login",
    });
  }
};

// Get current user
exports.me = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, name, github, linkedin, twitter, website, created_at FROM users WHERE id = $1",
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
      });
    }

    const user = result.rows[0];

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      links: {
        github: user.github,
        linkedin: user.linkedin,
        twitter: user.twitter,
        website: user.website,
      },
      created_at: user.created_at,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      status: 500,
      message: "Server error",
    });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  const { name, github, linkedin, twitter, website } = req.body;

  try {
    await pool.query(
      "UPDATE users SET name = $1, github = $2, linkedin = $3, twitter = $4, website = $5, updated_at = NOW() WHERE id = $6",
      [
        name,
        github || null,
        linkedin || null,
        twitter || null,
        website || null,
        req.userId,
      ]
    );

    res.json({
      status: "ok",
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      status: 500,
      message: "Server error",
    });
  }
};

// Update password
exports.updatePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    // Get current password
    const result = await pool.query(
      "SELECT password_hash FROM users WHERE id = $1",
      [req.userId]
    );

    const user = result.rows[0];

    // Verify old password
    const isValidPassword = await bcrypt.compare(
      oldPassword,
      user.password_hash
    );

    if (!isValidPassword) {
      return res.status(400).json({
        status: 400,
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [
      hashedPassword,
      req.userId,
    ]);

    res.json({
      status: "ok",
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Update password error:", error);
    res.status(500).json({
      status: 500,
      message: "Server error",
    });
  }
};
