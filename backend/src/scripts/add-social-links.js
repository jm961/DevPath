const pool = require("../config/database");

async function addSocialLinks() {
  console.log("🔧 Adding social links columns to users table...");

  try {
    // Add social links columns if they don't exist
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS github VARCHAR(500),
      ADD COLUMN IF NOT EXISTS linkedin VARCHAR(500),
      ADD COLUMN IF NOT EXISTS twitter VARCHAR(500),
      ADD COLUMN IF NOT EXISTS website VARCHAR(500);
    `);

    console.log("✅ Social links columns added successfully!");
    console.log("\n✨ Migration complete!\n");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

addSocialLinks();
