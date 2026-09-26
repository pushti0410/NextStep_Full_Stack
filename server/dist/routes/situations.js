"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.situationRouter = void 0;
const express_1 = require("express");
const uuid_1 = require("uuid");
const database_js_1 = require("../db/database.js");
const aiEngine_js_1 = require("../services/aiEngine.js");
const idempotency_js_1 = require("../services/idempotency.js");
const deltaEngine_js_1 = require("../services/deltaEngine.js");
exports.situationRouter = (0, express_1.Router)();
/**
 * POST /api/situations
 * Receives raw situation input, generates structured AI reasoning (idempotent, schema-validated)
 */
exports.situationRouter.post('/', async (req, res) => {
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
        const idempotencyKey = idempotency_js_1.idempotencyService.getOrGenerateKey(reqIdempotencyKey, userId, rawInput);
        const idCheck = idempotency_js_1.idempotencyService.checkIdempotency(idempotencyKey, rawInput);
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
        const { response, wasRepaired, isDegraded, logs } = await aiEngine_js_1.aiEngine.analyzeSituation(rawInput, undefined, {
            forceChaos429: chaos429,
            forceChaosMalformed: chaosMalformed
        });
        const situationId = `sit_${(0, uuid_1.v4)().substring(0, 8)}`;
        const now = new Date().toISOString();
        const situation = {
            id: situationId,
            userId,
            createdAt: now,
            updatedAt: now,
            currentVersionNumber: 1,
            latestResponse: response
        };
        const versionRecord = {
            id: `ver_${(0, uuid_1.v4)().substring(0, 8)}`,
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
        database_js_1.dbService.saveSituation(situation);
        database_js_1.dbService.saveVersion(versionRecord);
        database_js_1.dbService.addAuditLog(userId, 'CREATE_SITUATION', situationId, { isDegraded, wasRepaired });
        database_js_1.dbService.addPromptLog(userId, rawInput, JSON.stringify(response), situationId);
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
        idempotency_js_1.idempotencyService.saveIdempotency(idempotencyKey, rawInput, responsePayload);
        res.setHeader('X-Idempotency-Key', idempotencyKey);
        res.status(201).json(responsePayload);
    }
    catch (err) {
        console.error("Error creating situation:", err);
        res.status(500).json({ error: "Internal server error processing situation.", details: err.message });
    }
});
/**
 * POST /api/situations/:id/reassess
 * Updates an existing situation, creating Version N + 1 with natural language delta tracking
 */
exports.situationRouter.post('/:id/reassess', async (req, res) => {
    try {
        const situationId = req.params.id;
        const { rawInput, userId = 'user_demo_1' } = req.body;
        const reqIdempotencyKey = req.header('X-Idempotency-Key');
        const situation = database_js_1.dbService.getSituation(situationId);
        if (!situation) {
            res.status(404).json({ error: `Situation ${situationId} not found.` });
            return;
        }
        const previousVersion = database_js_1.dbService.getLatestVersion(situationId);
        if (!previousVersion) {
            res.status(500).json({ error: "Situation history corrupted: missing previous version." });
            return;
        }
        // Run AI analysis with history context (Blocker 6 context summarization)
        const historySummary = `Previous Version ${previousVersion.version} Summary: ${previousVersion.structuredResponse.summary}. Identified: ${previousVersion.structuredResponse.identifiedIssues.join(', ')}`;
        const { response, wasRepaired, isDegraded, logs } = await aiEngine_js_1.aiEngine.analyzeSituation(rawInput, historySummary);
        const nextVersionNum = situation.currentVersionNumber + 1;
        const now = new Date().toISOString();
        // Create current version record temporarily to compute delta
        const nextVersionRecord = {
            id: `ver_${(0, uuid_1.v4)().substring(0, 8)}`,
            situationId,
            version: nextVersionNum,
            rawInput,
            timestamp: now,
            structuredResponse: response,
            isDegraded
        };
        // Compute Delta (Blocker 4 & 5)
        const delta = deltaEngine_js_1.deltaEngine.computeDelta(previousVersion, nextVersionRecord);
        nextVersionRecord.deltaSummary = delta;
        // Update Situation master record
        situation.currentVersionNumber = nextVersionNum;
        situation.latestResponse = response;
        situation.updatedAt = now;
        database_js_1.dbService.saveSituation(situation);
        database_js_1.dbService.saveVersion(nextVersionRecord);
        database_js_1.dbService.addAuditLog(userId, 'REASSESS_SITUATION', situationId, { version: nextVersionNum, delta: delta.summaryDelta });
        database_js_1.dbService.addPromptLog(userId, rawInput, JSON.stringify(response), situationId);
        res.status(200).json({
            situation,
            version: nextVersionRecord,
            deltaSummary: delta,
            _meta: { wasRepaired, isDegraded, processingLogs: logs }
        });
    }
    catch (err) {
        console.error("Error reassessing situation:", err);
        res.status(500).json({ error: "Internal server error during reassessment.", details: err.message });
    }
});
/**
 * GET /api/situations/:id
 * Fetches single situation
 */
exports.situationRouter.get('/:id', (req, res) => {
    const situation = database_js_1.dbService.getSituation(req.params.id);
    if (!situation) {
        res.status(404).json({ error: "Situation not found." });
        return;
    }
    const history = database_js_1.dbService.getVersionsForSituation(req.params.id);
    res.status(200).json({ situation, history });
});
/**
 * GET /api/situations/:id/history
 * Fetches complete version timeline & deltas
 */
exports.situationRouter.get('/:id/history', (req, res) => {
    const history = database_js_1.dbService.getVersionsForSituation(req.params.id);
    res.status(200).json({ history });
});
