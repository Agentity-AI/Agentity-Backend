const express = require("express");
const router = express.Router();

const { simulateAgent } = require("../services/sandbox/sandboxService");
const { logEvent } = require("../services/audit/logEvent");

router.post("/:id", async (req, res, next) => {
  try {
    const result = await simulateAgent(req.params.id);

    await logEvent(req, {
      action: "agent_simulate",
      agentId: req.params.id,
      payload: result,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
