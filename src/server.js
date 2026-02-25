const app = require("./app");
const sequelize = require("./config/database");
const logger = require("./config/logger");

// Register model associations BEFORE syncing
require("./models");

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await sequelize.authenticate();
    logger.info("Database connected successfully.");

    await sequelize.sync();
    logger.info("Database synced.");

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to start server", error);
    process.exit(1);
  }
}

startServer();
