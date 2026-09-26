import { z } from 'zod';
import { StructuredResponse, PriorityItem, ConstraintItem } from '../types.js';

const PriorityItemSchema = z.object({
  id: z.string().default(() => `p_${Math.random().toString(36).substr(2, 6)}`),
  title: z.string().min(1, "Title required"),
  rank: z.number().int().min(1),
  urgency: z.enum(['critical', 'high', 'medium', 'low']).default('high'),
  impact: z.string().default("High impact on current situation"),
  recommendedAction: z.string().default("Take immediate action on this item"),
  isTied: z.boolean().optional().default(false),
  confidence: z.number().min(0).max(1).optional().default(0.85)
});

const ConstraintItemSchema = z.object({
  id: z.string().default(() => `c_${Math.random().toString(36).substr(2, 6)}`),
  description: z.string(),
  type: z.enum(['financial', 'time', 'interpersonal', 'health', 'academic_career', 'general']).default('general')
});

export const StructuredResponseSchema = z.object({
  mode: z.enum(['normal', 'calm_safety', 'degraded_fallback']).default('normal'),
  summary: z.string().min(1, "Summary required"),
  identifiedIssues: z.array(z.string()).default([]),
  priorities: z.array(PriorityItemSchema).default([]),
  constraints: z.array(ConstraintItemSchema).default([]),
  recommendedNextAction: z.string().default("Focus on the top priority task first."),
  clarificationQuestions: z.array(z.string()).default([]),
  atRiskFlag: z.boolean().default(false),
  riskGuidance: z.string().nullable().optional(),
  confidenceScore: z.number().min(0).max(1).default(0.85)
});

export interface ValidationResult {
  isValid: boolean;
  data: StructuredResponse;
  wasRepaired: boolean;
  repairDetails?: string[];
  rawError?: string;
}

export class SchemaValidatorService {
  /**
   * Cleans malformed JSON strings (e.g. unescaped newlines, trailing commas, markdown code blocks, missing brackets)
   */
  public cleanRawJSON(raw: string): string {
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
  public parseJSONWithRepair(raw: string): any {
    const cleaned = this.cleanRawJSON(raw);
    try {
      return JSON.parse(cleaned);
    } catch (e1) {
      // Attempt repair 1: Balance unclosed braces or brackets
      let repairedStr = cleaned;
      const openBraces = (repairedStr.match(/\{/g) || []).length;
      const closeBraces = (repairedStr.match(/\}/g) || []).length;
      const openBrackets = (repairedStr.match(/\[/g) || []).length;
      const closeBrackets = (repairedStr.match(/\]/g) || []).length;

      for (let i = 0; i < openBraces - closeBraces; i++) repairedStr += '}';
      for (let i = 0; i < openBrackets - closeBrackets; i++) repairedStr += ']';

      try {
        return JSON.parse(repairedStr);
      } catch (e2) {
        throw new Error(`Unrecoverable JSON syntax error: ${(e1 as Error).message}`);
      }
    }
  }

  /**
   * Validates raw object against StructuredResponseSchema, repairing partial/missing fields
   */
  public validateAndRepair(rawObject: any): ValidationResult {
    const repairDetails: string[] = [];
    let wasRepaired = false;

    if (typeof rawObject !== 'object' || rawObject === null) {
      rawObject = {};
      wasRepaired = true;
      repairDetails.push('Input was not an object, defaulted to empty object.');
    }

    // Ensure priorities array exists & rank ties are flagged
    if (Array.isArray(rawObject.priorities)) {
      // Check for equal ranks (Blocker 8)
      const rankMap = new Map<number, number>();
      rawObject.priorities.forEach((p: any) => {
        if (typeof p.rank === 'number') {
          rankMap.set(p.rank, (rankMap.get(p.rank) || 0) + 1);
        }
      });

      rawObject.priorities = rawObject.priorities.map((p: any, idx: number) => {
        if (!p.recommendedAction) {
          p.recommendedAction = `Address ${p.title || 'issue'} directly as step 1.`;
          wasRepaired = true;
          repairDetails.push(`Repaired priority item [${p.title || idx}] missing recommendedAction.`);
        }
        if (!p.urgency) {
          p.urgency = 'high';
          wasRepaired = true;
        }
        if (p.rank && rankMap.get(p.rank)! > 1) {
          p.isTied = true;
          repairDetails.push(`Flagged tied priority rank #${p.rank} for item '${p.title}'.`);
        }
        return p;
      });
    }

    // Validate using Zod schema
    const result = StructuredResponseSchema.safeParse(rawObject);

    if (result.success) {
      return {
        isValid: true,
        data: result.data as StructuredResponse,
        wasRepaired,
        repairDetails
      };
    } else {
      // Deep recovery: salvage valid fields, supply fallbacks for invalid ones
      const fallbackResponse: StructuredResponse = {
        mode: rawObject.mode === 'calm_safety' ? 'calm_safety' : 'normal',
        summary: typeof rawObject.summary === 'string' ? rawObject.summary : "Situation analyzed with structural adjustments.",
        identifiedIssues: Array.isArray(rawObject.identifiedIssues) ? rawObject.identifiedIssues : ["Identified active issue requiring resolution"],
        priorities: Array.isArray(rawObject.priorities) && rawObject.priorities.length > 0 
          ? rawObject.priorities.map((p: any, i: number) => ({
              id: p.id || `p_${i}`,
              title: String(p.title || `Priority ${i+1}`),
              rank: typeof p.rank === 'number' ? p.rank : i + 1,
              urgency: ['critical','high','medium','low'].includes(p.urgency) ? p.urgency : 'high',
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

export const schemaValidator = new SchemaValidatorService();
