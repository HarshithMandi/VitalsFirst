# Vitals First Hub - Backend API

This is the FastAPI backend for the Vitals First Hub application, providing REST APIs for healthcare management system.

## Features

- **User Authentication & Authorization**: JWT-based authentication with role-based access control
- **Role Management**: Support for 4 user roles (Administrator, Doctor, Nurse, Patient)
- **Patient Management**: Complete patient profile and medical history management
- **Appointment System**: Scheduling and management of medical appointments
- **Triage System**: Patient triage with vital signs and priority assignment
- **Alert System**: Real-time alerts and notifications
- **Dashboard Analytics**: Role-specific dashboard statistics

## Tech Stack

- **FastAPI**: Modern, fast web framework for Python APIs
- **SQLAlchemy**: SQL toolkit and ORM
- **SQLite**: Lightweight database for development
- **JWT**: JSON Web Tokens for authentication
- **Pydantic**: Data validation using Python type annotations
- **Uvicorn**: ASGI server for running the application

## Installation

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create virtual environment** (recommended):
   ```bash
   python -m venv venv
   venv\Scripts\activate  # On Windows
   # source venv/bin/activate  # On macOS/Linux
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Initialize database**:
   ```bash
   python init_db.py
   ```

5. **Run the server**:
   ```bash
   python main.py
   ```
   
   Or using uvicorn directly:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

## API Documentation

Once the server is running, you can access:

- **Interactive API Documentation**: http://localhost:8000/docs
- **Alternative Documentation**: http://localhost:8000/redoc

## Default Users

The system comes with pre-configured users for testing:

| Username | Password | Role | Email |
|----------|----------|------|-------|
| admin | admin123 | administrator | admin@vitalsfirst.com |
| nurse1 | nurse123 | nurse | sarah@vitalsfirst.com |
| doctor1 | doctor123 | doctor | mchen@vitalsfirst.com |
| patient1 | patient123 | patient | john.doe@email.com |

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/me` - Get current user info

### Users
- `GET /users/` - List all users (Admin only)
- `GET /users/{user_id}` - Get user by ID

### Patients
- `GET /patients/` - List all patients
- `GET /patients/{patient_id}` - Get patient by ID
- `PUT /patients/{patient_id}` - Update patient info

### Appointments
- `GET /appointments/` - List appointments
- `POST /appointments/` - Create new appointment
- `PUT /appointments/{appointment_id}` - Update appointment
- `DELETE /appointments/{appointment_id}` - Delete appointment

### Triage
- `GET /triage/` - List triage records
- `POST /triage/` - Create triage record
- `PUT /triage/{triage_id}` - Update triage status

### Alerts
- `GET /alerts/` - List alerts
- `POST /alerts/` - Create alert
- `PUT /alerts/{alert_id}/read` - Mark alert as read

### Dashboard
- `GET /dashboard/stats` - Get role-specific dashboard statistics

## Role-Based Access Control

### Administrator
- Full access to all endpoints
- User management
- System-wide statistics

### Doctor
- View and manage their appointments
- Access patient records
- Create and update triage records
- Receive critical alerts

### Nurse
- Patient triage management
- Create triage records
- View patient lists
- Monitor critical cases

### Patient
- View their own appointments
- Book new appointments
- View their medical records
- Update personal information

## Database Schema

The system uses SQLite database with the following main tables:

- **users**: User accounts and authentication
- **patients**: Patient profiles and medical info
- **appointments**: Medical appointments
- **triage_records**: Patient triage with vitals
- **alerts**: System alerts and notifications

## Environment Variables

Create a `.env` file in the backend directory:

```env
SECRET_KEY=your-secret-key-here-change-in-production
DATABASE_URL=sqlite:///./vitals_first.db
```

## Development

For development with auto-reload:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## CORS Configuration

The API is configured to accept requests from:
- http://localhost:3000 (React dev server)
- http://localhost:5173 (Vite dev server)
- http://localhost:8080 (Alternative frontend port)

## Security Features

- Password hashing using bcrypt
- JWT token-based authentication
- Role-based authorization
- Input validation with Pydantic
- SQL injection protection via SQLAlchemy ORM

## Error Handling

The API provides detailed error responses with appropriate HTTP status codes:
- 400: Bad Request (validation errors)
- 401: Unauthorized (authentication required)
- 403: Forbidden (insufficient permissions)
- 404: Not Found (resource doesn't exist)
- 500: Internal Server Error

## Contributing

1. Follow PEP 8 style guidelines
2. Add appropriate type hints
3. Include docstrings for new functions
4. Update API documentation
5. Test all endpoints thoroughly