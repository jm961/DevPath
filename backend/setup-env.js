#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function setup() {
  console.log("\n🔧 DevPath Backend Environment Setup\n");

  const envPath = path.join(__dirname, ".env");

  if (fs.existsSync(envPath)) {
    const answer = await question(
      "⚠️  .env file already exists. Overwrite? (y/N): "
    );
    if (answer.toLowerCase() !== "y") {
      console.log("Setup cancelled.");
      rl.close();
      return;
    }
  }

  console.log("\n📝 Database Configuration\n");
  console.log(
    "You can either provide a single DATABASE_URL (e.g., from Supabase) or enter individual parameters.\n"
  );
  const useUrl = (await question("Use DATABASE_URL? (Y/n): ")) || "y";

  let dbSection = "";
  if (useUrl.toLowerCase() === "y") {
    const databaseUrl = await question("DATABASE_URL: ");
    dbSection += `# Database Configuration (connection string)\nDATABASE_URL=${databaseUrl}\n`;
  } else {
    const dbHost =
      (await question("Database host (localhost): ")) || "localhost";
    const dbPort = (await question("Database port (5432): ")) || "5432";
    const dbName =
      (await question("Database name (devpath_db): ")) || "devpath_db";
    const dbUser = (await question("Database user (postgres): ")) || "postgres";
    const dbPassword = await question("Database password: ");
    dbSection += `# Database Configuration (individual params)\nDB_HOST=${dbHost}\nDB_PORT=${dbPort}\nDB_NAME=${dbName}\nDB_USER=${dbUser}\nDB_PASSWORD=${dbPassword}\n`;
  }

  console.log("\n🔐 Security Configuration\n");

  const jwtSecret = crypto.randomBytes(32).toString("hex");
  console.log("✅ Generated JWT secret");

  const jwtExpires = (await question("JWT expiration (7d): ")) || "7d";

  console.log("\n🌐 Server Configuration\n");

  const port = (await question("Backend port (4000): ")) || "4000";
  const frontendUrl =
    (await question("Frontend URL (http://localhost:4321): ")) ||
    "http://localhost:4321";

  const envContent = `${dbSection}
# Server Configuration
PORT=${port}
FRONTEND_URL=${frontendUrl}

# JWT Configuration
JWT_SECRET=${jwtSecret}
JWT_EXPIRES_IN=${jwtExpires}
`;

  fs.writeFileSync(envPath, envContent);
  console.log("\n✅ .env file created successfully!\n");
  console.log("Next steps:");
  console.log("1. If using a local database, make sure PostgreSQL is running");
  console.log(
    "2. Initialize tables: npm run init-db (works for local DB or Supabase via DATABASE_URL)"
  );
  console.log("3. Start the server: npm run dev\n");

  rl.close();
}

setup().catch((error) => {
  console.error("Error:", error);
  rl.close();
  process.exit(1);
});
