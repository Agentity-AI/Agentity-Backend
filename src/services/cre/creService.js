const axios = require("axios");
const logger = require("../../config/logger");

async function executeWithCRE(agent, simulationResult) {
  const payload = {
    agentId: agent.id,
    fingerprint: agent.fingerprint,
    simulation: simulationResult,
  };

  try {
    if (!process.env.CRE_WEBHOOK_URL) {
      logger.warn("CRE not deployed. Using fallback execution.");

      return {
        status: "executed",
        fallback: true,
        ...payload,
        executedAt: new Date().toISOString(),
      };
    }

    const response = await axios.post(process.env.CRE_WEBHOOK_URL, payload, {
      headers: {
        Authorization: `Bearer ${process.env.CRE_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    logger.error("CRE execution failed", error.message);
    throw error;
  }
}

module.exports = { executeWithCRE };
