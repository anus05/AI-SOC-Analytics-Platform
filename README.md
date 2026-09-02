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
