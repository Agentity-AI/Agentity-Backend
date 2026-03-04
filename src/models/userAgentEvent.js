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

    // DB column exists
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "user_agent_events",
    timestamps: false, // IMPORTANT: prevents Sequelize from querying createdAt/updatedAt
    indexes: [
      { fields: ["user_id"] },
      { fields: ["agent_id"] },
      { fields: ["action"] },
      { fields: ["created_at"] },
    ],
  }
);

module.exports = UserAgentEvent;