const { Pool } = require("pg");
require("dotenv").config();

// Prefer DATABASE_URL if provided (e.g., Supabase, Render, Railway),
// otherwise fall back to individual connection params.
const useConnectionString = !!process.env.DATABASE_URL;

const pool = new Pool(
  useConnectionString
    ? {
        connectionString: process.env.DATABASE_URL,
        // Most managed Postgres (including Supabase) require SSL.
        // For Supabase specifically, SSL is required; rejectUnauthorized=false
        // avoids needing a CA bundle in many managed environments.
        ssl:
          process.env.NODE_ENV === "production"
            ? { rejectUnauthorized: false }
            : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      }
    : {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        // Production optimizations
        max: 20, // Maximum pool size
        idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
        connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
        ssl:
          process.env.NODE_ENV === "production"
            ? { rejectUnauthorized: false } // Enable SSL in production (adjust based on your DB provider)
            : false,
      }
);

// Test connection
pool.on("connect", () => {
  if (process.env.NODE_ENV !== "production") {
    console.log("✅ Database connected");
  }
});

pool.on("error", (err) => {
  console.error("❌ Unexpected database error:", err);
  process.exit(-1);
});

module.exports = pool;
