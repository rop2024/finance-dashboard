# Finance Dashboard Backend API

A Node.js backend API for a finance dashboard with layered architecture, built with Express.js, Prisma ORM, and PostgreSQL.

## Features

- User authentication and authorization (JWT)
- **Role-based access control** (user/admin roles)
- **User management** (admin-only user operations)
- Transaction management (income/expense tracking)
- Budget management
- **Advanced Dashboard Analytics**:
  - Monthly/Yearly spending trends and patterns
  - Budget vs actual spending analysis
  - Time-based analytics and month-over-month comparisons
  - Advanced metrics (averages, spending velocity, distributions)
  - Spending forecasting and predictions
  - Category-specific trend analysis
- **Database Management**:
  - Database health monitoring
  - Automated backup and restore
  - Database maintenance and optimization
  - Schema information and statistics
  - Data cleanup utilities
- Layered architecture (routes, controllers, services, repositories)
- PostgreSQL database with Prisma ORM
- CORS enabled
- Input validation and error handling

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Environment**: dotenv

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables in `.env`:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/finance_db"
   JWT_SECRET="your-secret-key"
   NODE_ENV="development"
   PORT=5000
   ```

4. Set up the database:
   ```bash
   npx prisma migrate dev --name init
   npx prisma db push
   ```

5. Seed the database (optional):
   ```bash
   npm run prisma:seed
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

The server will run on `http://localhost:5000`

## API Endpoints

### Authentication

