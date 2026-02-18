const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Agent = sequelize.define("Agent", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  agent_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  public_key: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  fingerprint: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("pending", "verified", "suspended"),
    defaultValue: "pending",
  },
}, {
  timestamps: true,
});

module.exports = Agent;
