# Agentity Backend

Agentity is a backend orchestration + trust layer for AI agents interacting with blockchain smart contracts. It provides:
- Agent identity registry + metadata + reputation
- Agent verification lifecycle + behavior logging
- Docker sandbox simulation that returns risk scores
- Execution routing via Chainlink Runtime Environment (CRE) (fallback supported)
- Supabase Auth (users) + Supabase Postgres (single database)
- User ↔ Agent interaction tracking (NOT ownership) via audit events
- Dashboard API for frontend integrations
- Health monitoring + request logging

---

## Live URL
- Backend (Render): https://agentity-backend.onrender.com



## Architecture (High-Level)

Frontend (Supabase Auth)
  └── sends Authorization: Bearer <access_token>
        ↓
Backend (Express + Sequelize)
        ↓
Supabase Postgres (single DB)
  - Agents + Metadata + Reputation + Behavior Logs
  - user_agent_events (audit trail)
        ↓
Docker Simulation Sandbox
        ↓
CRE Webhook (if available) → Smart Contracts
(fallback execution if CRE deploy is not available)


## Key Design Decision: Agents are NOT Owned by Users

A user can:
- register agents
- fetch agents
- verify agents
- simulate agents
- execute agents

Multiple users can interact with the same agent.  
We track user activity using `user_agent_events` (audit trail), not `agents.user_id`.


## Project Structure

```

src/
app.js
server.js
config/
database.js
logger.js
supabase.js
middleware/
auth.js
models/
agent.js
agentMetadata.js
agentReputation.js
agentBehaviourLog.js
userAgentEvent.js
index.js
routes/
agents.js
simulation.js
execution.js
dashboard.js
services/
sandbox/
cre/
audit/
db/
schema.sql
agentity-cre/
agent-execution/
main.ts
workflow.yml

````


## Environment Variables

Create `.env` at the project root:

```bash
NODE_ENV=development
PORT=5000

# Supabase Postgres (Option B)
DATABASE_URL=postgresql://postgres.<project_ref>:<password>@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true

# Supabase Auth
SUPABASE_URL=https://<project_ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>

# CRE (optional - fallback used if missing)
CRE_WEBHOOK_URL=
CRE_API_KEY=
````

Important:

* Do NOT put `sslmode=require` in DATABASE_URL (your setup works without it).
* SSL is handled in `src/config/database.js`.


## Install & Run (Local)

```bash
npm install
npm run dev
```


## Docker Sandbox

Build sandbox:

```bash
npm run sandbox:build
```

Run sandbox locally (manual):

```bash
npm run sandbox:run
```

Note: Docker must be running.


## Database Schema (schema.sql)

We provide a DB schema for teammates (especially blockchain/devops) at:

`db/schema.sql`

Apply to Supabase:

* Supabase Dashboard → SQL Editor → paste `db/schema.sql` → Run

Or via CLI:

```bash
npm run db:schema:apply
```

`schema.sql` includes:

* tables for agents, metadata, reputation, behavior logs
* `user_agent_events` table
* RLS policies on `user_agent_events` so users only see their own audit history


## API Reference (Frontend)

Base URL:

* Local: [http://localhost:5000](http://localhost:5000)
* Prod: [https://agentity-backend.onrender.com](https://agentity-backend.onrender.com)

### Auth Header

Frontend should call APIs with:

```
Authorization: Bearer <supabase_access_token>
```

If no token is provided:

* endpoints still work
* audit logging won’t record a user_id (because user is anonymous)


## Agents

### Register Agent

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

### Get Agent Profile

GET `/agents/:id`

### Verify Agent

POST `/agents/:id/verify`


## Simulation

### Simulate Agent (Docker)

POST `/simulation/:id`

Returns:

* riskScore
* status


## Execution

### Execute Agent (Simulation → CRE)

POST `/execute/:id`

Flow:

1. Agent must be verified
2. Run simulation to generate riskScore
3. If CRE_WEBHOOK_URL exists → send payload to CRE
4. Else → fallback execution response


## Dashboard (Frontend)

### Dashboard Overview

GET `/dashboard/overview`
Requires auth header.

Returns:

* user (id/email)
* summary counts
* recent activity (from user_agent_events)
* last agents interacted with



## Monitoring

### Health Check

GET `/health`

Returns:

* API status
* DB connectivity
* uptime


## CRE (Chainlink Runtime Environment)

CRE is the secure runtime execution layer between backend and smart contracts.

Current status:

* Workflow compiles and simulates locally
* Deployment access may be gated (early access)
* Backend supports fallback execution if CRE deploy is not available

Supabase integration does NOT require changes to CRE workflow.
CRE focuses on execution policy + smart contract calls.


## How to Test Supabase Integration

1. DB connection:

```bash
curl http://localhost:5000/health
```

Expect: `"database": "connected"`

2. Auth verification:

* Login via Supabase Auth in frontend
* Copy `access_token`
* Call:

```bash
curl -H "Authorization: Bearer <TOKEN>" http://localhost:5000/dashboard/overview
```

Expect: user email + activity data.

3. Audit logging:

* With token, call `/agents/register`, `/agents/:id/verify`, `/simulation/:id`
* Check Supabase table: `user_agent_events` should contain rows for your user.


## Blockchain / Smart Contract Teammate Notes

Backend will provide (via CRE payload):

* agentId
* fingerprint
* simulation result (riskScore, status)

Blockchain tasks:

* define smart contract methods that CRE will call
* provide ABI + contract address
* define event emissions for execution logs
* optionally validate fingerprint on-chain

````