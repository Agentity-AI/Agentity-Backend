const express = require("express");
const sequelize = require("./config/database");
const logger = require("./middleware/logger");
require("dotenv").config();

const agentRoutes = require("./routes/agents");

const app = express();

app.use(express.json());
app.use(logger);

app.use("/agents", agentRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "healthy" });
});

sequelize.sync();

module.exports = app;
