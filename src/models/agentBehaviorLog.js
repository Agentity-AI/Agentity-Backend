const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Agent = require("./agent");

const AgentBehaviorLog = sequelize.define("AgentBehaviorLog", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  event_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  event_payload: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  risk_score: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0,
  },
}, {
  timestamps: true,
});

Agent.hasMany(AgentBehaviorLog, { foreignKey: "agent_id" });
AgentBehaviorLog.belongsTo(Agent, { foreignKey: "agent_id" });

module.exports = AgentBehaviorLog;
