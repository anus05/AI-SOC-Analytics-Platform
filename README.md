# 🛡️ AI-SOC Analytics Platform

> An AI-powered Security Operations Center (SOC) platform for real-time threat detection, alert investigation, explainable AI scoring, threat intelligence enrichment, attack-chain visualization, and automated response (SOAR).

![Python](https://img.shields.io/badge/Python-3.11-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-Latest-green)
![React](https://img.shields.io/badge/React-19-61DAFB)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)
![GitHub Actions](https://img.shields.io/badge/CI-GitHub%20Actions-success)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## Contents

- [Overview](#overview)
- [Key Capabilities](#key-capabilities)
- [Threat Detection Modules](#threat-detection-modules)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Running Locally](#running-locally)
- [API Overview](#api-overview)
- [Machine Learning and Explainability](#machine-learning-and-explainability)
- [Testing](#testing)
- [Contributors](#contributors)
- [License](#license)

---

## Overview

AI-SOC Analytics Platform combines a FastAPI backend, a React dashboard, machine-learning services, and SOC operations workflows into one system. It ingests security logs, detects suspicious activity across 10+ attack techniques, scores alerts with explainable AI, enriches indicators with external threat intelligence, maps activity to MITRE ATT&CK, visualizes attack chains, generates investigation reports, and lets analysts trigger automated response actions — all from a single dashboard.

## Key Capabilities

### Detection and monitoring
- Log parsing and ingestion, including bulk log-file upload
- Rule-based and ML-assisted detection across 10 techniques (see below)
- Alert filtering, correlation, severity scoring, and dashboard statistics

### Investigation and response
- AI investigation copilot for natural-language alert analysis
- Explainable threat scoring with human-readable risk factors
- MITRE ATT&CK technique mapping and attack-chain visualization
- SOAR actions: block an IP, disable a user, kill a process, and auto-generate Sigma, Snort, or YARA rules
- Incident report generation and download (PDF, DOCX, HTML, Markdown)

### Threat intelligence
- VirusTotal, AbuseIPDB, WHOIS, and GeoIP lookups
- IP reputation analysis

## Threat Detection Modules

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
| Lateral movement | T1021 (family) |

## Technology Stack

| Layer | Tools |
| --- | --- |
| Backend | Python 3.11, FastAPI, SQLAlchemy, Pydantic, JWT auth |
| Database | SQLite (local dev), PostgreSQL (Docker/production) |
| Caching / Graph | Redis, Neo4j *(provisioned via Docker Compose; optional for pure local dev)* |
| Frontend | React 19, Vite, Tailwind CSS, Axios, React Router, Chart.js |
| Machine Learning | Scikit-learn, Pandas, NumPy, Joblib |
| DevOps | Docker, Docker Compose, GitHub Actions CI, Pytest |

## System Architecture

```text
                        Security Logs
                              │
                              ▼
                    Log Parser / Ingestion
                              │
                              ▼
                 Threat Detection Modules
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
     ML Prediction     Threat Intelligence     MITRE Mapper
          │                   │                   │
          └──────────────┬────┴───────────────────┘
                          ▼
              Explainable AI Threat Scoring
                          │
                          ▼
                    Alert Database
                          │
         ┌────────────────┼─────────────────┐
         ▼                ▼                  ▼
     Dashboard        AI Copilot        SOAR Engine
                          │
                          ▼
             Threat Intel & MITRE Enrichment,
             Attack-Chain View, Report Generation
```

The Docker Compose stack provisions PostgreSQL, Redis, Neo4j, the FastAPI backend, and the production frontend container.

## Project Structure

```text
AI-SOC-Analytics-Platform/
├── backend/
│   ├── api/              API routers (alerts, copilot, attack-chain, threat-intel, reports, SOAR)
│   ├── auth/             Authentication and security (JWT, password hashing)
│   ├── database/         SQLAlchemy models, migrations, and CRUD operations
│   ├── detectors/        Rule-based threat-detection logic
│   ├── mitre/            MITRE ATT&CK technique mapping
│   ├── parser/           Log parsing
│   ├── scoring/          Explainable threat scoring
│   ├── services/         ML inference, copilot, SOAR, report generation, enrichment
│   ├── tests/             Backend tests
│   └── main.py             FastAPI application entry point
├── frontend/
│   ├── src/                React application (pages, components, hooks, context)
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── ML/
│   ├── data/                Training data
│   ├── models/               Saved/trained models
│   ├── plots/                 Evaluation plots
│   ├── reports/                Evaluation reports
│   └── train_model.py
├── logs/                    Local log inputs
├── reports/                  Generated incident reports
├── .github/workflows/         CI pipeline (ci.yml)
├── docker-compose.yml         Full local service stack
├── Dockerfile                 Backend image definition
└── README.md
```

## Quick Start

### Option 1: Docker Compose (recommended)

From the repository root:

```bash
docker compose up --build
```

| Service | URL |
| --- | --- |
| Frontend | `http://localhost:5173` |
| Backend | `http://localhost:8000` |
| API docs (Swagger) | `http://localhost:8000/docs` |
| Neo4j browser | `http://localhost:7474` |

To stop the stack:

```bash
docker compose down
```

### Option 2: Run backend and frontend separately

Prerequisites: Python 3.11+, Node.js and npm. PostgreSQL/Redis/Neo4j are only needed if you're not using SQLite for local dev.

```bash
git clone https://github.com/anus05/AI-SOC-Analytics-Platform.git
cd AI-SOC-Analytics-Platform
```

**Backend:**

```bash
cd backend
python -m venv venv
```

Windows PowerShell:
```powershell
.\venv\Scripts\Activate.ps1
```

```bash
pip install -r requirements.txt
```

**Frontend** (in a second terminal):

```bash
cd frontend
npm install
```

## Configuration

The backend reads database and service settings from environment variables. For a simple local run, create `backend/.env`:

```env
DATABASE_URL=sqlite:///./soc.db
SECRET_KEY=replace-with-a-long-random-value
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
SKIP_DB_MIGRATION=false
```

Docker Compose supplies PostgreSQL, Redis, and Neo4j connection values automatically. **Rotate `SECRET_KEY` and any API keys before using this outside local development** — see the repo's `.env` handling notes if you're re-sharing this project.

## Running Locally

**Backend** (from the repository root, so the `backend.*` package imports resolve correctly):

```bash
python -m uvicorn backend.main:app --reload --port 8000
```

**Frontend** (in a second terminal):

```bash
cd frontend
npm run dev
```

| Service | URL |
| --- | --- |
| Frontend | `http://localhost:5173` |
| Backend health | `http://localhost:8000/health` |
| OpenAPI docs | `http://localhost:8000/docs` |

## API Overview

All protected endpoints require a bearer token returned by `/auth/login`.

> ⚠️ **Needs verification against current backend code:** the two prior README drafts disagreed on a few routes below. Confirm these against `backend/api/*.py` and `backend/auth/auth.py` and update this table once verified — flagged rows are marked.

### Authentication

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/auth/register` | Register a user |
| `POST` | `/auth/login` | Obtain an access token |
| `GET` | `/auth/me` ⚠️ | Get the current user *(one draft had this as `/auth/profile` — verify)* |

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
| `GET` | `/api/copilot/explain-score/{alert_id}` | Explain an alert's threat score |
| `GET` | `/api/attack-chain/{alert_id}` | Get an alert's attack chain |
| `GET` | `/api/threat-intel/{ip}` | Enrich an IP address |
| `POST` | `/api/report/generate/{alert_id}` ⚠️ | Generate an incident report *(one draft used separate `/report/pdf`, `/report/docx`, etc. — verify which pattern is implemented)* |
| `GET` | `/api/report/download/{report_id}` | Download a generated report |
| `POST` | `/api/soar/action` | Execute a SOAR response action |

For complete request/response schemas, use the interactive OpenAPI docs at `/docs`.

## Machine Learning and Explainability

The ML pipeline predicts malicious behavior from extracted security-log features. Alert results include:

- Threat probability and confidence score
- False-positive probability
- Risk classification and risk factors
- A human-readable explanation of the score

Training data, trained models, evaluation plots, and reports are stored under `ML/`.

## Testing

```bash
# Backend
pytest backend/tests -v

# Frontend
cd frontend
npm run lint
npm run build
```

CI runs the backend test suite automatically on push/PR via GitHub Actions (`.github/workflows/ci.yml`), with `SKIP_DB_MIGRATION=true` so tests don't depend on a live database.

## Contributors

| Name | Role |
| --- | --- |
| Anusmita Ray Chaudhuri | Backend development, security engineering, FastAPI APIs, AI integration |
| Anirban Ray | Full-stack development — frontend/dashboard UI, plus cross-team backend and integration support |
| Abir Pramanick | Machine learning, model training, and evaluation |

## License

This project is licensed under the MIT License.

---

⭐ If you find this project useful, consider giving it a star on GitHub.