#### Register User
- **POST** `/api/auth/register`
- **Description**: Register a new user account
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }
  ```
- **Response** (201):
  ```json
  {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user"
    },
    "token": "jwt-token-here"
  }
  ```
- **Validation**:
  - Email and password are required
  - Password must be at least 6 characters
  - Email must be unique

#### Login User
- **POST** `/api/auth/login`
- **Description**: Authenticate user and get JWT token
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response** (200):
  ```json
  {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user"
    },
    "token": "jwt-token-here"
  }
  ```

#### Get Current User
- **GET** `/api/auth/me`
- **Description**: Get current authenticated user's profile
- **Headers**: `Authorization: Bearer <jwt-token>`
- **Response** (200):
  ```json
  {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
  ```

### Dashboard Analytics

All dashboard endpoints require authentication. Include `Authorization: Bearer <jwt-token>` in headers.

#### Get Dashboard Summary
- **GET** `/api/dashboard/summary`
- **Description**: Get comprehensive financial summary with time-based filtering
- **Query Parameters** (optional):
  - `period`: `"monthly"` or `"yearly"` (default: "monthly")
  - `year`: Year for filtering (default: current year)
  - `month`: Month for filtering (1-12, required for monthly period)
- **Example**: `/api/dashboard/summary?period=monthly&year=2024&month=1`
- **Response** (200):
  ```json
  {
    "period": "monthly",
    "year": 2024,
    "month": 1,
    "totalIncome": 5000.00,
    "totalExpense": 3200.00,
    "balance": 1800.00,
    "transactionCount": 25,
    "categories": {
      "Salary": { "income": 5000.00, "expense": 0, "count": 1 },
      "Food": { "income": 0, "expense": 800.00, "count": 12 }
    },
    "dailyBreakdown": {
      "2024-01-15": { "income": 5000.00, "expense": 200.00, "count": 3 }
    }
  }
  ```

#### Get Spending Trends
- **GET** `/api/dashboard/trends`
- **Description**: Analyze spending patterns and trends over time
- **Query Parameters**:
  - `months`: Number of months to analyze (default: 6)
  - `category`: Filter by specific category (optional)
- **Example**: `/api/dashboard/trends?months=12&category=Food`
- **Response** (200):
  ```json
  {
    "period": "6 months",
    "startDate": "2023-10-01",
    "endDate": "2024-04-01",
    "category": "all",
    "trends": [
      {
        "month": "2023-10",
        "income": 4500.00,
        "expense": 2800.00,
        "balance": 1700.00,
        "incomeChange": 0,
        "expenseChange": 0,
        "balanceChange": 0
      },
      {
        "month": "2023-11",
        "income": 4800.00,
        "expense": 3100.00,
        "balance": 1700.00,
        "incomeChange": 6.67,
        "expenseChange": 10.71,
        "balanceChange": 0
      }
    ]
  }
  ```

#### Get Budget Analysis
- **GET** `/api/dashboard/budget-analysis`
- **Description**: Compare budgeted amounts with actual spending
- **Query Parameters**:
  - `month`: Month to analyze (1-12)
  - `year`: Year to analyze
- **Example**: `/api/dashboard/budget-analysis?month=1&year=2024`
- **Response** (200):
  ```json
  {
    "period": "2024-01",
    "summary": {
      "totalBudgeted": 3000.00,
      "totalActual": 2850.00,
      "totalVariance": -150.00,
      "totalVariancePercent": -5.00
    },
    "categories": [
      {
        "category": "Food",
        "budgeted": 800.00,
        "actual": 750.00,
        "variance": -50.00,
        "variancePercent": -6.25,
        "status": "under_budget"
      },
      {
        "category": "Transport",
        "budgeted": 400.00,
        "actual": 450.00,
        "variance": 50.00,
        "variancePercent": 12.50,
        "status": "over_budget"
      }
    ]
  }
  ```

#### Get Advanced Metrics
- **GET** `/api/dashboard/metrics`
- **Description**: Get detailed financial metrics and analytics
- **Query Parameters** (optional):
  - `period`: `"monthly"` or `"yearly"` (default: "monthly")
  - `year`: Year for filtering
  - `month`: Month for filtering
- **Response** (200):
  ```json
  {
    "period": "monthly",
    "year": 2024,
    "month": 1,
    "metrics": {
      "transactionCount": 25,
      "averageTransaction": 180.00,
      "medianTransaction": 150.00,
      "largestTransaction": 1000.00,
      "smallestTransaction": 5.50,
      "spendingVelocity": 0.83,
      "topCategories": [
        { "category": "Food", "amount": 1200.00 },
        { "category": "Transport", "amount": 800.00 }
      ],
      "transactionDistribution": {
        "0-50": 8,
        "51-100": 10,
        "101-500": 6,
        "501-1000": 1,
        "1000+": 0
      }
    }
  }
  ```

#### Get Spending Forecast
- **GET** `/api/dashboard/forecast`
- **Description**: Predict future spending based on historical patterns
- **Query Parameters**:
  - `months`: Number of months to forecast (default: 3)
- **Response** (200):
  ```json
  {
    "basedOnMonths": 6,
    "forecastPeriod": 3,
    "historicalAverage": {
      "income": 4750.00,
      "expense": 2950.00
    },
    "forecast": [
      {
        "month": "2024-05",
        "predictedIncome": 4900.00,
        "predictedExpense": 3050.00,
        "predictedBalance": 1850.00,
        "confidence": 90
      }
    ]
  }
  ```

#### Get Category Trends
- **GET** `/api/dashboard/category-trends`
- **Description**: Analyze how spending in categories changes over time
- **Query Parameters**:
  - `months`: Number of months to analyze (default: 6)
  - `category`: Specific category to analyze (optional)
- **Example**: `/api/dashboard/category-trends?category=Food`
- **Response** (200):
  ```json
  {
    "period": "6 months",
    "categories": {
      "Food": {
        "totalIncome": 0,
        "totalExpense": 3600.00,
        "monthlyBreakdown": [
          { "month": "2023-10", "income": 0, "expense": 580.00, "total": 580.00 },
          { "month": "2023-11", "income": 0, "expense": 620.00, "total": 620.00 }
        ],
        "growthRate": 6.90
      }
    }
  }
  ```

### Transactions

All transaction endpoints require authentication. Include `Authorization: Bearer <jwt-token>` in headers.

#### Create Transaction
- **POST** `/api/transactions`
- **Description**: Create a new income or expense transaction
- **Request Body**:
  ```json
  {
    "amount": 100.50,
    "type": "expense",
    "category": "Food",
    "description": "Lunch at restaurant",
    "date": "2024-01-15"
  }
  ```
- **Response** (201):
  ```json
  {
    "id": "uuid",
    "amount": 100.50,
    "type": "expense",
    "category": "Food",
    "description": "Lunch at restaurant",
    "userId": "uuid",
    "date": "2024-01-15T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
  ```
- **Validation**:
  - Amount must be positive
  - Type must be "income" or "expense"
  - Category is required

#### Get All Transactions
- **GET** `/api/transactions`
- **Description**: Get user's transactions with optional filters
- **Query Parameters** (optional):
  - `startDate`: Filter transactions from this date (YYYY-MM-DD)
  - `endDate`: Filter transactions until this date (YYYY-MM-DD)
  - `type`: Filter by type ("income" or "expense")
  - `category`: Filter by category
- **Example**: `/api/transactions?type=expense&category=Food&startDate=2024-01-01`
- **Response** (200):
  ```json
  [
    {
      "id": "uuid",
      "amount": 100.50,
      "type": "expense",
      "category": "Food",
      "description": "Lunch",
      "date": "2024-01-15T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
  ```

#### Get Transaction Statistics
- **GET** `/api/transactions/stats`
- **Description**: Get summary statistics for user's transactions
- **Response** (200):
  ```json
  {
    "totalIncome": 5000.00,
    "totalExpense": 3200.00,
    "balance": 1800.00,
    "transactionCount": 25
  }
  ```

#### Get Single Transaction
- **GET** `/api/transactions/:id`
- **Description**: Get a specific transaction by ID
- **Response** (200):
  ```json
  {
    "id": "uuid",
    "amount": 100.50,
    "type": "expense",
    "category": "Food",
    "description": "Lunch",
    "date": "2024-01-15T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
  ```

#### Update Transaction
- **PUT** `/api/transactions/:id`
- **Description**: Update an existing transaction
- **Request Body** (same as create, all fields optional):
  ```json
  {
    "amount": 150.00,
    "category": "Entertainment"
  }
  ```
- **Response** (200): Updated transaction object

#### Delete Transaction
- **DELETE** `/api/transactions/:id`
- **Description**: Delete a transaction
- **Response** (200):
  ```json
  {
    "message": "Transaction deleted successfully"
  }
  ```

### Budgets

All budget endpoints require authentication. Include `Authorization: Bearer <jwt-token>` in headers.

#### Create Budget
- **POST** `/api/budgets`
- **Description**: Create a new budget for a category
- **Request Body**:
  ```json
  {
    "category": "Food",
    "amount": 500.00,
    "month": 1,
    "year": 2024
  }
  ```
- **Response** (201):
  ```json
  {
    "id": "uuid",
    "category": "Food",
    "amount": 500.00,
    "month": 1,
    "year": 2024,
    "userId": "uuid",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
  ```
- **Validation**:
  - Category, amount, month, and year are required
  - Month must be 1-12
  - Unique constraint on userId + category + month + year

#### Get All Budgets
- **GET** `/api/budgets`
- **Description**: Get user's budgets with optional month/year filter
- **Query Parameters** (optional):
  - `month`: Filter by month (1-12)
  - `year`: Filter by year
- **Example**: `/api/budgets?month=1&year=2024`
- **Response** (200):
  ```json
  [
    {
      "id": "uuid",
      "category": "Food",
      "amount": 500.00,
      "month": 1,
      "year": 2024,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
  ```

#### Update Budget
- **PUT** `/api/budgets/:id`
- **Description**: Update an existing budget
- **Request Body** (all fields optional):
  ```json
  {
    "amount": 600.00
  }
  ```
- **Response** (200): Updated budget object

#### Delete Budget
- **DELETE** `/api/budgets/:id`
- **Description**: Delete a budget
- **Response** (200):
  ```json
  {
    "message": "Budget deleted successfully"
  }
  ```

### Database Management

Database management endpoints provide comprehensive database operations and monitoring.

#### Database Health Check
- **GET** `/api/database/health`
- **Description**: Check database connection and health status
- **Response** (200):
  ```json
  {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "connection": "active"
  }
  ```

#### Database Statistics
- **GET** `/api/database/stats`
- **Description**: Get database statistics and record counts (admin only)
- **Headers**: `Authorization: Bearer <jwt-token>`
- **Response** (200):
  ```json
  {
    "users": 25,
    "transactions": 450,
    "budgets": 30,
    "databaseSize": {
      "size": "15 MB",
      "size_bytes": 15728640
    },
    "lastUpdated": "2024-01-01T00:00:00.000Z"
  }
  ```

#### Database Schema Information
- **GET** `/api/database/schema`
- **Description**: Get database schema and table information (admin only)
- **Headers**: `Authorization: Bearer <jwt-token>`
- **Response** (200):
  ```json
  {
    "tables": [...],
    "indexes": [...],
    "schema": "public"
  }
  ```

#### Create Database Backup
- **POST** `/api/database/backup`
- **Description**: Create a full database backup (admin only)
- **Headers**: `Authorization: Bearer <jwt-token>`
- **Request Body** (optional):
  ```json
  {
    "filepath": "/custom/path/backup.json"
  }
  ```
- **Response** (200):
  ```json
  {
    "success": true,
    "filepath": "./backups/backup-2024-01-01T10-00-00-000Z.json",
    "size": 15768,
    "records": {
      "users": 25,
      "transactions": 450,
      "budgets": 30,
      "categories": 10
    }
  }
  ```

#### Restore Database from Backup
- **POST** `/api/database/restore`
- **Description**: Restore database from backup file (admin only)
- **Headers**: `Authorization: Bearer <jwt-token>`
- **Request Body**:
  ```json
  {
    "filepath": "./backups/backup-2024-01-01T10-00-00-000Z.json"
  }
  ```
- **Response** (200):
  ```json
  {
    "success": true,
    "restored": {
      "users": 25,
      "transactions": 450,
      "budgets": 30,
      "categories": 10
    },
    "backupInfo": {
      "timestamp": "2024-01-01T10:00:00.000Z",
      "version": "1.0",
      "type": "full_backup"
    }
  }
  ```

#### Database Maintenance
- **POST** `/api/database/maintenance`
- **Description**: Run database maintenance operations (admin only)
- **Headers**: `Authorization: Bearer <jwt-token>`
- **Response** (200):
  ```json
  {
    "success": true,
    "operations": ["ANALYZE", "VACUUM"],
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
  ```

#### Cleanup Old Data
- **POST** `/api/database/cleanup`
- **Description**: Remove old data based on age (admin only)
- **Headers**: `Authorization: Bearer <jwt-token>`
- **Request Body**:
  ```json
  {
    "daysOld": 365
  }
  ```
- **Response** (200):
  ```json
  {
    "deletedTransactions": 150,
    "deletedBudgets": 5,
    "cutoffDate": "2023-01-01T00:00:00.000Z"
  }
  ```

## Authentication

This API uses JWT (JSON Web Tokens) for authentication with **role-based access control**. After successful login or registration, you'll receive a token that must be included in the `Authorization` header for protected endpoints:

```
Authorization: Bearer <your-jwt-token>
```

The token expires after 7 days and includes user role information for authorization checks.

### User Roles

- **`user`**: Standard user with access to their own data
- **`admin`**: Administrator with access to all user management functions

### Default Test Accounts

- **Regular User**: `demo@example.com` / `demo123` (role: user)
- **Admin User**: `admin@example.com` / `admin123` (role: admin)

## Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid/missing token)
- `403`: Forbidden (insufficient permissions/role)
- `404`: Not Found
- `500`: Internal Server Error

## Development

### Available Scripts

- `npm start`: Start production server
- `npm run dev`: Start development server with nodemon
- `npm run prisma:migrate`: Run Prisma migrations
- `npm run prisma:studio`: Open Prisma Studio
- `npm run prisma:seed`: Seed database with sample data
- `npm run prisma:reset`: Reset database (force)
- `npm run db:backup`: Create database backup
- `npm run db:restore <file>`: Restore database from backup
- `npm run db:health`: Check database health and statistics
- `npm run db:maintenance`: Run database maintenance operations

### Project Structure

```
src/
├── app.js              # Express app configuration
├── server.js           # Server entry point
├── config/             # Configuration files
├── controllers/        # Route controllers (auth, user, transaction, budget, dashboard, database)
├── middlewares/        # Express middlewares (auth, admin, errorHandler, logger)
├── repositories/       # Data access layer (user, transaction, budget)
├── routes/             # API routes (auth, user, transaction, budget, dashboard, database)
└── services/           # Business logic layer (auth, user, transaction, budget, dashboard, database)
prisma/
├── schema.prisma       # Database schema
├── seed.js            # Database seeding
└── migrations/        # Database migrations
scripts/
├── backup.js          # Database backup script
├── restore.js         # Database restore script
├── health-check.js    # Database health check script
└── maintenance.js     # Database maintenance script
backups/               # Database backup files
```

## Database Management

The application includes comprehensive database management features for production use:

### Database Health Monitoring
- Real-time connection status
- Database size monitoring
- Record count statistics
- Performance metrics

### Backup & Restore
- Full database backups in JSON format
- Automated backup scheduling support
- Point-in-time restore capabilities
- Backup verification and integrity checks

### Maintenance Operations
- Automatic table analysis for query optimization
- Database vacuuming for space reclamation
- Index maintenance and statistics updates

### Data Management
- Configurable data retention policies
- Old data cleanup utilities
- Schema information and documentation
- Database migration tracking

### Usage Examples

```bash
# Check database health
npm run db:health

# Create backup
npm run db:backup

# Restore from backup
npm run db:restore ./backups/backup-2024-01-01T10-00-00-000Z.json

# Run maintenance
npm run db:maintenance
```

### API Access
All database management operations are available through REST APIs with admin authentication required for sensitive operations.</content>
<parameter name="filePath">d:\@Development\_1_projects\@assessment - finance dashboard backend\README.md