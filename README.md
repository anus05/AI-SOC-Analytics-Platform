# AI-SOC Analytics Platform

> An AI-powered Security Operations Center (SOC) platform for threat detection, alert investigation, threat intelligence enrichment, explainable scoring, incident reporting, and automated response.
![Python](https://img.shields.io/badge/Python-3.11-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-green)
![React](https://img.shields.io/badge/React-19-61DAFB)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## Contents

- [Overview](#overview)
- [Key Capabilities](#key-capabilities)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Running Locally](#running-locally)
- [API Overview](#api-overview)
- [Detection and Investigation](#detection-and-investigation)
- [Machine Learning and Explainability](#machine-learning-and-explainability)
- [Development](#development)
- [Project Structure](#project-structure)
- [Contributors](#contributors)
- [License](#license)

## Overview
AI-SOC Analytics Platform combines a FastAPI backend, React dashboard, machine-learning services, and security operations workflows. It ingests security logs, detects suspicious activity, scores alerts, enriches indicators, maps activity to MITRE ATT&CK, and helps analysts investigate and respond.

## Key Capabilities
### Detection and monitoring

- Log parsing and ingestion
- Brute-force, password-spray, impossible-travel, and port-scan detection
- Credential-dumping, privilege-escalation, PowerShell, PsExec, encoded-command, ransomware, and lateral-movement detections
- Alert filtering, severity scoring, correlation, and dashboard statistics

### Investigation and response
- AI investigation copilot
- Explainable threat scoring and risk factors
- MITRE ATT&CK technique mapping
- Attack-chain visualization
- SOAR actions such as blocking an IP, disabling a user, killing a process, and generating Sigma, Snort, or YARA rules
- Incident report generation and PDF download

### Threat intelligence
- VirusTotal
- AbuseIPDB
- WHOIS
- GeoIP
- IP reputation analysis

## Architecture
```text
Security logs
     |
     v
Log parser and ingestion
     |
     v
Detection services ---- Machine-learning prediction
     |                              |
     +-------- Threat scoring ------+
                     |
                     v
                Alert database
            /       |        \
           v        v         v
     Dashboard  Copilot   SOAR/reporting
                     |
                     v
          Threat intelligence and
          MITRE ATT&CK enrichment
```

The Docker Compose stack provides PostgreSQL, Redis, Neo4j, the FastAPI backend, and the production frontend container.

## Quick Start

### Option 1: Docker Compose

From the repository root:

```bash
docker compose up --build
```

Open the application at `http://localhost:5173`. The backend is available at `http://localhost:8000`, and FastAPI documentation is available at `http://localhost:8000/docs`.

To stop the stack:

```bash
docker compose down
```

### Option 2: Run backend and frontend separately

Prerequisites:

- Python 3.11 or later
- Node.js and npm
- PostgreSQL, Redis, and Neo4j when using the external-service configuration

Install the backend:

```bash
cd backend
python -m venv venv
```

Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Install the frontend in a second terminal:

```bash
cd frontend
npm install
```

## Configuration

The backend reads its database and service settings from environment variables. For a simple local run, create `backend/.env` with:

```env
DATABASE_URL=sqlite:///./soc.db
SECRET_KEY=replace-with-a-long-random-value
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

The Docker Compose configuration supplies the PostgreSQL, Redis, and Neo4j connection values to the backend automatically. Update secrets before using the stack outside local development.

## Running Locally

Start the backend from the repository root:

```bash
python -m uvicorn backend.main:app --reload --port 8000
```

Start the frontend in a second terminal:

```bash
cd frontend
npm run dev
```

Useful local URLs:

| Service | URL |
| --- | --- |
| Frontend | `http://localhost:5173` |
| Backend health | `http://localhost:8000/health` |
| OpenAPI docs | `http://localhost:8000/docs` |
| Neo4j browser | `http://localhost:7474` |

## API Overview

All protected endpoints require a bearer token returned by `/auth/login`.

### Authentication

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/auth/register` | Register a user |
| `POST` | `/auth/login` | Obtain an access token |
| `GET` | `/auth/me` | Get the current user |

### Alerts and detection

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/upload-logs` | Upload and analyze a log file |
| `POST` | `/scan` | Scan the configured log source |
| `GET` | `/alerts` | List and filter alerts |
| `GET` | `/alerts/{alert_id}` | Retrieve an alert |
| `GET` | `/statistics` | Get alert statistics |
| `GET` | `/dashboard` | Get dashboard data |

### Investigation, reports, and response

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/copilot/investigate/{alert_id}` | Investigate an alert with the AI copilot |
| `GET` | `/api/copilot/explain-score/{alert_id}` | Explain an alert score |
| `GET` | `/api/attack-chain/{alert_id}` | Get an alert attack chain |
| `GET` | `/api/threat-intel/{ip}` | Enrich an IP address |
| `POST` | `/api/report/generate/{alert_id}` | Generate an incident report |
| `GET` | `/api/report/download/{report_id}` | Download a report PDF |
| `POST` | `/api/soar/action` | Execute a response action |

For the complete request and response schemas, use the interactive OpenAPI documentation at `/docs`.

## Detection and Investigation

Detected activity is mapped to MITRE ATT&CK techniques, enriched with available threat-intelligence data, and persisted as alerts. Analysts can review severity and threat scores, inspect explainable risk factors, investigate alerts with the copilot, visualize attack chains, generate reports, and trigger response actions from the dashboard.

Common technique mappings include:

| Detector | MITRE ATT&CK technique |
| --- | --- |
| Brute force | T1110 |
| Password spray | T1110.003 |
| Impossible travel | T1550 |
| Port scan | T1046 |
| Credential dumping | T1003 |
| Privilege escalation | T1068 |
| PowerShell abuse | T1059 |
| PsExec | T1021 |
| Encoded commands | T1027 |
| Ransomware behavior | T1486 |

## Machine Learning and Explainability

The ML pipeline predicts malicious behavior from extracted security-log features. Alert results can include:

- Threat probability
- Confidence score
- False-positive probability
- Risk classification
- Risk factors and a human-readable explanation

Training data, models, plots, and generated evaluation reports are stored under `ML/`.

## Development

Run backend tests:

```bash
pytest backend/tests -v
```

Run frontend checks and build:

```bash
cd frontend
npm run lint
npm run build
```

## Project Structure

```text
AI-SOC-Analytics-Platform/
├── backend/
│   ├── api/              API routers
│   ├── auth/             Authentication and security
│   ├── database/         SQLAlchemy models and CRUD operations
│   ├── detectors/        Threat-detection rules
│   ├── mitre/            MITRE ATT&CK mapping
│   ├── parser/           Log parsing
│   ├── scoring/          Threat scoring
│   ├── services/         ML, copilot, SOAR, reports, and enrichment
│   ├── tests/             Backend tests
│   └── main.py            FastAPI application entry point
├── frontend/
│   ├── src/               React application
│   └── package.json       Frontend scripts and dependencies
├── ML/                    Training data, models, plots, and reports
├── logs/                  Local log inputs
├── docker-compose.yml     Full local service stack
├── Dockerfile             Backend image definition
└── README.md
```

## Contributors

| Name | Role |
| --- | --- |
| Anusmita Ray Chaudhuri | Backend development, security engineering, FastAPI APIs, AI integration |
| Anirban Ray | Frontend development and dashboard UI |
| Abir Pramanick | Machine learning, model training, and evaluation |

## License

This project is licensed under the MIT License.
# 🛡️ AI-SOC Analytics Platform

> **An AI-powered Security Operations Center (SOC) Analytics Platform for intelligent threat detection, automated incident response, explainable AI scoring, threat intelligence enrichment, and attack chain visualization.**

![Python](https://img.shields.io/badge/Python-3.11-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-Latest-green)
![React](https://img.shields.io/badge/React-19-61DAFB)
![License](https://img.shields.io/badge/License-MIT-yellow)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)
![GitHub Actions](https://img.shields.io/badge/CI-GitHub%20Actions-success)

---

# 📑 Table of Contents

- Overview
- Features
- System Architecture
- Threat Detection Modules
- Technology Stack
- Project Structure
- Installation
- Configuration
- Running the Application
- API Endpoints
- Machine Learning
- Explainable AI
- Threat Intelligence
- SOAR Automation
- Attack Chain Visualization
- Report Generation
- Testing
- Contributors
- License

---

# 🎯 Overview

AI-SOC Analytics Platform is an enterprise-ready Security Operations Center (SOC) solution developed using FastAPI, React, Machine Learning, and the MITRE ATT&CK Framework.

The platform continuously analyzes security logs, detects malicious activities, calculates AI-powered threat scores, enriches alerts using threat intelligence services, maps attacks to MITRE ATT&CK, generates investigation reports, and assists analysts with AI-powered recommendations.

---

# ✨ Features

## Security Monitoring

- Real-time Threat Detection
- Log Parsing
- Alert Correlation
- Threat Severity Scoring
- Dashboard Analytics

## Artificial Intelligence

- Machine Learning Prediction
- Explainable AI Scoring
- AI Copilot Assistant
- Risk Prediction
- False Positive Estimation

## Threat Intelligence

- VirusTotal Integration
- AbuseIPDB Lookup
- WHOIS Lookup
- GeoIP Lookup
- IP Reputation Analysis

## Detection Modules

- Brute Force Detection
- Password Spray Detection
- Impossible Travel Detection
- Port Scan Detection
- Credential Dumping Detection
- Privilege Escalation Detection
- PowerShell Abuse Detection
- PsExec Detection
- Encoded Command Detection
- Suspicious Admin Activity
- Ransomware Behaviour Detection
- Lateral Movement Detection

## SOC Operations

- MITRE ATT&CK Mapping
- Attack Chain Visualization
- Incident Report Generation
- SOAR Automation
- Dashboard Statistics

## Reports

Generate reports in

- PDF
- DOCX
- HTML
- Markdown

---

# 🏗️ System Architecture

```
                        Security Logs
                              │
                              ▼
                    Log Parser Engine
                              │
                              ▼
                 Threat Detection Modules
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
     ML Prediction     Threat Intelligence   MITRE Mapper
          │                   │                   │
          └──────────────┬────┴───────────────┐
                         ▼
              Explainable AI Scoring
                         │
                         ▼
                    Alert Database
                         │
         ┌───────────────┼────────────────┐
         ▼               ▼                ▼
     Dashboard      AI Copilot      SOAR Engine
```

---

# 🔍 Threat Detection Modules

| Detector | MITRE Technique |
|----------|----------------|
| Brute Force | T1110 |
| Password Spray | T1110.003 |
| Impossible Travel | T1550 |
| Port Scan | T1046 |
| Credential Dumping | T1003 |
| Privilege Escalation | T1068 |
| PowerShell Abuse | T1059 |
| PsExec | T1021 |
| Encoded Commands | T1027 |
| Ransomware Behaviour | T1486 |

---

# 💻 Technology Stack

## Backend

- Python 3.11
- FastAPI
- SQLAlchemy
- Pydantic
- JWT Authentication
- SQLite
- PostgreSQL

## Frontend

- React 19
- Vite
- Tailwind CSS
- Axios
- React Router
- Chart.js

## Machine Learning

- Scikit-learn
- Pandas
- NumPy
- Joblib

## DevOps

- Docker
- Docker Compose
- GitHub Actions
- Pytest

---

# 📂 Project Structure

```
AI-SOC-Analytics-Platform
│
├── backend
│   ├── api
│   ├── auth
│   ├── database
│   ├── detectors
│   ├── parser
│   ├── scoring
│   ├── mitre
│   ├── report
│   ├── services
│   ├── tests
│   └── main.py
│
├── frontend
│   ├── src
│   ├── public
│   ├── package.json
│   └── vite.config.js
│
├── ML
│   ├── data
│   ├── models
│   ├── reports
│   ├── plots
│   └── train_model.py
│
├── logs
├── reports
├── docker-compose.yml
└── README.md
```

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/anus05/AI-SOC-Analytics-Platform.git

cd AI-SOC-Analytics-Platform
```

## Backend

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate

pip install -r requirements.txt
```

## Frontend

```bash
cd frontend

npm install
```

---

# ⚙️ Configuration

Create `.env`

```
DATABASE_URL=sqlite:///./soc.db

SECRET_KEY=your_secret_key

ALGORITHM=HS256

ACCESS_TOKEN_EXPIRE_MINUTES=30
```

---

# ▶️ Running the Project

## Backend

```bash
cd backend

python main.py
```

Backend

```
http://localhost:8000
```

---

## Frontend

```bash
cd frontend

npm run dev
```

Frontend

```
http://localhost:5173
```

---

# 📚 API Endpoints

## Authentication

```
POST /auth/register

POST /auth/login

GET /auth/profile
```

## Detection

```
POST /scan

GET /alerts

GET /alerts/{id}

GET /statistics

GET /dashboard

GET /distribution
```

## Reports

```
POST /report/pdf

POST /report/docx

POST /report/html

POST /report/markdown
```

## AI

```
POST /copilot/query

GET /threat-intel/{ip}

GET /attack-chain/{alert_id}

POST /soar/action
```

---

# 🤖 Machine Learning

The platform uses supervised machine learning models to predict malicious behavior based on extracted security log features.

Features include

- Threat Probability
- Confidence Score
- False Positive Probability
- Risk Classification

---

# 🧠 Explainable AI

Each generated alert contains

- AI Threat Score
- Confidence
- ML Probability
- False Positive Probability
- Risk Factors
- Human-readable Explanation

---

# 🌐 Threat Intelligence

Supports

- VirusTotal
- AbuseIPDB
- WHOIS
- GeoIP
- IP Reputation

---

# ⚡ SOAR Automation

Automated response actions

- Block IP
- Disable User
- Generate Sigma Rule
- Generate Snort Rule
- Generate YARA Rule
- Kill Process
- Create Incident Ticket

---

# 🔗 Attack Chain Visualization

Visual investigation interface showing

- Initial Access
- Execution
- Persistence
- Privilege Escalation
- Defense Evasion
- Credential Access
- Discovery
- Lateral Movement
- Impact

---

# 📄 Report Generation

Generate reports in

- PDF
- DOCX
- HTML
- Markdown

---

# 🧪 Testing

Run backend tests

```bash
pytest backend/tests -v
```

---

# 👨‍💻 Contributors

| Name | Role |
|------|------|
| **Anusmita Ray Chaudhuri** | Backend Development, Security Engineering, FastAPI APIs, AI Integration |
| **Anirban Ray** | Frontend Development (React.js), Dashboard UI |
| **Abir Pramanick** | Machine Learning, Model Training & Evaluation |

---

# 📜 License

This project is licensed under the MIT License.

---

# ⭐ Support

If you like this project, please consider giving it a ⭐ on GitHub.
