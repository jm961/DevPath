const pool = require("../config/database");

async function initDatabase() {
  console.log("🔧 Initializing database...");

  try {
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ Users table created");

    // Create user_progress table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        resource_type VARCHAR(50) NOT NULL,
        resource_id VARCHAR(100) NOT NULL,
        topic_id VARCHAR(100) NOT NULL,
        completed_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, resource_type, resource_id, topic_id)
      );
    `);
    console.log("✅ User progress table created");

    // Create indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_progress_user_id 
      ON user_progress(user_id);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_progress_resource 
      ON user_progress(user_id, resource_type, resource_id);
    `);
    console.log("✅ Indexes created");

    console.log("\n✨ Database initialization complete!\n");
    process.exit(0);
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    process.exit(1);
  }
}

initDatabase();
