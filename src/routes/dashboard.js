const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const UserAgentEvent = require("../models/userAgentEvent");
const Agent = require("../models/agent");
const { Op, fn, col } = require("sequelize");

router.get("/overview", requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Recent activity
    const recent = await UserAgentEvent.findAll({
      where: { user_id: userId },
      order: [["createdAt", "DESC"]],
      limit: 15,
    });

    // Count summary
    const totalActions = await UserAgentEvent.count({
      where: { user_id: userId },
    });

    const totalSimulations = await UserAgentEvent.count({
      where: { user_id: userId, action: "agent_simulate" },
    });

    const totalExecutions = await UserAgentEvent.count({
      where: { user_id: userId, action: "agent_execute" },
    });

    const totalVerifications = await UserAgentEvent.count({
      where: { user_id: userId, action: "agent_verify" },
    });

    // Last unique agents touched
    const lastAgentsIds = await UserAgentEvent.findAll({
      where: { user_id: userId, agent_id: { [Op.ne]: null } },
      attributes: [[fn("DISTINCT", col("agent_id")), "agent_id"]],
      limit: 5,
    });

    const agentIds = lastAgentsIds.map((a) => a.agent_id);

    const lastAgents = await Agent.findAll({
      where: { id: agentIds },
      attributes: ["id", "agent_name", "status"],
    });

    res.json({
      user: {
        id: userId,
        email: req.user.email,
      },
      summary: {
        totalActions,
        totalSimulations,
        totalExecutions,
        totalVerifications,
      },
      recentActivity: recent,
      lastAgents,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
