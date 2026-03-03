# 🚀 Agentity Backend

> Identity Registry + AI Agent Verification + Simulation + Blockchain Sync + Supabase Auth + Dashboard Analytics

Live Deployment:

```
https://agentity-backend.onrender.com
```


# 📌 Project Overview

Agentity is a backend system designed to:

* Register and verify AI agents
* Track user interaction with agents
* Simulate agent execution in sandbox
* Execute agents via Chainlink CRE
* Sync agent registration to blockchain (Avalanche C-Chain)
* Provide a structured dashboard for frontend
* Track analytics and vulnerabilities
* Use Supabase for authentication and database


# 🏗️ System Architecture

### 🔐 Authentication Layer

* Supabase Auth
* JWT-based access control
* Backend verifies Supabase access_token

### 🗄️ Database Layer

* Supabase Managed PostgreSQL
* Sequelize ORM
* Row Level Security (Supabase side)
* Service role used for backend writes

### 🤖 Agent Layer

* Agent registry
* Metadata
* Reputation
* Behavior logs
* Blockchain sync metadata

### 🧪 Simulation Layer

* Docker-based sandbox
* Local simulation service

### 🔗 Blockchain Layer

* On-chain registration support
* Avalanche C-Chain
* Tracks:

  * blockchain_agent_id
  * blockchain_tx_hash
  * blockchain_registered_at
  * blockchain_sync_status

### 📊 Dashboard Analytics Layer

* User activity tracking
* Agent interaction tracking
* Vulnerability detection metrics
* Chart aggregation (7-day series)


# 🔐 Authentication Flow

## Auth (Supabase)

Agentity uses **Supabase Auth** for user registration and login.
Backend returns the **Supabase access_token** as `jwt` (it is a JWT).

### POST `/auth/register`

Creates a new user in Supabase Auth and returns `{ email, name, jwt, dashboard }`.

**Request**

```json
{
  "email": "user@mail.com",
  "password": "Password123!",
  "name": "John Doe"
}```

### Response

```{
  "email": "user@mail.com",
  "name": "John Doe",
  "jwt": "<supabase_access_token>",
  "dashboard": { ... }
}```


## POST `/auth/login`

### Request

```json
{
  "email": "user@mail.com",
  "password": "Password123!"
}
```

### Response

```json
{
  "email": "user@mail.com",
  "name": "John Doe",
  "jwt": "<supabase_access_token>",
  "dashboard": { ... }
}
```



### 🔑 JWT Usage

All protected endpoints require:

```
Authorization: Bearer <jwt>
```

JWT = Supabase `access_token`.

Backend verifies token using:

```
supabaseAdmin.auth.getUser(token)
```

---

# 👤 Dashboard Endpoint

## GET `/dashboard/overview`

Requires Bearer token.

Returns frontend dashboard DTO:

```js
{
  email,
  name,
  Totalagent,
  TotalvarifiedAgent,
  activeSimulation,
  VulnerabilitiesDetected,
  TransactionsExecuted,
  chart: {
    labels: ["2026-03-01", ...],
    Verification: [0,2,1,0,3,0,1],
    Vulnerability: [0,1,0,0,2,0,0]
  },
  activeAgent,
  RecentActivity: [...]
}
```

### What Each Field Means

| Field                   | Meaning                            |
| ----------------------- | ---------------------------------- |
| Totalagent              | Unique agents user interacted with |
| TotalvarifiedAgent      | Total verification events          |
| activeSimulation        | Simulations in last 24h            |
| VulnerabilitiesDetected | Risk score ≥ 0.7                   |
| TransactionsExecuted    | Execution events                   |
| chart                   | 7-day time series                  |
| activeAgent             | Most recently interacted agent     |
| RecentActivity          | Last 20 user events                |



# 🤖 Agent API

## POST `/agents/register`

Registers a new AI agent.

### Body

```json
{
  "agent_name": "My AI",
  "public_key": "abc123",
  "model_name": "GPT-X",
  "version": "1.0",
  "execution_environment": "docker"
}
```

Creates:

* Agent
* Metadata
* Reputation record


## POST `/agents/:id/verify`

Verifies agent.

Logs behavior event:

```
event_type: "verification"
```



## GET `/agents/:id`

Returns full agent profile including:

* metadata
* reputation


# 🧪 Simulation

## POST `/simulation/:id`

Simulates agent execution in sandbox.


# 🔗 Execution (CRE Integration)

## POST `/execute/:id`

Flow:

1. Agent must be verified
2. Simulate agent
3. Send to CRE if deployed
4. Return simulation + execution result

If CRE not deployed:

* Fallback execution is returned


# ⛓ Blockchain Fields (Agent Model)

Agents include:

* blockchain_agent_id
* blockchain_tx_hash
* blockchain_registered_at
* blockchain_sync_status
* blockchain_sync_error

Partial unique index on blockchain_agent_id (when not null).


# 📦 Database Models

* Agent
* AgentMetadata
* AgentReputation
* AgentBehaviorLog
* UserAgentEvent
* UserProfile (optional mirror)

All managed via Sequelize.


# 🛡 Row Level Security (Supabase)

RLS is enabled in Supabase for:

* user_profiles
* user_agent_events

Backend uses service role → bypasses RLS.
Frontend (if reading directly) respects RLS.


# 🐳 Sandbox

Docker container:

```
agentity-sandbox
```

Used for simulation layer.


# 🔄 CRE Integration

Chainlink CRE workflow created.

Currently:

* Simulation works locally
* Deployment requires early access approval

Future:

* Replace fallback execution with webhook-based execution.



# 🧪 How To Test Supabase Integration

### 1️⃣ Health Check

```
GET /health
```

### 2️⃣ Register User

```
POST /auth/register
```

### 3️⃣ Use JWT

```
GET /dashboard/overview
Authorization: Bearer <jwt>
```

### 4️⃣ Verify DB writes

Check Supabase Table Editor.


# 👨‍💻 Frontend Integration Guide

Frontend should:

1. Call `/auth/login`
2. Store JWT
3. Call `/dashboard/overview`
4. Use:

   * Totalagent for stat card
   * chart.Verification for line chart
   * RecentActivity for activity feed
   * activeAgent for summary card



# 👨‍💻 Blockchain Integration Guide

Blockchain layer expects:

* agent verification triggers
* optional blockchain sync update
* backend updates:

  * blockchain_sync_status
  * blockchain_tx_hash


# 🚀 Deployment

Hosted on Render.

Make sure:

* All ENV variables added in Render dashboard.
* DATABASE_URL uses Supabase pooling URL.


# 📈 What Has Been Completed

✅ Identity registry
✅ Metadata storage
✅ Logging pipeline
✅ Simulation sandbox
✅ Blockchain metadata integration
✅ Supabase authentication
✅ JWT verification middleware
✅ Dashboard analytics layer
✅ CRE simulation integration


# 🔮 Next Phase

* CRE deployment approval
* On-chain event listeners
* Real-time dashboard updates
* WebSocket streaming logs
* Rate limiting
* Production RLS hardening


# 🧠 Summary

Agentity backend now:

* Uses Supabase Auth securely
* Tracks all user-agent interactions
* Provides structured dashboard API
* Supports blockchain sync
* Integrates with Chainlink CRE
* Is production deployable

