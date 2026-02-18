const express = require("express");
const router = express.Router();
const Agent = require("../models/agent");
const AgentMetadata = require("../models/agentMetadata");
const AgentReputation = require("../models/agentReputation");
const { generateFingerprint } = require("../services/fingerprint");
const AgentBehaviorLog = require("../models/agentBehaviorLog");


router.post("/register", async (req, res) => {
  try {
    const {
      agent_name,
      public_key,
      model_name,
      version,
      execution_environment,
    } = req.body;

    const existing = await Agent.findOne({ where: { public_key } });
    if (existing) {
      return res.status(400).json({ message: "Agent already exists" });
    }

    const fingerprint = generateFingerprint(public_key);

    const agent = await Agent.create({
      agent_name,
      public_key,
      fingerprint,
    });

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

    res.status(201).json(agent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get Agent Profile
router.get("/:id", async (req, res) => {
  try {
    const agent = await Agent.findByPk(req.params.id, {
      include: ["AgentMetadata", "AgentReputation"]
    });

    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    res.json(agent);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Verify Agent

router.post("/:id/verify", async (req, res) => {
  try {
    const agent = await Agent.findByPk(req.params.id);

    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    agent.status = "verified";
    await agent.save();

    await AgentBehaviorLog.create({
      agent_id: agent.id,
      event_type: "verification",
      event_payload: { verified_at: new Date() },
      risk_score: 0.0
    });

    res.json({ message: "Agent verified", agent });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});



module.exports = router;
