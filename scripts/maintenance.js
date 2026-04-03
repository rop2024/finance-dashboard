#!/usr/bin/env node

const databaseService = require("../src/services/database.service");

async function main() {
  try {
    console.log("🔧 Running database maintenance...");

    const result = await databaseService.maintenance();

    console.log("✅ Database maintenance completed!");
    console.log("🛠️  Operations performed:", result.operations.join(", "));
    console.log(`⏰ Timestamp: ${result.timestamp}`);

  } catch (error) {
    console.error("❌ Maintenance failed:", error.message);
    process.exit(1);
  } finally {
    await databaseService.disconnect();
  }
}

main();