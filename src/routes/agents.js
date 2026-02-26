const express = require("express");
const router = express.Router();
const Agent = require("../models/agent");
const AgentMetadata = require("../models/agentMetadata");
const AgentReputation = require("../models/agentReputation");
const AgentBehaviorLog = require("../models/agentBehaviorLog");
const { generateFingerprint } = require("../services/fingerprint");
const blockchainService = require("../services/blockchain");
const { getExplorerUrl } = require("../config/blockchain");
const logger = require("../config/logger");

// ═══════════════════════════════════════════════════════════════════════════
// POST /agents/register
// Register agent in PostgreSQL + Avalanche blockchain
// ═══════════════════════════════════════════════════════════════════════════
const blockchainService = require("../services/blockchain");
const { getExplorerUrl } = require("../config/blockchain");
const logger = require("../config/logger");

// ═══════════════════════════════════════════════════════════════════════════
// POST /agents/register
// Register agent in PostgreSQL + Avalanche blockchain
// ═══════════════════════════════════════════════════════════════════════════

router.post("/register", async (req, res) => {
  try {
    const {
      agent_name,
      public_key,
      model_name,
      version,
      execution_environment,
      capabilities, // NEW: array of what agent can do
      capabilities, // NEW: array of what agent can do
    } = req.body;

    // Validate input
    // Validate input
    if (!agent_name || !public_key) {
      return res.status(400).json({ 
        message: "agent_name and public_key are required" 
      });
      return res.status(400).json({ 
        message: "agent_name and public_key are required" 
      });
    }

    // Check if agent already exists
    // Check if agent already exists
    const existing = await Agent.findOne({ where: { public_key } });
    if (existing) {
      return res.status(400).json({ message: "Agent already exists" });
    }

    const fingerprint = generateFingerprint(public_key);

    // ─────────────────────────────────────────────────────────────────────────
    // Step 1: Create agent in PostgreSQL (fast, immediately queryable)
    // ─────────────────────────────────────────────────────────────────────────
    
    const agent = await Agent.create({
      agent_name,
      public_key,
      fingerprint,
      blockchain_sync_status: "pending", // Will sync to blockchain next
    });
    // ─────────────────────────────────────────────────────────────────────────
    // Step 1: Create agent in PostgreSQL (fast, immediately queryable)
    // ─────────────────────────────────────────────────────────────────────────
    
    const agent = await Agent.create({
      agent_name,
      public_key,
      fingerprint,
      blockchain_sync_status: "pending", // Will sync to blockchain next
    });

    await AgentMetadata.create({
      agent_id: agent.id,
      model_name,
      version: version || "1.0.0",
      version: version || "1.0.0",
      execution_environment,
    });

    await AgentReputation.create({
      agent_id: agent.id,
      score: 0.0,
      risk_level: "low",
    });

    logger.info({
      message: "Agent created in database",
      agentId: agent.id,
      name: agent_name,
    });

    // ─────────────────────────────────────────────────────────────────────────
    // Step 2: Register agent on Avalanche blockchain
    // ─────────────────────────────────────────────────────────────────────────
    
    let blockchainResult;
    
    try {
      blockchainResult = await blockchainService.registerAgent({
        name: agent_name,
        version: version || "1.0.0",
        capabilities: capabilities || [],
      });
      
      // Update database with blockchain info
      await agent.update({
        blockchain_agent_id: blockchainResult.agentId,
        blockchain_tx_hash: blockchainResult.txHash,
        blockchain_registered_at: blockchainResult.timestamp,
        blockchain_sync_status: "synced",
      });
      
      logger.info({
        message: "Agent synced to blockchain successfully",
        agentId: agent.id,
        blockchainAgentId: blockchainResult.agentId,
        txHash: blockchainResult.txHash,
      });
      
    } catch (blockchainError) {
      // Blockchain sync failed, but agent still exists in database
      logger.error({
        message: "Blockchain sync failed, agent saved to DB only",
        agentId: agent.id,
        error: blockchainError.message,
      });
      
      await agent.update({
        blockchain_sync_status: "failed",
        blockchain_sync_error: blockchainError.message,
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Step 3: Return response
    // ─────────────────────────────────────────────────────────────────────────
    
    res.status(201).json({
      success: true,
      agent: {
        id: agent.id,
        agent_name: agent.agent_name,
        public_key: agent.public_key,
        fingerprint: agent.fingerprint,
        status: agent.status,
        blockchain_agent_id: agent.blockchain_agent_id,
        blockchain_tx_hash: agent.blockchain_tx_hash,
        blockchain_sync_status: agent.blockchain_sync_status,
        snowtrace_url: agent.blockchain_tx_hash 
          ? getExplorerUrl(agent.blockchain_tx_hash)
          : null,
      },
    });
    
    logger.info({
      message: "Agent created in database",
      agentId: agent.id,
      name: agent_name,
    });

    // ─────────────────────────────────────────────────────────────────────────
    // Step 2: Register agent on Avalanche blockchain
    // ─────────────────────────────────────────────────────────────────────────
    
    let blockchainResult;
    
    try {
      blockchainResult = await blockchainService.registerAgent({
        name: agent_name,
        version: version || "1.0.0",
        capabilities: capabilities || [],
      });
      
      // Update database with blockchain info
      await agent.update({
        blockchain_agent_id: blockchainResult.agentId,
        blockchain_tx_hash: blockchainResult.txHash,
        blockchain_registered_at: blockchainResult.timestamp,
        blockchain_sync_status: "synced",
      });
      
      logger.info({
        message: "Agent synced to blockchain successfully",
        agentId: agent.id,
        blockchainAgentId: blockchainResult.agentId,
        txHash: blockchainResult.txHash,
      });
      
    } catch (blockchainError) {
      // Blockchain sync failed, but agent still exists in database
      logger.error({
        message: "Blockchain sync failed, agent saved to DB only",
        agentId: agent.id,
        error: blockchainError.message,
      });
      
      await agent.update({
        blockchain_sync_status: "failed",
        blockchain_sync_error: blockchainError.message,
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Step 3: Return response
    // ─────────────────────────────────────────────────────────────────────────
    
    res.status(201).json({
      success: true,
      agent: {
        id: agent.id,
        agent_name: agent.agent_name,
        public_key: agent.public_key,
        fingerprint: agent.fingerprint,
        status: agent.status,
        blockchain_agent_id: agent.blockchain_agent_id,
        blockchain_tx_hash: agent.blockchain_tx_hash,
        blockchain_sync_status: agent.blockchain_sync_status,
        snowtrace_url: agent.blockchain_tx_hash 
          ? getExplorerUrl(agent.blockchain_tx_hash)
          : null,
      },
    });
    
  } catch (error) {
    logger.error({
      message: "Agent registration failed",
      error: error.message,
      stack: error.stack,
    });
    
    res.status(500).json({ message: "Server error" });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// GET /agents/:id
// Get agent profile (includes blockchain data)
// ═══════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════
// GET /agents/:id
// Get agent profile (includes blockchain data)
// ═══════════════════════════════════════════════════════════════════════════

router.get("/:id", async (req, res) => {
  try {
    const agent = await Agent.findByPk(req.params.id, {
      include: [
        { model: AgentMetadata, as: "AgentMetadata" },
        { model: AgentReputation, as: "AgentReputation" },
      ]
        { model: AgentMetadata, as: "AgentMetadata" },
        { model: AgentReputation, as: "AgentReputation" },
      ]
    });

    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    res.json({
      success: true,
      agent: {
        ...agent.toJSON(),
        snowtrace_url: agent.blockchain_tx_hash 
          ? getExplorerUrl(agent.blockchain_tx_hash)
          : null,
      },
    });
    
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    res.json({
      success: true,
      agent: {
        ...agent.toJSON(),
        snowtrace_url: agent.blockchain_tx_hash 
          ? getExplorerUrl(agent.blockchain_tx_hash)
          : null,
      },
    });
    
  } catch (error) {
    logger.error({
      message: "Failed to fetch agent",
      error: error.message,
    });
    
    logger.error({
      message: "Failed to fetch agent",
      error: error.message,
    });
    
    res.status(500).json({ message: "Server error" });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// POST /agents/:id/verify
// Verify agent (existing functionality)
// ═══════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════
// POST /agents/:id/verify
// Verify agent (existing functionality)
// ═══════════════════════════════════════════════════════════════════════════

router.post("/:id/verify", async (req, res) => {
  try {
    const agent = await Agent.findByPk(req.params.id);

    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    agent.status = "verified";
    await agent.save();

    await AgentBehaviorLog.create({
      agent_id: agent.id,
      event_type: "verification",
      event_payload: { verified_at: new Date() },
      risk_score: 0.0
    });

    res.json({ 
      success: true,
      message: "Agent verified", 
      agent 
    });
    
  } catch (error) {
    logger.error({
      message: "Agent verification failed",
      error: error.message,
    });
    
    res.status(500).json({ message: "Server error" });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// POST /agents/:id/actions
// Log an action (DB + blockchain)
// ═══════════════════════════════════════════════════════════════════════════

router.post("/:id/actions", async (req, res) => {
  try {
    const agent = await Agent.findByPk(req.params.id);
    
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }
    
    const { action_type, action_data, result, risk_score } = req.body;
    
    if (!action_type) {
      return res.status(400).json({ message: "action_type is required" });
    }
    
    // ─────────────────────────────────────────────────────────────────────────
    // Step 1: Save to database
    // ─────────────────────────────────────────────────────────────────────────
    
    const behaviorLog = await AgentBehaviorLog.create({
      agent_id: agent.id,
      event_type: action_type,
      event_payload: action_data || {},
      risk_score: risk_score || 0.0,
    });
    
    logger.info({
      message: "Action logged in database",
      agentId: agent.id,
      actionType: action_type,
    });
    
    // ─────────────────────────────────────────────────────────────────────────
    // Step 2: Log to blockchain (if agent is synced)
    // ─────────────────────────────────────────────────────────────────────────
    
    if (agent.blockchain_agent_id && agent.blockchain_sync_status === "synced") {
      try {
        const blockchainResult = await blockchainService.logAction({
          agentId: agent.blockchain_agent_id,
          actionType: action_type,
          actionData: action_data || {},
          result: result || "success",
        });
        
        await behaviorLog.update({
          blockchain_tx_hash: blockchainResult.txHash,
          blockchain_action_id: blockchainResult.actionId,
          blockchain_logged_at: blockchainResult.timestamp,
        });
        
        logger.info({
          message: "Action logged on blockchain",
          actionId: blockchainResult.actionId,
          txHash: blockchainResult.txHash,
        });
        
      } catch (blockchainError) {
        logger.error({
          message: "Blockchain action logging failed",
          error: blockchainError.message,
        });
        
        // Continue even if blockchain fails (data is in DB)
      }
    }
    
    res.status(201).json({
      success: true,
      action: {
        id: behaviorLog.id,
        event_type: behaviorLog.event_type,
        blockchain_tx_hash: behaviorLog.blockchain_tx_hash,
        blockchain_action_id: behaviorLog.blockchain_action_id,
        snowtrace_url: behaviorLog.blockchain_tx_hash
          ? getExplorerUrl(behaviorLog.blockchain_tx_hash)
          : null,
      },
    });
    
  } catch (error) {
    logger.error({
      message: "Action logging failed",
      error: error.message,
    });
    
    res.status(500).json({ message: "Server error" });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// GET /agents/:id/blockchain-audit
// Fetch on-chain audit trail from Avalanche
// ═══════════════════════════════════════════════════════════════════════════

router.get("/:id/blockchain-audit", async (req, res) => {
  try {
    const agent = await Agent.findByPk(req.params.id);
    
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }
    
    if (!agent.blockchain_agent_id) {
      return res.status(404).json({ 
        message: "Agent not synced to blockchain" 
      });
    }
    
    // Fetch data from Avalanche smart contract
    const onChainAgent = await blockchainService.getAgent(agent.blockchain_agent_id);
    const onChainActions = await blockchainService.getActions(agent.blockchain_agent_id);
    
    res.json({
      success: true,
      blockchain_agent_id: agent.blockchain_agent_id,
      registration_tx: agent.blockchain_tx_hash,
      snowtrace_url: getExplorerUrl(agent.blockchain_tx_hash),
      on_chain_data: {
        name: onChainAgent.name,
        version: onChainAgent.version,
        creator: onChainAgent.creator,
        capabilities: onChainAgent.capabilities,
        action_count: onChainAgent.actionCount,
        registered_at: onChainAgent.registeredAt,
        active: onChainAgent.active,
      },
      actions: onChainActions.map(a => ({
        ...a,
        snowtrace_url: getExplorerUrl(a.txHash),
      })),
    });
    
  } catch (error) {
    logger.error({
      message: "Blockchain audit fetch failed",
      error: error.message,
    });
    
    res.status(500).json({ message: "Server error" });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// GET /agents/stats
// Dashboard statistics (including blockchain metrics)
// ═══════════════════════════════════════════════════════════════════════════

router.get("/", async (req, res) => {
  try {
    const totalAgents = await Agent.count();
    const verifiedAgents = await Agent.count({ where: { status: "verified" } });
    const syncedAgents = await Agent.count({ 
      where: { blockchain_sync_status: "synced" } 
    });
    const failedSyncs = await Agent.count({ 
      where: { blockchain_sync_status: "failed" } 
    });
    
    res.json({
      success: true,
      stats: {
        total_agents: totalAgents,
        verified_agents: verifiedAgents,
        blockchain_synced: syncedAgents,
        blockchain_sync_failed: failedSyncs,
        sync_percentage: totalAgents > 0 
          ? ((syncedAgents / totalAgents) * 100).toFixed(1)
          : 0,
      },
    });
    
      risk_score: 0.0
    });

    res.json({ 
      success: true,
      message: "Agent verified", 
      agent 
    });
    
  } catch (error) {
    logger.error({
      message: "Agent verification failed",
      error: error.message,
    });
    
    res.status(500).json({ message: "Server error" });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// POST /agents/:id/actions
// Log an action (DB + blockchain)
// ═══════════════════════════════════════════════════════════════════════════

router.post("/:id/actions", async (req, res) => {
  try {
    const agent = await Agent.findByPk(req.params.id);
    
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }
    
    const { action_type, action_data, result, risk_score } = req.body;
    
    if (!action_type) {
      return res.status(400).json({ message: "action_type is required" });
    }
    
    // ─────────────────────────────────────────────────────────────────────────
    // Step 1: Save to database
    // ─────────────────────────────────────────────────────────────────────────
    
    const behaviorLog = await AgentBehaviorLog.create({
      agent_id: agent.id,
      event_type: action_type,
      event_payload: action_data || {},
      risk_score: risk_score || 0.0,
    });
    
    logger.info({
      message: "Action logged in database",
      agentId: agent.id,
      actionType: action_type,
    });
    
    // ─────────────────────────────────────────────────────────────────────────
    // Step 2: Log to blockchain (if agent is synced)
    // ─────────────────────────────────────────────────────────────────────────
    
    if (agent.blockchain_agent_id && agent.blockchain_sync_status === "synced") {
      try {
        const blockchainResult = await blockchainService.logAction({
          agentId: agent.blockchain_agent_id,
          actionType: action_type,
          actionData: action_data || {},
          result: result || "success",
        });
        
        await behaviorLog.update({
          blockchain_tx_hash: blockchainResult.txHash,
          blockchain_action_id: blockchainResult.actionId,
          blockchain_logged_at: blockchainResult.timestamp,
        });
        
        logger.info({
          message: "Action logged on blockchain",
          actionId: blockchainResult.actionId,
          txHash: blockchainResult.txHash,
        });
        
      } catch (blockchainError) {
        logger.error({
          message: "Blockchain action logging failed",
          error: blockchainError.message,
        });
        
        // Continue even if blockchain fails (data is in DB)
      }
    }
    
    res.status(201).json({
      success: true,
      action: {
        id: behaviorLog.id,
        event_type: behaviorLog.event_type,
        blockchain_tx_hash: behaviorLog.blockchain_tx_hash,
        blockchain_action_id: behaviorLog.blockchain_action_id,
        snowtrace_url: behaviorLog.blockchain_tx_hash
          ? getExplorerUrl(behaviorLog.blockchain_tx_hash)
          : null,
      },
    });
    
  } catch (error) {
    logger.error({
      message: "Action logging failed",
      error: error.message,
    });
    
    res.status(500).json({ message: "Server error" });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// GET /agents/:id/blockchain-audit
// Fetch on-chain audit trail from Avalanche
// ═══════════════════════════════════════════════════════════════════════════

router.get("/:id/blockchain-audit", async (req, res) => {
  try {
    const agent = await Agent.findByPk(req.params.id);
    
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }
    
    if (!agent.blockchain_agent_id) {
      return res.status(404).json({ 
        message: "Agent not synced to blockchain" 
      });
    }
    
    // Fetch data from Avalanche smart contract
    const onChainAgent = await blockchainService.getAgent(agent.blockchain_agent_id);
    const onChainActions = await blockchainService.getActions(agent.blockchain_agent_id);
    
    res.json({
      success: true,
      blockchain_agent_id: agent.blockchain_agent_id,
      registration_tx: agent.blockchain_tx_hash,
      snowtrace_url: getExplorerUrl(agent.blockchain_tx_hash),
      on_chain_data: {
        name: onChainAgent.name,
        version: onChainAgent.version,
        creator: onChainAgent.creator,
        capabilities: onChainAgent.capabilities,
        action_count: onChainAgent.actionCount,
        registered_at: onChainAgent.registeredAt,
        active: onChainAgent.active,
      },
      actions: onChainActions.map(a => ({
        ...a,
        snowtrace_url: getExplorerUrl(a.txHash),
      })),
    });
    
  } catch (error) {
    logger.error({
      message: "Blockchain audit fetch failed",
      error: error.message,
    });
    
    res.status(500).json({ message: "Server error" });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// GET /agents/stats
// Dashboard statistics (including blockchain metrics)
// ═══════════════════════════════════════════════════════════════════════════

router.get("/", async (req, res) => {
  try {
    const totalAgents = await Agent.count();
    const verifiedAgents = await Agent.count({ where: { status: "verified" } });
    const syncedAgents = await Agent.count({ 
      where: { blockchain_sync_status: "synced" } 
    });
    const failedSyncs = await Agent.count({ 
      where: { blockchain_sync_status: "failed" } 
    });
    
    res.json({
      success: true,
      stats: {
        total_agents: totalAgents,
        verified_agents: verifiedAgents,
        blockchain_synced: syncedAgents,
        blockchain_sync_failed: failedSyncs,
        sync_percentage: totalAgents > 0 
          ? ((syncedAgents / totalAgents) * 100).toFixed(1)
          : 0,
      },
    });
    
  } catch (error) {
    logger.error({
      message: "Stats fetch failed",
      error: error.message,
    });
    
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;