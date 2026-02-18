const express = require("express");
const router = express.Router();
const Agent = require("../models/agent");
const AgentMetadata = require("../models/agentMetadata");
const AgentReputation = require("../models/agentReputation");
const { generateFingerprint } = require("../services/fingerprint");

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

module.exports = router;
