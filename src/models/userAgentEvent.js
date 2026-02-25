const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const UserAgentEvent = sequelize.define(
  "UserAgentEvent",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: { type: DataTypes.UUID, allowNull: false },
    agent_id: { type: DataTypes.UUID, allowNull: true },
    action: { type: DataTypes.STRING, allowNull: false },
    payload: { type: DataTypes.JSONB, allowNull: true },
    ip: { type: DataTypes.STRING, allowNull: true },
    user_agent: { type: DataTypes.STRING, allowNull: true },
  },
  {
    tableName: "user_agent_events",
    timestamps: true,
    indexes: [
      { fields: ["user_id"] },
      { fields: ["agent_id"] },
      { fields: ["action"] },
    ],
  },
);

module.exports = UserAgentEvent;
