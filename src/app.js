require("dotenv").config();

const express = require("express");
const cors = require("cors");

const logger = require("./config/logger");
const sequelize = require("./config/database");

const agentRoutes = require("./routes/agents");
const simulationRoutes = require("./routes/simulation");
const executionRoutes = require("./routes/execution");

const app = express();

// Global Middleware

// CORS
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Body parser
app.use(express.json());

// Request logging with duration tracking
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


 // Routes
 

app.use("/agents", agentRoutes);
app.use("/simulation", simulationRoutes);
app.use("/execute", executionRoutes);


//Health Check

app.get("/health", async (req, res) => {
  try {
    await sequelize.authenticate();

    res.status(200).json({
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


// 404 Handler

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

/**
 * =============================
 * Global Error Handler
 * =============================
 */

app.use((err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
  });

  res.status(500).json({ message: "Internal Server Error" });
});

module.exports = app;
