
#  Agentity Backend - https://agentity-backend.onrender.com

## AI Agent Trust, Simulation & Execution Orchestration Layer

Agentity is a backend trust infrastructure for AI agents interacting with blockchain systems.

It provides:

* Agent Identity Registry
* Metadata & Reputation tracking
* Verification lifecycle
* Containerized Simulation Sandbox (Docker)
* CRE-based Execution Routing (with fallback)
* Supabase Auth integration
* Supabase Postgres (single DB – Option B)
* User ↔ Agent interaction tracking (non-ownership)
* Dashboard analytics endpoints
* Logging + monitoring + health checks


# 🏗 System Architecture

```
Frontend (Supabase Auth)
        │
        │  Authorization: Bearer <access_token>
        ▼
Express Backend (Agentity)
        │
        ▼
Supabase Postgres (Single Source of Truth)
        │
        ├── Agents
        ├── Metadata
        ├── Reputation
        ├── Behavior Logs
        └── User-Agent Events (Audit Trail)
        │
        ▼
Docker Simulation Sandbox
        │
        ▼
Chainlink Runtime Environment (CRE)
        │
        ▼
Smart Contracts (Blockchain Layer)
```


# 🎯 Core Philosophy

Agents are **NOT owned by users**.

Instead:

* Multiple users can interact with the same agent.
* We track every user interaction (register, fetch, verify, simulate, execute).
* This is stored in `user_agent_events`.
* RLS ensures users only see their own interaction history.

This design allows:

* Global agent registry
* Independent user audit trails
* Full traceability without ownership constraints


# 🧱 Tech Stack

* Node.js (CommonJS)
* Express
* Sequelize
* Supabase Postgres (DATABASE_URL)
* Supabase Auth (JWT validation)
* Docker (sandbox simulation)
* Chainlink CRE (workflow execution)
* Winston (logging)


# 📁 Project Structure

```
src/
├── app.js
├── server.js
├── config/
│   ├── database.js
│   ├── logger.js
│   └── supabase.js
├── middleware/
│   └── auth.js
├── models/
│   ├── agent.js
│   ├── agentMetadata.js
│   ├── agentReputation.js
│   ├── agentBehaviorLog.js
│   ├── userAgentEvent.js
│   └── index.js (associations)
├── routes/
│   ├── agents.js
│   ├── simulation.js
│   ├── execution.js
│   └── dashboard.js
└── services/
    ├── sandbox/
    ├── cre/
    └── audit/
```

CRE project:

```
agentity-cre/
└── agent-execution/
    ├── main.ts
    ├── workflow.yml
    └── configs...
```


# 🗄 Database Design

## Tables

### Agents

* id (UUID)
* agent_name
* public_key
* fingerprint
* status (pending, verified, suspended)

### AgentMetadata

* agent_id
* model_name
* version
* execution_environment

### AgentReputation

* agent_id
* score
* risk_level

### AgentBehaviorLog

* agent_id
* event_type
* event_payload
* risk_score

### UserAgentEvents

* user_id
* agent_id
* action
* payload
* ip
* user_agent


# 🔐 Supabase RLS (Row Level Security)

`user_agent_events` has RLS enabled.

Policies:

* Users can only SELECT their own records.
* Users can only INSERT records for themselves.
* Updates/deletes disabled (audit immutability).

This ensures:

* Secure multi-user dashboard
* Full traceability
* No cross-user data leakage


# 🧪 How To Run Locally

### 1️⃣ Install dependencies

```
npm install
```

### 2️⃣ Build Docker Sandbox

```
docker build -t agentity-sandbox ./src/sandbox
```

### 3️⃣ Start backend

```
npm run dev
```


# API Documentation

Base URL (local):
`http://localhost:5000`

Base URL (prod):
`https://agentity-backend.onrender.com`

---

# Authentication

Frontend logs in via Supabase Auth.

Frontend must send:

