import {
  CronCapability,
  handler,
  Runner,
  type Runtime,
} from "@chainlink/cre-sdk";

type Config = {
  schedule: string;
};

type InputPayload = {
  agentId: string;
  fingerprint: string;
  riskScore: number;
};

const onCronTrigger = async (
  runtime: Runtime<Config>
) => {
  // For simulation only
  const input: InputPayload = {
    agentId: "simulated-agent",
    fingerprint: "simulated-fingerprint",
    riskScore: 0.4,
  };

  runtime.log("Simulated execution triggered", input);

  if (input.riskScore >= 0.7) {
    return {
      status: "denied",
      reason: "Risk score too high",
      agentId: input.agentId,
    };
  }

  return {
    status: "executed",
    agentId: input.agentId,
    executedAt: new Date().toISOString(),
  };
};

const initWorkflow = (config: Config) => {
  const cron = new CronCapability();

  return [
    handler(
      cron.trigger({
        schedule: config.schedule,
      }),
      onCronTrigger
    ),
  ];
};

export async function main() {
  const runner = await Runner.newRunner<Config>();
  await runner.run(initWorkflow);
}