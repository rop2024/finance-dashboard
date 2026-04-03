#!/usr/bin/env node

const databaseService = require("../src/services/database.service");

async function main() {
  try {
    console.log("🔍 Checking database health...");

    const health = await databaseService.healthCheck();
    const stats = await databaseService.getStats();

    console.log("📊 Database Health Report");
    console.log("==========================");
    console.log(`Status: ${health.status.toUpperCase()}`);
    console.log(`Connection: ${health.connection}`);
    console.log(`Timestamp: ${health.timestamp}`);
    console.log("");

    if (health.status === 'healthy') {
      console.log("📈 Database Statistics:");
      console.log(`   Users: ${stats.users}`);
      console.log(`   Transactions: ${stats.transactions}`);
      console.log(`   Budgets: ${stats.budgets}`);
      console.log(`   Database Size: ${stats.databaseSize.size} (${stats.databaseSize.size_bytes} bytes)`);
      console.log(`   Last Updated: ${stats.lastUpdated}`);
      console.log("");
      console.log("✅ Database is healthy and operational!");
    } else {
      console.error("❌ Database health check failed!");
      console.error(`Error: ${health.error}`);
      process.exit(1);
    }

  } catch (error) {
    console.error("❌ Health check failed:", error.message);
    process.exit(1);
  } finally {
    await databaseService.disconnect();
  }
}

main();