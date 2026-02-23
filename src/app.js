const express = require("express");
require("dotenv").config();

const logger = require("./config/logger");
const sequelize = require("./config/database");
const agentRoutes = require("./routes/agents");
const simulationRoutes = require("./routes/simulation");

const app = express();

app.use(express.json());

// Request logging middleware with duration tracking
app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });
  });

  next();
});

app.use("/agents", agentRoutes);
app.use("/simulation", simulationRoutes);

// Monitoring endpoint
app.get("/health", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({
      status: "healthy",
      database: "connected",
      uptime: process.uptime(),
    });
  } catch (error) {
    logger.error({
      message: "Database health check failed",
      error: error.message,
    });

    res.status(500).json({
      status: "error",
      database: "disconnected",
    });
  }
});

// Centralized error handler
app.use((err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
  });

  res.status(500).json({ message: "Internal Server Error" });
});

module.exports = app;
