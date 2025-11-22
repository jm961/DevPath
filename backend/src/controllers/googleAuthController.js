const pool = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/**
 * Handle OAuth callback from Supabase (Google, GitHub, etc.)
 * This endpoint receives user data from the frontend after Supabase OAuth
 */
const oauthCallback = async (req, res) => {
  try {
    const { email, name, provider } = req.body;

    if (!email) {
      return res.status(400).json({
        status: 400,
        message: "Email is required",
      });
    }

    // Check if user exists
    const userQuery = "SELECT * FROM users WHERE email = $1";
    const { rows } = await pool.query(userQuery, [email]);

    let user;

    if (rows.length > 0) {
      // User exists, update their info if needed
      user = rows[0];

      // Update name if it's different
      if (name && user.name !== name) {
        const updateQuery =
          "UPDATE users SET name = $1 WHERE id = $2 RETURNING *";
        const updateResult = await pool.query(updateQuery, [name, user.id]);
        user = updateResult.rows[0];
      }
    } else {
      // Create new user
      const insertQuery = `
        INSERT INTO users (email, name, password_hash, created_at)
        VALUES ($1, $2, $3, NOW())
        RETURNING id, email, name, created_at
      `;

      // For OAuth users, we set a random password hash they can't use
      // They can only log in via OAuth
      const randomPassword = require("crypto").randomBytes(32).toString("hex");
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      const insertResult = await pool.query(insertQuery, [
        email,
        name || email.split("@")[0],
        hashedPassword,
      ]);

      user = insertResult.rows[0];
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.json({
      status: "ok",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("OAuth callback error:", error);
    res.status(500).json({
      status: 500,
      message: "Authentication failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Keep backward compatibility
const googleCallback = oauthCallback;

module.exports = {
  oauthCallback,
  googleCallback,
};
