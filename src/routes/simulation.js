const express = require("express");
const router = express.Router();
const { simulateAgent } = require("../services/sandbox/sandboxService");

router.post("/:id", async (req, res, next) => {
  try {
    const result = await simulateAgent(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;