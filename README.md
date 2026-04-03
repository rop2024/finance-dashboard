# Finance Dashboard Backend API

A Node.js backend API for a finance dashboard with layered architecture, built with Express.js, Prisma ORM, and PostgreSQL.

## Features

- User authentication and authorization (JWT)
- Transaction management (income/expense tracking)
- Budget management
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
      "name": "John Doe"
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
      "name": "John Doe"
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
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
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

### Health Check

#### Server Health
- **GET** `/health`
- **Description**: Check if the server is running
- **Response** (200):
  ```json
  {
    "status": "OK",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
  ```

## Authentication

This API uses JWT (JSON Web Tokens) for authentication. After successful login or registration, you'll receive a token that must be included in the `Authorization` header for protected endpoints:

```
Authorization: Bearer <your-jwt-token>
```

The token expires after 7 days.

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

### Project Structure

```
src/
├── app.js              # Express app configuration
├── server.js           # Server entry point
├── config/             # Configuration files
├── controllers/        # Route controllers
├── middlewares/        # Express middlewares
├── repositories/       # Data access layer
├── routes/             # API routes
└── services/           # Business logic layer
```

## License

ISC</content>
<parameter name="filePath">d:\@Development\_1_projects\@assessment - finance dashboard backend\README.md