# Expense Tracker Frontend

A simple React frontend for the Expense Tracker Django API.

## Features

- **Authentication**: Login and Register functionality with JWT tokens
- **Dashboard**: Overview of financial summary and accounts
- **Transactions**: Create, read, update, and delete transactions
- **Accounts**: Manage different financial accounts (checking, savings, etc.)
- **Categories**: Organize transactions with custom categories

## Setup Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start the Development Server**:
   ```bash
   npm start
   ```

3. **Make sure the Django backend is running**:
   - The backend should be running on `http://127.0.0.1:8000`
   - If your backend is running on a different port, update the `API_BASE_URL` in `src/api/axios.ts`

## Usage

1. **Register a new account** or **Login** with existing credentials
2. **Create Accounts** - Add your bank accounts, credit cards, etc.
3. **Create Categories** - Set up expense categories (Food, Transport, etc.)
4. **Add Transactions** - Record your income and expenses
5. **View Dashboard** - See your financial summary

## API Integration

The frontend integrates with the Django REST API endpoints:
- Authentication: `/api/auth/`
- Categories: `/api/categories/`
- Accounts: `/api/accounts/`
- Transactions: `/api/transactions/`

## Notes

- JWT tokens are automatically handled for authentication
- All API calls include proper error handling
- The interface is functional but basic (no advanced styling)
- Data is stored in the Django backend database