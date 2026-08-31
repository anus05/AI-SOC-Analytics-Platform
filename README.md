# AI-SOC-Analytics-Platform

An intelligent Security Operations Center (SOC) analytics platform powered by AI-driven threat detection, automated incident response, and MITRE ATT&CK framework integration.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Python](https://img.shields.io/badge/Python-3.8%2B-blue)
![React](https://img.shields.io/badge/React-19.2.7-61dafb)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Threat Detectors](#threat-detectors)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Setup & Configuration](#setup--configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Authors](#authors)
- [License](#license)

## 🎯 Overview

AI-SOC-Analytics-Platform is a comprehensive security monitoring and incident detection system that leverages artificial intelligence to identify, analyze, and respond to security threats in real-time. The platform processes security logs, detects anomalies and attack patterns, correlates them with the MITRE ATT&CK framework, and provides actionable insights to security teams.

## ✨ Features

- **Real-time Threat Detection**: Multiple detector modules for identifying various attack types
- **AI-Powered Threat Scoring**: Intelligent threat severity assessment based on attack patterns
- **MITRE ATT&CK Integration**: Automatic mapping of detected threats to MITRE ATT&CK tactics and techniques
- **Interactive Dashboard**: Real-time visualization of security alerts and metrics
- **Advanced Filtering & Search**: Filter alerts by severity, attack type, source IP, and timeframe
- **Statistical Analysis**: Attack distribution and trend analysis with interactive charts
- **User Authentication**: Role-based access control (Admin/User)
- **Alert Management**: Detailed alert information with historical tracking
- **Log Parsing**: Automatic parsing and ingestion of security logs

## 🏗️ Architecture

### Backend Architecture
The backend is built with **FastAPI** and follows a modular, layered architecture:

```
Backend
├── API Layer (routes.py)         - REST API endpoints
├── Auth Layer (auth.py)          - Authentication & authorization
├── Detection Layer               - Threat detection engines
├── Database Layer (ORM)          - SQLAlchemy models & CRUD operations
├── Scoring Engine               - Threat score calculation
├── Log Parser                    - Security log ingestion
└── MITRE Mapper                 - ATT&CK framework integration
```

### Frontend Architecture
The frontend is a modern **React + Vite** single-page application:

```
Frontend
├── Pages                        - Dashboard, Alerts, Statistics, Login
├── Components                   - Reusable UI components
├── Context API                  - Authentication state management
├── Charts                       - Data visualization (Chart.js)
├── API Client                   - HTTP communication layer
└── Hooks                        - Custom React hooks
```

## 🔍 Threat Detectors

The platform includes multiple specialized threat detection modules:

### 1. **Brute Force Detector** (`brute_force_detector.py`)
- Detects multiple failed login attempts from a single source
- Threshold: 5+ failed attempts
- Correlates with MITRE ATT&CK: T1110 (Brute Force)

### 2. **Impossible Travel Detector** (`impossible_travel_detector.py`)
- Identifies suspicious user location changes in impossible timeframes
- Detects account takeover attempts
- MITRE Correlation: T1550 (Use Alternate Authentication Material)

### 3. **Password Spray Detector** (`password_spray_detector.py`)
- Detects widespread password attempts across multiple accounts
- Identifies coordinated attack patterns
- MITRE Correlation: T1110.003 (Password Spraying)

### 4. **Port Scan Detector** (`port_scan_detector.py`)
- Identifies network reconnaissance activities
- Detects systematic port scanning attempts
- MITRE Correlation: T1046 (Network Service Discovery)

## 💻 Technology Stack

### Backend
- **Framework**: FastAPI 0.104.1+
- **Database**: SQLAlchemy ORM
- **Authentication**: JWT-based auth
- **Python Version**: 3.8+
- **Key Libraries**:
  - `pydantic` - Data validation
  - `python-dotenv` - Environment configuration
  - `annotated-doc` - Documentation

### Frontend
- **Framework**: React 19.2.7
- **Build Tool**: Vite 8.1.1
- **Styling**: Tailwind CSS 4.3.3
- **HTTP Client**: Axios 1.18.1
- **Charting**: Chart.js 4.5.1 + react-chartjs-2
- **Routing**: React Router 7.18.1
- **Linting**: oxlint 1.71.0

## 🚀 Installation

### Prerequisites
- **Python 3.8+**
- **Node.js 16+** (for frontend)
- **npm or yarn** (package manager)

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create a virtual environment**:
   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment**:
   - **Windows**:
     ```bash
     venv\Scripts\activate
     ```
   - **Linux/macOS**:
     ```bash
     source venv/bin/activate
     ```

4. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

## ⚙️ Setup & Configuration

### Backend Configuration

1. **Database Initialization**:
   - Ensure SQLite database is created by running the application
   - Tables are auto-created on first run

2. **Environment Variables** (create `.env` file):
   ```env
   DATABASE_URL=sqlite:///./test.db
   SECRET_KEY=your-secret-key-here
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ```

3. **Test Database Connection**:
   ```bash
   python backend/database/test_connection.py
   ```

### Frontend Configuration

1. **Update API Endpoint** in `src/api/client.js`:
   ```javascript
   const API_BASE_URL = "http://localhost:8000";
   ```

## 📖 Usage

### Starting the Application

1. **Start Backend**:
   ```bash
   cd backend
   python main.py
   ```
   Backend will run on `http://localhost:8000`

2. **Start Frontend** (in another terminal):
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

### Accessing the Platform

- **Dashboard**: http://localhost:5173
- **API Docs**: http://localhost:8000/docs
- **Alternative API Docs**: http://localhost:8000/redoc

### Basic Workflow

1. **Login**: Use admin credentials to access the platform
2. **Upload Logs**: Navigate to the Alerts section and trigger log scanning
3. **View Detections**: Alerts appear in real-time with threat scores
4. **Analyze Threats**: Click on any alert to view detailed information and MITRE mappings
5. **Review Statistics**: Check dashboard and statistics page for threat trends

## 🔌 API Documentation

### Authentication Endpoints

- **POST** `/auth/register` - Register new user
- **POST** `/auth/login` - User login (returns JWT token)
- **GET** `/auth/profile` - Get current user profile

### Detection & Alert Endpoints

- **POST** `/scan` - Scan logs and detect threats (Admin only)
- **GET** `/alerts` - Get all alerts (paginated)
- **GET** `/alerts/{alert_id}` - Get specific alert details
- **GET** `/alerts/filter` - Filter alerts by criteria
- **GET** `/statistics` - Get threat statistics
- **GET** `/dashboard` - Get dashboard data summary
- **GET** `/distribution` - Get attack type distribution

### Response Format

All API responses follow this format:
```json
{
  "status": "success|error",
  "data": { ... },
  "message": "Description"
}
```

For detailed API documentation, access the Swagger UI at `http://localhost:8000/docs`

## 📁 Project Structure

```
AI-SOC-Analytics-Platform/
│
├── backend/                          # FastAPI backend
│   ├── main.py                       # Application entry point
│   ├── requirements.txt              # Python dependencies
│   │
│   ├── api/
│   │   └── routes.py                 # API endpoint definitions
│   │
│   ├── auth/
│   │   ├── auth.py                   # Authentication logic
│   │   ├── schemas.py                # Auth data models
│   │   └── security.py               # Security utilities
│   │
│   ├── database/
│   │   ├── db.py                     # Database configuration
│   │   ├── models.py                 # SQLAlchemy models
│   │   ├── crud.py                   # Database operations
│   │   └── test_connection.py        # DB connection test
│   │
│   ├── detectors/                    # Threat detection modules
│   │   ├── brute_force_detector.py
│   │   ├── password_spray_detector.py
│   │   ├── impossible_travel_detector.py
│   │   └── port_scan_detector.py
│   │
│   ├── services/
│   │   └── detection_service.py      # Detection orchestration
│   │
│   ├── scoring/
│   │   └── threat_score.py           # Threat scoring engine
│   │
│   ├── mitre/
│   │   └── mitre_mapper.py           # MITRE ATT&CK mapping
│   │
│   ├── parser/
│   │   └── log_parser.py             # Log parsing logic
│   │
│   ├── report/
│   │   └── report_generator.py       # Report generation
│   │
│   └── models/
│       └── alert.py                  # Alert data model
│
├── frontend/                         # React + Vite frontend
│   ├── package.json                  # Node dependencies
│   ├── vite.config.js               # Vite configuration
│   ├── tailwind.config.js           # Tailwind CSS config
│   │
│   ├── src/
│   │   ├── main.jsx                  # React entry point
│   │   ├── App.jsx                   # Main App component
│   │   ├── index.css                 # Global styles
│   │   │
│   │   ├── api/
│   │   │   └── client.js             # Axios HTTP client
│   │   │
│   │   ├── pages/
│   │   │   ├── DashboardPage.jsx     # Dashboard page
│   │   │   ├── AlertsPage.jsx        # Alerts listing
│   │   │   ├── AlertDetailPage.jsx   # Alert details
│   │   │   ├── StatisticsPage.jsx    # Statistics & trends
│   │   │   └── LoginPage.jsx         # Authentication
│   │   │
│   │   ├── components/
│   │   │   ├── layout/               # Layout components
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── DashboardLayout.jsx
│   │   │   │
│   │   │   ├── alerts/               # Alert components
│   │   │   │   ├── AlertTable.jsx
│   │   │   │   ├── AlertFilters.jsx
│   │   │   │   └── AlertDetail.jsx
│   │   │   │
│   │   │   ├── charts/               # Chart components
│   │   │   │   ├── AlertsOverTimeChart.jsx
│   │   │   │   └── AttackTypeChart.jsx
│   │   │   │
│   │   │   └── common/               # Common components
│   │   │       ├── SeverityBadge.jsx
│   │   │       └── StatCard.jsx
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Authentication context
│   │   │
│   │   ├── hooks/
│   │   │   └── useAlerts.js          # Custom hooks
│   │   │
│   │   └── assets/                   # Static assets
│   │
│   ├── public/                       # Public assets
│   └── index.html                    # HTML entry point
│
└── logs/                             # Log files directory
    └── auth.log                      # Sample auth logs
```

## 👥 Authors

| Name | Role | Contact |
|------|------|---------|
| **Anusmita Ray Chaudhuri** | Backend/Security Specialist | GitHub: https://github.com/anus05 | Email: titirray05@gmail.com | LinkedIn: https://www.linkedin.com/in/anusmita-ray-chaudhuri-856b77303/ |
| **Abir Parmanick** | Machine Learning and Training | GitHub: https://github.com/Abir-2005 | Email: abirpramanick1@gmail.com | LinkedIn: https://www.linkedin.com/in/abir-pramanick-bb663a31b/ |
| **Anirban Ray** | Frontend/UI Developer | GitHub: https://github.com/AnirbanRay20 | Email: anirbanmark1429@gmail.com | LinkedIn: https://www.linkedin.com/in/anirban-ray-0336bb242/ |

## 📜 License

This project is licensed under the MIT License. See LICENSE file for details.

---

## 🤝 Contributing

We welcome contributions! Please feel free to submit issues and pull requests.

## 📞 Support

For issues, questions, or feature requests, please open an issue on the GitHub repository.

## 🔗 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [MITRE ATT&CK Framework](https://attack.mitre.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

---

**Last Updated**: September 2026
