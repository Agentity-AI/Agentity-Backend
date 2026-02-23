const { exec } = require("child_process");

function runSandbox(agentId) {
  return new Promise((resolve, reject) => {
    exec(
      `docker run --rm agentity-sandbox ${agentId}`,
      { timeout: 10000 }, // prevent runaway container
      (error, stdout, stderr) => {
        if (error) {
          return reject(error);
        }

        try {
          const result = JSON.parse(stdout.trim());
          resolve(result);
        } catch (err) {
          reject(new Error("Invalid sandbox output"));
        }
      }
    );
  });
}

module.exports = { runSandbox };