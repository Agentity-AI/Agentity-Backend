const express = require("express");
const router = express.Router();
const Agent = require("../models/agent");
const { simulateAgent } = require("../services/sandbox/sandboxService");
const { executeWithCRE } = require("../services/cre/creService");
const { logEvent } = require("../services/audit/logEvent");

router.post("/:id", async (req, res, next) => {
  try {
    const agent = await Agent.findByPk(req.params.id);

    if (!agent || agent.status !== "verified") {
      return res.status(400).json({ message: "Agent must be verified" });
    }

    const simulationResult = await simulateAgent(agent.id);

    const executionResult = await executeWithCRE(agent, simulationResult);

    await logEvent(req, {
      action: "agent_execute",
      agentId: agent.id,
      payload: executionResult,
    });

    res.json({
      simulation: simulationResult,
      execution: executionResult,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