```
Authorization: Bearer <access_token>
```

Backend validates token and attaches `req.user`.

If token is missing:

* Request still works
* User activity logging does not occur

---

# Agent Endpoints

## Register Agent

POST `/agents/register`

Body:

```json
{
  "agent_name": "Agent Alpha",
  "public_key": "0xabc...",
  "model_name": "gpt-4",
  "version": "1.0",
  "execution_environment": "node"
}
```

Logs `agent_register` if authenticated.

---

## Get Agent Profile

GET `/agents/:id`

Logs `agent_fetch` if authenticated.

---

## Verify Agent

POST `/agents/:id/verify`

Logs:

* AgentBehaviorLog entry
* `agent_verify` user event

---

# Simulation

POST `/simulation/:id`

* Runs Docker sandbox
* Produces risk score
* Logs `agent_simulate`

Requires Docker.


# ⚙ Execution

POST `/execute/:id`

Flow:

1. Ensure agent is verified
2. Run simulation
3. Send payload to CRE webhook
4. If webhook missing → fallback execution

Logs `agent_execute`.


# 📊 Dashboard API (Frontend Critical)

GET `/dashboard/overview`

Requires Bearer token.

Returns:

```
{
  user,
  summary: {
    totalActions,
    totalSimulations,
    totalExecutions,
    totalVerifications
  },
  recentActivity,
  lastAgents
}
```

Frontend can build:

* Activity feed
* KPI cards
* Agent interaction history
* Execution charts


# 🔗 Blockchain / Smart Contract Integration

Backend sends to CRE:

* agentId
* fingerprint
* simulation results

Blockchain engineer should:

* Provide contract ABI
* Provide contract address
* Define execution function
* Optionally validate fingerprint on-chain

CRE acts as:

* Secure execution gate
* Policy enforcement layer
* Blockchain relay


# 🧠 CRE Workflow (Current State)

* Cron-based simulation workflow
* Risk threshold enforcement
* Local simulation works
* Deployment requires early access approval

No changes needed due to Supabase integration.

Supabase affects:

* Auth
* Database
* Dashboard
* Audit logs

CRE remains execution layer only.


# 🧪 How To Test Supabase Integration

### Test 1 — DB Connection

```
GET /health
```

Should show `"database": "connected"`.

---

### Test 2 — Auth

Use Supabase login → get access token.

Call:

```
GET /dashboard/overview
Authorization: Bearer <token>
```

Should return user email + stats.

---

### Test 3 — Event Logging

With token:

* Register agent
* Verify agent
* Simulate agent

Check Supabase → `user_agent_events` table.

You should see rows with:

* user_id
* agent_id
* action

---

# 🔍 Monitoring

## Health Check

GET `/health`

Returns:

* status
* DB connectivity
* uptime

## Request Logging

All requests logged with:

* method
* url
* status
* duration
* userId (if authenticated)

---

# 📌 What Backend Has Achieved

* Agent identity registry
* Metadata + reputation storage
* Verification lifecycle
* Docker sandbox orchestration
* CRE integration
* Supabase Auth integration
* Supabase Postgres migration (Option B)
* User ↔ Agent audit tracking
* Dashboard analytics endpoint
* Health monitoring
* Structured logging

This is production-grade architecture.

---

# 👥 Team Integration Guide

## Frontend Developer

You need to:

* Use Supabase Auth for login
* Store `access_token`
* Send `Authorization: Bearer <token>`
* Use:

  * `/agents/*`
  * `/simulation/:id`
  * `/execute/:id`
  * `/dashboard/overview`

---

## Blockchain Engineer

You need to:

* Provide ABI
* Provide contract address
* Define execution method
* Connect CRE workflow to contract
* Define event emission structure


# 🏁 Final Status

Backend is:

* Fully functional
* Fully integrated with Supabase
* Simulation-ready
* CRE-ready
* Dashboard-ready
* Team-ready


