const pool = require("../config/database");

async function resetDatabase() {
  console.log("🗑️  Resetting database...");

  try {
    // Drop tables
    await pool.query("DROP TABLE IF EXISTS user_progress CASCADE;");
    console.log("✅ Dropped user_progress table");

    await pool.query("DROP TABLE IF EXISTS users CASCADE;");
    console.log("✅ Dropped users table");

    console.log("\n✨ Database reset complete!");
    console.log("Run 'npm run init-db' to recreate tables\n");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Database reset failed:", error);
    process.exit(1);
  }
}

resetDatabase();

