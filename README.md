# Expense Tracker

A full-stack personal finance management application built with Django REST Framework and React TypeScript. Track your income, expenses, accounts, and categories with a modern, responsive interface.

![Python](https://img.shields.io/badge/Python-3.11-blue)
![Django](https://img.shields.io/badge/Django-4.2.7-green)
![React](https://img.shields.io/badge/React-19.1.1-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
  - [Local Development](#local-development)
  - [Docker Setup](#docker-setup)
- [API Documentation](#api-documentation)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [Database Schema](#database-schema)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

- **User Authentication**
  - JWT-based authentication with token refresh
  - Secure user registration and login
  - Token blacklisting for logout
  - Email-based authentication

- **Account Management**
  - Multiple account types (Checking, Savings, Credit Card, Cash, Investment, Other)
  - Real-time balance calculation
  - Account activation/deactivation
  - Detailed account tracking

- **Transaction Tracking**
  - Record income and expenses
  - Transfer between accounts
  - Categorize transactions
  - Date-based transaction history
  - Transaction notes and descriptions

- **Category Management**
  - Custom categories with color coding
  - Category-based expense analysis
  - User-specific categories

- **Dashboard**
  - Overview of financial status
  - Visual representations of spending patterns
  - Quick access to recent transactions

## 🛠️ Tech Stack

### Backend
- **Framework**: Django 4.2.7
- **API**: Django REST Framework 3.14.0
- **Authentication**: JWT (djangorestframework-simplejwt 5.5.1)
- **Database**: SQLite3 (Development) / PostgreSQL (Production-ready)
- **CORS**: django-cors-headers 4.3.1
- **Configuration**: python-decouple 3.8

### Frontend
- **Framework**: React 19.1.1
- **Language**: TypeScript 4.9.5
- **HTTP Client**: Axios 1.6.0
- **Routing**: React Router DOM 6.8.0
- **Testing**: Jest, React Testing Library

### DevOps
- **Containerization**: Docker & Docker Compose
- **Web Server**: Nginx (for frontend)
- **Python Version**: 3.11

## 📁 Project Structure

```
expense_tracker/
├── accounts/              # User authentication and management
│   ├── models.py         # Custom User model
│   ├── serializers.py    # User serializers
│   ├── views.py          # Auth views (login, register, logout)
│   └── urls.py           # Auth API endpoints
├── expenses/             # Core expense tracking functionality
│   ├── models.py         # Transaction, Account, Category models
│   ├── serializers.py    # Data serializers
│   ├── views.py          # CRUD operations for expenses
│   ├── signals.py        # Signal handlers for balance updates
│   └── management/       # Custom management commands
│       └── commands/
│           └── recalculate_balances.py
├── tracker/              # Django project settings
│   ├── settings.py       # Main configuration
│   ├── urls.py           # URL routing
│   └── cors_middleware.py # Custom CORS handling
├── Frontend/
│   └── expense-tracker-frontend/
│       ├── src/
│       │   ├── api/      # API integration (auth, expenses)
│       │   ├── components/ # React components
│       │   │   ├── Auth/ # Login and Register
│       │   │   ├── Expenses/ # Dashboard, Transactions, Accounts, Categories
│       │   │   └── Layout/ # Navbar
│       │   └── types/    # TypeScript type definitions
│       ├── public/
│       └── build/        # Production build
├── docker-compose.yml    # Multi-container Docker setup
├── Dockerfile            # Backend Docker configuration
├── requirements.txt      # Python dependencies
├── manage.py            # Django management script
└── openapi-schema.yml   # API documentation

```

## 📋 Prerequisites

- **Python**: 3.11 or higher
- **Node.js**: 16.x or higher
- **npm**: 8.x or higher
- **Docker** (optional): For containerized deployment
- **Git**: For version control

## 🚀 Installation

### Local Development

#### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Samriddha9619/expense_tracker.git
   cd expense_tracker
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   
   # Windows
   .\venv\Scripts\activate
   
   # Linux/Mac
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   SECRET_KEY=your-secret-key-here
   DEBUG=True
   ALLOWED_HOSTS=localhost,127.0.0.1
   ```

5. **Run migrations**
   ```bash
   python manage.py migrate
   ```

6. **Create a superuser (optional)**
   ```bash
   python manage.py createsuperuser
   ```

7. **Run the development server**
   ```bash
   python manage.py runserver
   ```

   Backend will be available at `http://localhost:8000`

#### Frontend Setup

1. **Navigate to the frontend directory**
   ```bash
   cd Frontend/expense-tracker-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the frontend directory:
   ```env
   REACT_APP_API_URL=http://localhost:8000/api
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

   Frontend will be available at `http://localhost:3000`

### Docker Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Samriddha9619/expense_tracker.git
   cd expense_tracker
   ```

2. **Create environment file**
   
   Create a `.env` file in the root directory:
   ```env
   SECRET_KEY=your-secret-key-here
   DEBUG=True
   ALLOWED_HOSTS=localhost,127.0.0.1,backend
   CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:80
   ```

3. **Build and run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

   - Backend: `http://localhost:8000`
   - Frontend: `http://localhost:80`

4. **Run migrations (first time only)**
   ```bash
   docker-compose exec backend python manage.py migrate
   ```

5. **Create superuser (optional)**
   ```bash
   docker-compose exec backend python manage.py createsuperuser
   ```

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| POST | `/api/auth/register/` | Register new user | No |
| POST | `/api/auth/login/` | User login | No |
| POST | `/api/auth/logout/` | User logout | Yes |
| POST | `/api/auth/token/refresh/` | Refresh access token | Yes |
| GET | `/api/auth/profile/` | Get user profile | Yes |

### Expense Management Endpoints

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| GET | `/api/accounts/` | List all accounts | Yes |
| POST | `/api/accounts/` | Create new account | Yes |
| GET | `/api/accounts/{id}/` | Get account details | Yes |
| PUT | `/api/accounts/{id}/` | Update account | Yes |
| DELETE | `/api/accounts/{id}/` | Delete account | Yes |
| GET | `/api/categories/` | List all categories | Yes |
| POST | `/api/categories/` | Create new category | Yes |
| GET | `/api/transactions/` | List all transactions | Yes |
| POST | `/api/transactions/` | Create new transaction | Yes |
| GET | `/api/transactions/{id}/` | Get transaction details | Yes |
| PUT | `/api/transactions/{id}/` | Update transaction | Yes |
| DELETE | `/api/transactions/{id}/` | Delete transaction | Yes |

For detailed API documentation, refer to the `openapi-schema.yml` file.

## 🔐 Environment Variables

### Backend (.env)

```env
# Django Settings
SECRET_KEY=your-django-secret-key
DEBUG=True  # Set to False in production
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (if using PostgreSQL)
DB_ENGINE=django.db.backends.postgresql
DB_NAME=expense_tracker
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432

# CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend (.env)

```env
REACT_APP_API_URL=http://localhost:8000/api
```

## 📖 Usage

### Registering a New User

1. Navigate to the application
2. Click "Register" or "Sign Up"
3. Fill in the registration form:
   - Email (used for login)
   - Username
   - First Name
   - Last Name
   - Password
4. Submit the form

### Creating an Account

1. After logging in, navigate to "Accounts"
2. Click "Add Account"
3. Enter account details:
   - Account name
   - Account type (Checking, Savings, etc.)
   - Initial balance
   - Description (optional)
4. Save the account

### Adding a Transaction

1. Navigate to "Transactions"
2. Click "Add Transaction"
3. Fill in transaction details:
   - Transaction type (Income/Expense/Transfer)
   - Account
   - Category
   - Amount
   - Date
   - Description
   - Notes (optional)
4. Save the transaction

### Managing Categories

1. Navigate to "Categories"
2. Create custom categories with:
   - Name
   - Description
   - Color code (for visual identification)
3. Categories can be assigned to transactions for better organization

## 🗄️ Database Schema

### User Model (Custom)
- Email (unique, used for authentication)
- Username
- First Name
- Last Name
- Phone (optional)
- Created/Updated timestamps

### Account Model
- Name
- Account Type (Checking, Savings, Credit Card, Cash, Investment, Other)
- Balance (auto-calculated)
- Description
- User (Foreign Key)
- Active status
- Created/Updated timestamps

### Transaction Model
- User (Foreign Key)
- Account (Foreign Key)
- Category (Foreign Key, optional)
- Transaction Type (Income, Expense, Transfer)
- Amount
- Description
- Notes (optional)
- Date
- Created/Updated timestamps

### Category Model
- Name
- Description
- Color (hex code)
- User (Foreign Key)
- Created/Updated timestamps

## 🔧 Management Commands

### Recalculate Account Balances

If account balances become out of sync, you can recalculate them:

```bash
python manage.py recalculate_balances
```

## 🧪 Testing

### Backend Tests

```bash
# Run all tests
python manage.py test

# Run tests for specific app
python manage.py test accounts
python manage.py test expenses
```

### Frontend Tests

```bash
cd Frontend/expense-tracker-frontend
npm test
```

## 🐳 Docker Commands

```bash
# Build containers
docker-compose build

# Start containers
docker-compose up

# Start in detached mode
docker-compose up -d

# Stop containers
docker-compose down

# View logs
docker-compose logs -f

# Execute commands in backend container
docker-compose exec backend python manage.py [command]
```

## 🔒 Security Features

- JWT authentication with token refresh mechanism
- Token blacklisting on logout
- CORS protection
- User-specific data isolation
- Password validation and hashing
- CSRF protection

## 🚀 Production Deployment

### Backend Checklist

- [ ] Set `DEBUG=False` in settings
- [ ] Configure proper `SECRET_KEY`
- [ ] Update `ALLOWED_HOSTS`
- [ ] Set up PostgreSQL database
- [ ] Configure static file serving
- [ ] Set up HTTPS/SSL
- [ ] Configure proper CORS settings
- [ ] Set up proper logging
- [ ] Use environment variables for sensitive data

### Frontend Checklist

- [ ] Build production bundle: `npm run build`
- [ ] Update API URL to production backend
- [ ] Configure proper CORS
- [ ] Set up CDN for static assets (optional)
- [ ] Enable HTTPS

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👤 Author

**Samriddha Srishti**
- GitHub: [@Samriddha9619](https://github.com/Samriddha9619)

## 🙏 Acknowledgments

- Django REST Framework documentation
- React and TypeScript communities
- All contributors and users of this project

## 📞 Support

For support, email your-email@example.com or open an issue in the GitHub repository.

---

**Note**: This is a personal finance management application. Always ensure your deployment follows security best practices and complies with relevant data protection regulations.
