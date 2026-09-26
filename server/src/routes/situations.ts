import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { dbService } from '../db/database.js';
import { aiEngine } from '../services/aiEngine.js';
import { idempotencyService } from '../services/idempotency.js';
import { deltaEngine } from '../services/deltaEngine.js';
import { Situation, SituationVersion } from '../types.js';

export const situationRouter = Router();

/**
 * POST /api/situations
 * Receives raw situation input, generates structured AI reasoning (idempotent, schema-validated)
 */
situationRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { rawInput, userId = 'user_demo_1' } = req.body;
    const reqIdempotencyKey = req.header('X-Idempotency-Key');
    const chaos429 = req.header('X-Chaos') === '429';
    const chaosMalformed = req.header('X-Chaos') === 'malformed';

    if (!rawInput || typeof rawInput !== 'string' || rawInput.trim().length === 0) {
      res.status(400).json({ error: "rawInput string is required." });
      return;
    }

    // 1. Check Idempotency (Blocker 1)
    const idempotencyKey = idempotencyService.getOrGenerateKey(reqIdempotencyKey, userId, rawInput);
    const idCheck = idempotencyService.checkIdempotency(idempotencyKey, rawInput);

    if (idCheck.isDuplicate) {
      res.setHeader('X-Cache-Hit', 'true');
      res.setHeader('X-Idempotency-Key', idempotencyKey);
      res.status(200).json({
        ...idCheck.cachedResult,
        _meta: { idempotencyHit: true, message: "Returned cached response for duplicate request within sliding window." }
      });
      return;
    }

    // 2. Run AI Reasoning Engine
    const { response, wasRepaired, isDegraded, logs } = await aiEngine.analyzeSituation(rawInput, undefined, {
      forceChaos429: chaos429,
      forceChaosMalformed: chaosMalformed
    });

    const situationId = `sit_${uuidv4().substring(0, 8)}`;
    const now = new Date().toISOString();

    const situation: Situation = {
      id: situationId,
      userId,
      createdAt: now,
      updatedAt: now,
      currentVersionNumber: 1,
      latestResponse: response
    };

    const versionRecord: SituationVersion = {
      id: `ver_${uuidv4().substring(0, 8)}`,
      situationId,
      version: 1,
      rawInput,
      timestamp: now,
      structuredResponse: response,
      deltaSummary: null,
      isDegraded,
      idempotencyKey
    };

    // 3. Persist to DB & Audit Logs
    dbService.saveSituation(situation);
    dbService.saveVersion(versionRecord);
    dbService.addAuditLog(userId, 'CREATE_SITUATION', situationId, { isDegraded, wasRepaired });
    dbService.addPromptLog(userId, rawInput, JSON.stringify(response), situationId);

    const responsePayload = {
      situation,
      version: versionRecord,
      _meta: {
        wasRepaired,
        isDegraded,
        processingLogs: logs,
        idempotencyKey
      }
    };

    // Save for Idempotency
    idempotencyService.saveIdempotency(idempotencyKey, rawInput, responsePayload);

    res.setHeader('X-Idempotency-Key', idempotencyKey);
    res.status(201).json(responsePayload);
  } catch (err) {
    console.error("Error creating situation:", err);
    res.status(500).json({ error: "Internal server error processing situation.", details: (err as Error).message });
  }
});

/**
 * POST /api/situations/:id/reassess
 * Updates an existing situation, creating Version N + 1 with natural language delta tracking
 */
situationRouter.post('/:id/reassess', async (req: Request, res: Response): Promise<void> => {
  try {
    const situationId = req.params.id;
    const { rawInput, userId = 'user_demo_1' } = req.body;
    const reqIdempotencyKey = req.header('X-Idempotency-Key');

    const situation = dbService.getSituation(situationId);
    if (!situation) {
      res.status(404).json({ error: `Situation ${situationId} not found.` });
      return;
    }

    const previousVersion = dbService.getLatestVersion(situationId);
    if (!previousVersion) {
      res.status(500).json({ error: "Situation history corrupted: missing previous version." });
      return;
    }

    // Run AI analysis with history context (Blocker 6 context summarization)
    const historySummary = `Previous Version ${previousVersion.version} Summary: ${previousVersion.structuredResponse.summary}. Identified: ${previousVersion.structuredResponse.identifiedIssues.join(', ')}`;
    
    const { response, wasRepaired, isDegraded, logs } = await aiEngine.analyzeSituation(rawInput, historySummary);

    const nextVersionNum = situation.currentVersionNumber + 1;
    const now = new Date().toISOString();

    // Create current version record temporarily to compute delta
    const nextVersionRecord: SituationVersion = {
      id: `ver_${uuidv4().substring(0, 8)}`,
      situationId,
      version: nextVersionNum,
      rawInput,
      timestamp: now,
      structuredResponse: response,
      isDegraded
    };

    // Compute Delta (Blocker 4 & 5)
    const delta = deltaEngine.computeDelta(previousVersion, nextVersionRecord);
    nextVersionRecord.deltaSummary = delta;

    // Update Situation master record
    situation.currentVersionNumber = nextVersionNum;
    situation.latestResponse = response;
    situation.updatedAt = now;

    dbService.saveSituation(situation);
    dbService.saveVersion(nextVersionRecord);
    dbService.addAuditLog(userId, 'REASSESS_SITUATION', situationId, { version: nextVersionNum, delta: delta.summaryDelta });
    dbService.addPromptLog(userId, rawInput, JSON.stringify(response), situationId);

    res.status(200).json({
      situation,
      version: nextVersionRecord,
      deltaSummary: delta,
      _meta: { wasRepaired, isDegraded, processingLogs: logs }
    });
  } catch (err) {
    console.error("Error reassessing situation:", err);
    res.status(500).json({ error: "Internal server error during reassessment.", details: (err as Error).message });
  }
});

/**
 * GET /api/situations/:id
 * Fetches single situation
 */
situationRouter.get('/:id', (req: Request, res: Response) => {
  const situation = dbService.getSituation(req.params.id);
  if (!situation) {
    res.status(404).json({ error: "Situation not found." });
    return;
  }
  const history = dbService.getVersionsForSituation(req.params.id);
  res.status(200).json({ situation, history });
});

/**
 * GET /api/situations/:id/history
 * Fetches complete version timeline & deltas
 */
situationRouter.get('/:id/history', (req: Request, res: Response) => {
  const history = dbService.getVersionsForSituation(req.params.id);
  res.status(200).json({ history });
});
