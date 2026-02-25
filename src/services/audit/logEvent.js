const UserAgentEvent = require("../../models/userAgentEvent");

async function logEvent(req, { action, agentId = null, payload = null }) {
  if (!req.user?.id) return;

  await UserAgentEvent.create({
    user_id: req.user.id,
    agent_id: agentId,
    action,
    payload,
    ip: (req.headers["x-forwarded-for"] || "").toString().split(",")[0].trim() || req.ip,
    user_agent: req.headers["user-agent"] || null,
  });
}

module.exports = { logEvent };