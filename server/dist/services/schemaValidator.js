"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schemaValidator = exports.SchemaValidatorService = exports.StructuredResponseSchema = void 0;
const zod_1 = require("zod");
const PriorityItemSchema = zod_1.z.object({
    id: zod_1.z.string().default(() => `p_${Math.random().toString(36).substr(2, 6)}`),
    title: zod_1.z.string().min(1, "Title required"),
    rank: zod_1.z.number().int().min(1),
    urgency: zod_1.z.enum(['critical', 'high', 'medium', 'low']).default('high'),
    impact: zod_1.z.string().default("High impact on current situation"),
    recommendedAction: zod_1.z.string().default("Take immediate action on this item"),
    isTied: zod_1.z.boolean().optional().default(false),
    confidence: zod_1.z.number().min(0).max(1).optional().default(0.85)
});
const ConstraintItemSchema = zod_1.z.object({
    id: zod_1.z.string().default(() => `c_${Math.random().toString(36).substr(2, 6)}`),
    description: zod_1.z.string(),
    type: zod_1.z.enum(['financial', 'time', 'interpersonal', 'health', 'academic_career', 'general']).default('general')
});
exports.StructuredResponseSchema = zod_1.z.object({
    mode: zod_1.z.enum(['normal', 'calm_safety', 'degraded_fallback']).default('normal'),
    summary: zod_1.z.string().min(1, "Summary required"),
    identifiedIssues: zod_1.z.array(zod_1.z.string()).default([]),
    priorities: zod_1.z.array(PriorityItemSchema).default([]),
    constraints: zod_1.z.array(ConstraintItemSchema).default([]),
    recommendedNextAction: zod_1.z.string().default("Focus on the top priority task first."),
    clarificationQuestions: zod_1.z.array(zod_1.z.string()).default([]),
    atRiskFlag: zod_1.z.boolean().default(false),
    riskGuidance: zod_1.z.string().nullable().optional(),
    confidenceScore: zod_1.z.number().min(0).max(1).default(0.85)
});
class SchemaValidatorService {
    /**
     * Cleans malformed JSON strings (e.g. unescaped newlines, trailing commas, markdown code blocks, missing brackets)
     */
    cleanRawJSON(raw) {
        let clean = raw.trim();
        // Remove markdown code fences if present
        clean = clean.replace(/^```(json)?/i, '').replace(/```$/, '').trim();
        // Replace smart quotes
        clean = clean.replace(/[\u201C\u201D]/g, '"');
        // Remove trailing commas before closing braces/brackets
        clean = clean.replace(/,\s*([\}\]])/g, '$1');
        return clean;
    }
    /**
     * Attempts JSON parsing with multi-stage repair heuristics
     */
    parseJSONWithRepair(raw) {
        const cleaned = this.cleanRawJSON(raw);
        try {
            return JSON.parse(cleaned);
        }
        catch (e1) {
            // Attempt repair 1: Balance unclosed braces or brackets
            let repairedStr = cleaned;
            const openBraces = (repairedStr.match(/\{/g) || []).length;
            const closeBraces = (repairedStr.match(/\}/g) || []).length;
            const openBrackets = (repairedStr.match(/\[/g) || []).length;
            const closeBrackets = (repairedStr.match(/\]/g) || []).length;
            for (let i = 0; i < openBraces - closeBraces; i++)
                repairedStr += '}';
            for (let i = 0; i < openBrackets - closeBrackets; i++)
                repairedStr += ']';
            try {
                return JSON.parse(repairedStr);
            }
            catch (e2) {
                throw new Error(`Unrecoverable JSON syntax error: ${e1.message}`);
            }
        }
    }
    /**
     * Validates raw object against StructuredResponseSchema, repairing partial/missing fields
     */
    validateAndRepair(rawObject) {
        const repairDetails = [];
        let wasRepaired = false;
        if (typeof rawObject !== 'object' || rawObject === null) {
            rawObject = {};
            wasRepaired = true;
            repairDetails.push('Input was not an object, defaulted to empty object.');
        }
        // Ensure priorities array exists & rank ties are flagged
        if (Array.isArray(rawObject.priorities)) {
            // Check for equal ranks (Blocker 8)
            const rankMap = new Map();
            rawObject.priorities.forEach((p) => {
                if (typeof p.rank === 'number') {
                    rankMap.set(p.rank, (rankMap.get(p.rank) || 0) + 1);
                }
            });
            rawObject.priorities = rawObject.priorities.map((p, idx) => {
                if (!p.recommendedAction) {
                    p.recommendedAction = `Address ${p.title || 'issue'} directly as step 1.`;
                    wasRepaired = true;
                    repairDetails.push(`Repaired priority item [${p.title || idx}] missing recommendedAction.`);
                }
                if (!p.urgency) {
                    p.urgency = 'high';
                    wasRepaired = true;
                }
                if (p.rank && rankMap.get(p.rank) > 1) {
                    p.isTied = true;
                    repairDetails.push(`Flagged tied priority rank #${p.rank} for item '${p.title}'.`);
                }
                return p;
            });
        }
        // Validate using Zod schema
        const result = exports.StructuredResponseSchema.safeParse(rawObject);
        if (result.success) {
            return {
                isValid: true,
                data: result.data,
                wasRepaired,
                repairDetails
            };
        }
        else {
            // Deep recovery: salvage valid fields, supply fallbacks for invalid ones
            const fallbackResponse = {
                mode: rawObject.mode === 'calm_safety' ? 'calm_safety' : 'normal',
                summary: typeof rawObject.summary === 'string' ? rawObject.summary : "Situation analyzed with structural adjustments.",
                identifiedIssues: Array.isArray(rawObject.identifiedIssues) ? rawObject.identifiedIssues : ["Identified active issue requiring resolution"],
                priorities: Array.isArray(rawObject.priorities) && rawObject.priorities.length > 0
                    ? rawObject.priorities.map((p, i) => ({
                        id: p.id || `p_${i}`,
                        title: String(p.title || `Priority ${i + 1}`),
                        rank: typeof p.rank === 'number' ? p.rank : i + 1,
                        urgency: ['critical', 'high', 'medium', 'low'].includes(p.urgency) ? p.urgency : 'high',
                        impact: String(p.impact || "High impact on immediate timeline"),
                        recommendedAction: String(p.recommendedAction || "Execute next step carefully."),
                        isTied: !!p.isTied,
                        confidence: 0.8
                    }))
                    : [{
                            id: 'p_fallback_1',
                            title: 'Primary Action Item',
                            rank: 1,
                            urgency: 'high',
                            impact: 'Critical immediate step',
                            recommendedAction: 'Focus on stabilizing the most urgent blocker first.',
                            isTied: false,
                            confidence: 0.75
                        }],
                constraints: Array.isArray(rawObject.constraints) ? rawObject.constraints : [],
                recommendedNextAction: typeof rawObject.recommendedNextAction === 'string' ? rawObject.recommendedNextAction : "Focus on stabilizing the top priority issue.",
                clarificationQuestions: Array.isArray(rawObject.clarificationQuestions) ? rawObject.clarificationQuestions : ["What is the single most urgent deadline right now?"],
                atRiskFlag: !!rawObject.atRiskFlag,
                riskGuidance: rawObject.riskGuidance || null,
                confidenceScore: 0.75
            };
            return {
                isValid: false,
                data: fallbackResponse,
                wasRepaired: true,
                repairDetails: [...repairDetails, `Zod validation error repaired: ${result.error.issues.map(i => i.message).join('; ')}`],
                rawError: result.error.message
            };
        }
    }
}
exports.SchemaValidatorService = SchemaValidatorService;
exports.schemaValidator = new SchemaValidatorService();
