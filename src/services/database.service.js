const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

class DatabaseService {
  // Health check
  async healthCheck() {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        connection: 'active'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  }

  // Database statistics
  async getStats() {
    try {
      const [userCount, transactionCount, budgetCount] = await Promise.all([
        prisma.user.count(),
        prisma.transaction.count(),
        prisma.budget.count()
      ]);

      // Get database size (PostgreSQL specific)
      const dbSize = await prisma.$queryRaw`
        SELECT
          pg_size_pretty(pg_database_size(current_database())) as size,
          pg_database_size(current_database()) as size_bytes
      `;

      return {
        users: userCount,
        transactions: transactionCount,
        budgets: budgetCount,
        databaseSize: dbSize[0],
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Failed to get database stats: ${error.message}`);
    }
  }

  // Backup database
  async createBackup(backupPath = null) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `backup-${timestamp}.json`;
      const filepath = backupPath || path.join(process.cwd(), 'backups', filename);

      // Ensure backup directory exists
      await fs.mkdir(path.dirname(filepath), { recursive: true });

      // Export all data
      const [users, transactions, budgets, categories] = await Promise.all([
        prisma.user.findMany({
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true
          }
        }),
        prisma.transaction.findMany(),
        prisma.budget.findMany(),
        prisma.category.findMany()
      ]);

      const backupData = {
        metadata: {
          timestamp: new Date().toISOString(),
          version: '1.0',
          type: 'full_backup'
        },
        data: {
          users,
          transactions,
          budgets,
          categories
        }
      };

      await fs.writeFile(filepath, JSON.stringify(backupData, null, 2));

      return {
        success: true,
        filepath,
        size: JSON.stringify(backupData).length,
        records: {
          users: users.length,
          transactions: transactions.length,
          budgets: budgets.length,
          categories: categories.length
        }
      };
    } catch (error) {
      throw new Error(`Backup failed: ${error.message}`);
    }
  }

  // Restore database from backup
  async restoreFromBackup(filepath) {
    try {
      const backupContent = await fs.readFile(filepath, 'utf8');
      const backupData = JSON.parse(backupContent);

      if (!backupData.metadata || !backupData.data) {
        throw new Error('Invalid backup file format');
      }

      // Clear existing data (in reverse order of dependencies)
      await prisma.transaction.deleteMany();
      await prisma.budget.deleteMany();
      await prisma.user.deleteMany();
      await prisma.category.deleteMany();

      // Restore data (in order of dependencies)
      const results = {
        categories: 0,
        users: 0,
        transactions: 0,
        budgets: 0
      };

      // Restore categories
      for (const category of backupData.data.categories || []) {
        await prisma.category.upsert({
          where: { name: category.name },
          update: category,
          create: category
        });
        results.categories++;
      }

      // Restore users (without passwords for security)
      for (const user of backupData.data.users || []) {
        const { password, ...userData } = user;
        await prisma.user.create({
          data: {
            ...userData,
            password: password || 'restored_user' // Temporary password
          }
        });
        results.users++;
      }

      // Restore transactions
      for (const transaction of backupData.data.transactions || []) {
        await prisma.transaction.create({ data: transaction });
        results.transactions++;
      }

      // Restore budgets
      for (const budget of backupData.data.budgets || []) {
        await prisma.budget.create({ data: budget });
        results.budgets++;
      }

      return {
        success: true,
        restored: results,
        backupInfo: backupData.metadata
      };
    } catch (error) {
      throw new Error(`Restore failed: ${error.message}`);
    }
  }

  // Clean up old data
  async cleanupOldData(daysOld = 365) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const [deletedTransactions, deletedBudgets] = await Promise.all([
        prisma.transaction.deleteMany({
          where: {
            date: {
              lt: cutoffDate
            }
          }
        }),
        prisma.budget.deleteMany({
          where: {
            year: {
              lt: cutoffDate.getFullYear() - 1
            }
          }
        })
      ]);

      return {
        deletedTransactions: deletedTransactions.count,
        deletedBudgets: deletedBudgets.count,
        cutoffDate: cutoffDate.toISOString()
      };
    } catch (error) {
      throw new Error(`Cleanup failed: ${error.message}`);
    }
  }

  // Database maintenance
  async maintenance() {
    try {
      // Analyze tables for query optimization
      await prisma.$queryRaw`ANALYZE`;

      // Vacuum (PostgreSQL maintenance)
      await prisma.$queryRaw`VACUUM`;

      return {
        success: true,
        operations: ['ANALYZE', 'VACUUM'],
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Maintenance failed: ${error.message}`);
    }
  }

  // Get database schema info
  async getSchemaInfo() {
    try {
      const tables = await prisma.$queryRaw`
        SELECT
          schemaname,
          tablename,
          tableowner,
          tablespace,
          hasindexes,
          hasrules,
          hastriggers,
          rowsecurity
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY tablename;
      `;

      const indexes = await prisma.$queryRaw`
        SELECT
          schemaname,
          tablename,
          indexname,
          indexdef
        FROM pg_indexes
        WHERE schemaname = 'public'
        ORDER BY tablename, indexname;
      `;

      return {
        tables,
        indexes,
        schema: 'public'
      };
    } catch (error) {
      throw new Error(`Failed to get schema info: ${error.message}`);
    }
  }

  // Close database connection
  async disconnect() {
    await prisma.$disconnect();
  }
}

module.exports = new DatabaseService();