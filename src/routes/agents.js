const express = require("express");
const router = express.Router();

const Agent = require("../models/agent");
const AgentMetadata = require("../models/agentMetadata");
const AgentReputation = require("../models/agentReputation");
const AgentBehaviorLog = require("../models/agentBehaviorLog");

const { generateFingerprint } = require("../services/fingerprint");
const { logEvent } = require("../services/audit/logEvent");

router.post("/register", async (req, res) => {
  try {
    const {
      agent_name,
      public_key,
      model_name,
      version,
      execution_environment,
    } = req.body;

    if (!agent_name || !public_key) {
      return res
        .status(400)
        .json({ message: "agent_name and public_key are required" });
    }

    const existing = await Agent.findOne({ where: { public_key } });
    if (existing) {
      return res.status(400).json({ message: "Agent already exists" });
    }

    const fingerprint = generateFingerprint(public_key);

    const agent = await Agent.create({ agent_name, public_key, fingerprint });

    await AgentMetadata.create({
      agent_id: agent.id,
      model_name,
      version,
      execution_environment,
    });

    await AgentReputation.create({
      agent_id: agent.id,
      score: 0.0,
      risk_level: "low",
    });

    await logEvent(req, { action: "agent_register", agentId: agent.id });

    res.status(201).json(agent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get Agent Profile
router.get("/:id", async (req, res) => {
  try {
    // Prefer explicit model includes (more reliable than string includes)
    const agent = await Agent.findByPk(req.params.id, {
      include: [
        { model: AgentMetadata, as: "metadata" },
        { model: AgentReputation, as: "reputation" },
      ],
    });

    if (!agent) return res.status(404).json({ message: "Agent not found" });

    await logEvent(req, { action: "agent_fetch", agentId: agent.id });

    res.json(agent);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Verify Agent
router.post("/:id/verify", async (req, res) => {
  try {
    const agent = await Agent.findByPk(req.params.id);

    if (!agent) return res.status(404).json({ message: "Agent not found" });

    agent.status = "verified";
    await agent.save();

    await AgentBehaviorLog.create({
      agent_id: agent.id,
      event_type: "verification",
      event_payload: { verified_at: new Date() },
      risk_score: 0.0,
    });

    await logEvent(req, { action: "agent_verify", agentId: agent.id });

    res.json({ message: "Agent verified", agent });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;