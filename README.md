# 🚀 Agentity Backend

> Trust infrastructure for AI agents — identity registry, metadata storage, containerized simulation sandbox, and CI/CD automation.

🌐 **Live Backend:**
[https://agentity-backend.onrender.com](https://agentity-backend.onrender.com)

---

# 📌 Overview

Agentity Backend provides the foundational trust layer for AI-driven blockchain interactions.

This backend currently implements:

* ✅ AI Agent Identity Registry
* ✅ Metadata Storage System
* ✅ Reputation & Behavioral Logging
* ✅ Agent Verification Workflow
* ✅ Containerized Simulation Sandbox (Docker-based)
* ✅ Backend Container Orchestration
* ✅ CI/CD Pipelines (GitHub Actions)
* ✅ Production Deployment on Render

This system ensures AI agents are verified and behavior-tested before being allowed to execute on-chain actions.

---

# 🏗 System Architecture

```
Agent → Register → Identity Registry
              ↓
        Verification
              ↓
   Containerized Simulation Sandbox
              ↓
        Risk Score Logged
              ↓
   (Next Phase) Chainlink Runtime Execution
```

---

# 🛠 Tech Stack

| Layer            | Technology          |
| ---------------- | ------------------- |
| Runtime          | Node.js (CommonJS)  |
| Framework        | Express.js          |
| ORM              | Sequelize           |
| Database         | PostgreSQL (Render) |
| Logging          | Winston             |
| Containerization | Docker              |
| CI/CD            | GitHub Actions      |
| Hosting          | Render              |

---

# 🌍 Production Deployment

Base URL:

```
https://agentity-backend.onrender.com
```

---

# 🔎 Health Monitoring

### GET `/health`

Checks server status and database connectivity.

**Response**

```json
{
  "status": "healthy",
  "database": "connected",
  "uptime": 123.45
}
```

Used for monitoring and infrastructure validation.

---

# 🔐 Identity Registry APIs

Base URL:

```
https://agentity-backend.onrender.com
```

---

## 1️⃣ Register Agent

**POST** `/agents/register`

### Request Body

```json
{
  "agent_name": "Agent Alpha",
  "public_key": "0x123abc...",
  "model_name": "GPT-4",
  "version": "1.0",
  "execution_environment": "node"
}
```

### What Happens

* Agent fingerprint generated
* Metadata stored
* Reputation initialized
* Status set to `pending`

### Response

```json
{
  "id": "uuid",
  "agent_name": "Agent Alpha",
  "status": "pending"
}
```

---

## 2️⃣ Get Agent Profile

**GET** `/agents/:id`

Returns:

* Agent information
* Metadata
* Reputation
* Behavioral logs

---

## 3️⃣ Verify Agent

**POST** `/agents/:id/verify`

Changes agent status to:

```
verified
```

Also logs verification event in behavioral logs.

---

# 🧪 Simulation Sandbox APIs

Simulation uses isolated Docker container execution.

---

## 4️⃣ Run Agent Simulation

**POST** `/simulation/:id`

### Requirement

Agent must be:

```
status = verified
```

If not verified → request fails.

---

### What Happens Internally

1. Backend verifies agent status
2. Docker container is launched
3. Sandbox runner executes isolated logic
4. Risk score is generated
5. Behavioral log entry is created
6. JSON response returned

---

### Example Response

```json
{
  "agentId": "uuid",
  "riskScore": 0.42,
  "status": "safe"
}
```

---

# 📊 Behavioral Logging

All verification and simulation events are stored in:

```
AgentBehaviorLog
```

Fields stored:

* event_type
* event_payload (JSON)
* risk_score
* timestamps

This enables:

* Reputation tracking
* Risk analytics
* Future ML scoring
* Audit compliance

---

# 🐳 Sandbox Architecture

Sandbox is a Docker image:

```dockerfile
FROM node:18-alpine
WORKDIR /sandbox
COPY sandbox-runner.js .
ENTRYPOINT ["node", "sandbox-runner.js"]
CMD []
```

The sandbox:

* Runs in isolation
* Accepts agent ID
* Produces risk output JSON
* Exits automatically
* Is destroyed after execution

---

# ⚙️ Local Development Setup

### 1️⃣ Install Dependencies

```
npm install
```

---

### 2️⃣ Start PostgreSQL (Docker)

```
docker compose up -d
```

---

### 3️⃣ Build Sandbox Image

```
docker build -t agentity-sandbox ./src/sandbox
```

---

### 4️⃣ Start Backend

```
npm run dev
```

---

# 🌐 Environment Variables

## Local Development

```
DB_HOST=localhost
DB_USER=postgres
DB_PASS=postgres
DB_NAME=agentity
DB_PORT=5433
NODE_ENV=development
```

---

## Production (Render)

```
DATABASE_URL=postgresql://<user>:<pass>@<host>:5432/<db>
NODE_ENV=production
```

SSL is automatically enabled in production mode.

---

# 🔄 CI/CD Pipelines

GitHub Actions configured for:

### Backend CI

* Install dependencies
* Build sandbox Docker image
* Validate project build

Triggered on:

```
push to main
pull requests
```

---

### Smart Contract CI (If Using Hardhat)

* Install dependencies
* Run contract tests

Ensures contract integrity before deployment.

---

# 🧠 Security Model

Simulation execution only allowed if:

```
agent.status === "verified"
```

This prevents:

* Untrusted agent execution
* Malicious sandbox attempts
* Unauthorized behavior testing

---

# 📂 Project Structure

```
src/
 ├── config/
 ├── models/
 ├── routes/
 │    ├── agents.js
 │    ├── simulation.js
 ├── services/
 │    ├── sandbox/
 │    │    ├── dockerRunner.js
 │    │    ├── sandboxService.js
 ├── sandbox/
 │    ├── Dockerfile
 │    ├── sandbox-runner.js
 ├── app.js
 ├── server.js
```

---

# 🎯 Backend Responsibilities Completed

✔ Identity Registry
✔ Metadata Storage
✔ Verification Engine
✔ Behavioral Logging
✔ Container Orchestration
✔ Simulation Sandbox
✔ CI/CD Automation
✔ Production Deployment

---

# 🔮 Next Phase

* Chainlink Runtime Environment (CRE) integration
* Secure blockchain execution enforcement
* Risk threshold validation before execution
* Multi-chain expansion

---

# 👨‍💻 Frontend Integration Guide

Frontend should:

1. Register agent
2. Display agent profile
3. Show verification status
4. Trigger simulation
5. Display risk score
6. Display behavior logs
7. Monitor health endpoint

All APIs are RESTful and return JSON.

---

# 📌 Important Notes

* Docker must be installed where simulation runs.
* Render does NOT support Docker-in-Docker.
* Sandbox currently runs locally.
* Production sandbox will require separate container hosting.

---

# 🏁 Project Status

Backend trust infrastructure is fully operational.

Frontend can now integrate identity and simulation APIs.

Chainlink execution layer integration is next.

