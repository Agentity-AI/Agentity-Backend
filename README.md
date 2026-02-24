# FULL UPDATED README (Copy & Paste)


# Agentity Backend

Secure AI Agent Identity, Simulation, and Blockchain Execution Orchestration Layer.


## Overview

Agentity is a backend infrastructure system designed to securely manage AI agents interacting with blockchain smart contracts.

It provides:

* Identity registry and fingerprinting
* Metadata and behavioral storage
* Risk simulation in isolated Docker sandboxes
* Trust scoring and enforcement
* Secure execution routing via Chainlink Runtime Environment (CRE)
* Logging, monitoring, and analytics pipelines

This backend ensures that AI agents are verified, tested, and approved before interacting with smart contracts.


# Architecture Overview

```
Frontend
   ↓
Backend (Express API)
   ↓
Docker Simulation Sandbox
   ↓
Risk Scoring + Validation
   ↓
Chainlink Runtime Environment (CRE)
   ↓
Smart Contract Execution
```


# Phase 1 — Identity Registry & Metadata

### Implemented:

* Agent registration endpoint
* Unique fingerprint generation
* Metadata storage (PostgreSQL + Sequelize)
* Agent verification flag
* Logging of registration events

### Database:

PostgreSQL (Render / Docker / Local)

### Key API:

```
POST   /agents
GET    /agents
GET    /agents/:id
```

---

# Phase 2 — Simulation Sandbox (Docker)

Each agent is evaluated in an isolated container before execution.

### What Happens:

1. Agent behavior is simulated.
2. Risk score is generated.
3. Backend evaluates trust threshold.
4. If risk ≥ 0.7 → execution denied.
5. If risk < 0.7 → eligible for CRE execution.

### Docker:

Custom container image:

```
agentity-sandbox
```

Simulation triggered internally via Node backend.

---

# Phase 3 — CRE Integration (Chainlink Runtime)

CRE acts as the secure execution mediator between backend and blockchain.

### Current Status:

* CRE CLI installed
* TypeScript SDK integrated
* Workflow created (`agent-execution`)
* Local simulation successful
* Deployment access requested

### CRE Workflow Logic:

* Accept execution payload
* Validate risk score
* Enforce defense-in-depth validation
* Prepare smart contract call (next phase)

### Backend Integration:

Environment variables:

```
CRE_WEBHOOK_URL=...
CRE_API_KEY=...
```

Fallback logic implemented if CRE deployment is pending.

---

# Logging & Monitoring

Implemented:

* Request logging with duration tracking
* Structured logging via Winston
* Health endpoint
* Database connectivity monitoring
* Error handling middleware

### Health Check:

```
GET /health
```

Returns:

```
{
  "status": "healthy",
  "database": "connected",
  "uptime": 123.45
}
```

---

# 🌐 API Routes (Frontend Integration Guide)

## Agents

### Register Agent

```
POST /agents
```

Body:

```
{
  "name": "Agent Alpha",
  "owner": "0x123..."
}
```

Response:

```
{
  "id": "...",
  "fingerprint": "...",
  "verified": true
}
```

---

## Simulate Agent

```
POST /simulation/:id
```

Runs Docker sandbox simulation.

Response:

```
{
  "riskScore": 0.42,
  "status": "safe"
}
```

---

## Execute Agent

```
POST /execute/:id
```

Flow:

1. Verify agent
2. Run simulation
3. Enforce risk threshold
4. Send to CRE (if deployed)
5. Return execution status

Response:

```
{
  "status": "executed",
  "agentId": "...",
  "executedAt": "..."
}
```

---

# 🐳 Docker Setup

Build sandbox:

```
docker build -t agentity-sandbox ./src/sandbox
```

Run manually:

```
docker run --rm agentity-sandbox
```

---

# 🗄 Environment Variables

Backend:

```
PORT=5000
DB_HOST=...
DB_USER=...
DB_PASS=...
DB_NAME=...
DB_PORT=5432

CRE_WEBHOOK_URL=...
CRE_API_KEY=...
```

---

# 🚀 Deployment

Backend: Render
Database: Render Postgres
Sandbox: Docker
CRE: Chainlink Runtime (deployment pending org access)



# Security Design Principles

* Defense-in-depth validation (Backend + CRE)
* Isolated execution environment (Docker)
* Risk threshold enforcement
* Structured logging
* Fail-safe execution fallback

---

# Current System Status

✔ Identity Registry
✔ Metadata Storage
✔ Docker Simulation
✔ Risk Enforcement
✔ Logging & Monitoring
✔ CRE Local Workflow Simulation
⏳ CRE Deployment Pending
⏳ Smart Contract Integration Pending

---

# 📌 Hackathon Readiness

System is fully functional locally.

CRE deployment access requested.

Fallback execution ensures demo continuity.

