#!/usr/bin/env node

const databaseService = require("../src/services/database.service");
const path = require("path");

async function main() {
  try {
    const backupFile = process.argv[2];

    if (!backupFile) {
      console.error("❌ Usage: npm run db:restore <backup-file-path>");
      console.error("Example: npm run db:restore ./backups/backup-2024-01-01T10-00-00-000Z.json");
      process.exit(1);
    }

    const backupPath = path.resolve(backupFile);

    console.log(`🔄 Restoring database from: ${backupPath}`);
    console.log("⚠️  This will replace all existing data!");

    const result = await databaseService.restoreFromBackup(backupPath);

    console.log("✅ Database restored successfully!");
    console.log("📊 Records restored:", result.restored);
    console.log("📅 Backup created:", result.backupInfo.timestamp);

  } catch (error) {
    console.error("❌ Restore failed:", error.message);
    process.exit(1);
  } finally {
    await databaseService.disconnect();
  }
}

main();