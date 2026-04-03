#!/usr/bin/env node

const databaseService = require("../src/services/database.service");
const path = require("path");

async function main() {
  try {
    console.log("🔄 Creating database backup...");

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(process.cwd(), 'backups', `backup-${timestamp}.json`);

    const result = await databaseService.createBackup(backupPath);

    console.log("✅ Backup created successfully!");
    console.log(`📁 Location: ${result.filepath}`);
    console.log(`📊 Records backed up:`, result.records);
    console.log(`💾 Size: ${result.size} bytes`);

  } catch (error) {
    console.error("❌ Backup failed:", error.message);
    process.exit(1);
  } finally {
    await databaseService.disconnect();
  }
}

main();