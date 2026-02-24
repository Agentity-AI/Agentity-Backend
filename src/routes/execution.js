const express = require("express");
const router = express.Router();
const Agent = require("../models/agent");
const { simulateAgent } = require("../services/sandbox/sandboxService");
const { executeWithCRE } = require("../services/cre/creService");

router.post("/:id", async (req, res, next) => {
  try {
    const agent = await Agent.findByPk(req.params.id);

    if (!agent || agent.status !== "verified") {
      throw new Error("Agent must be verified");
    }

    const simulationResult = await simulateAgent(agent.id);

    const executionResult = await executeWithCRE(
      agent,
      simulationResult
    );

    res.json({
      simulation: simulationResult,
      execution: executionResult,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;