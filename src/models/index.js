const Agent = require("./agent");
const AgentMetadata = require("./agentMetadata");
const AgentReputation = require("./agentReputation");

Agent.hasOne(AgentMetadata, { foreignKey: "agent_id", as: "metadata" });
AgentMetadata.belongsTo(Agent, { foreignKey: "agent_id" });

Agent.hasOne(AgentReputation, { foreignKey: "agent_id", as: "reputation" });
AgentReputation.belongsTo(Agent, { foreignKey: "agent_id" });

module.exports = {
  Agent,
  AgentMetadata,
  AgentReputation,
};