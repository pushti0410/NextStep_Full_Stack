"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.degradedFallback = exports.DegradedFallbackEngine = void 0;
class DegradedFallbackEngine {
    /**
     * Generates a high-quality rule-based heuristic decision structure when AI provider rate limits (429), times out, or fails.
     */
    generateDegradedResponse(rawInput, errorReason = 'Provider traffic peak (429 Rate Limit)') {
        const text = rawInput.toLowerCase();
        // 1. Detect emotional / at-risk keywords
        const isAtRisk = text.includes('tired of all of it') ||
            text.includes('what\'s the point') ||
            text.includes('want it all to stop') ||
            text.includes('cannot take this');
        if (isAtRisk) {
            return {
                mode: 'calm_safety',
                summary: "We hear how overwhelming things are right now. Take a pause — your safety and well-being come first before any deadline or task.",
                identifiedIssues: ["Emotional overwhelm", "High stress accumulation"],
                priorities: [
                    {
                        id: 'p_degraded_safety',
                        title: 'Pause and Connect with Support',
                        rank: 1,
                        urgency: 'critical',
                        impact: 'Protects immediate mental health and safety',
                        recommendedAction: 'Reach out to a trusted friend, family member, or call 9152987821 (iCall Helpline India).',
                        isTied: false,
                        confidence: 1.0
                    }
                ],
                constraints: [
                    { id: 'c_degraded_1', description: 'Mental exhaustion / low emotional bandwidth', type: 'health' }
                ],
                recommendedNextAction: "Take 5 deep breaths and reach out to someone you trust.",
                clarificationQuestions: [],
                atRiskFlag: true,
                riskGuidance: "If you feel in crisis, please call 9152987821 (iCall) or 1800-599-0019 (KIRAN Helpline). You are not alone.",
                confidenceScore: 0.95
            };
        }
        // 2. Extract potential key problems from input
        const sentences = rawInput.split(/(?:\.|\n|;)+/).map(s => s.trim()).filter(s => s.length > 5);
        const issues = [];
        const priorities = [];
        const constraints = [];
        // Rule heuristics for common Indian student / tech problems
        if (text.includes('viva') || text.includes('exam') || text.includes('submission') || text.includes('deadline')) {
            issues.push("Immediate Academic Deadline / Exam");
            priorities.push({
                id: 'p_deg_1',
                title: 'Academic & Exam Deadline Preparation',
                rank: 1,
                urgency: 'critical',
                impact: 'Affects grade and academic evaluation',
                recommendedAction: 'Identify minimum viable submission requirements or contact professor/TA immediately.',
                isTied: false,
                confidence: 0.8
            });
        }
        if (text.includes('laptop') || text.includes('dead') || text.includes('boot')) {
            issues.push("Hardware Failure / Computer Inoperable");
            priorities.push({
                id: 'p_deg_2',
                title: 'Secure Alternative Working Computer',
                rank: priorities.length + 1,
                urgency: 'high',
                impact: 'Enables completion of digital tasks',
                recommendedAction: 'Borrow a friend\'s laptop, visit campus computer lab, or use mobile IDE for emergency submission.',
                isTied: false,
                confidence: 0.85
            });
            constraints.push({
                id: 'c_deg_hw',
                description: 'Primary workstation disabled',
                type: 'time'
            });
        }
        if (text.includes('hospital') || text.includes('dad') || text.includes('family') || text.includes('health')) {
            issues.push("Family Medical Emergency");
            priorities.push({
                id: 'p_deg_med',
                title: 'Family Support & Emergency Coordination',
                rank: 1, // Tied rank with academic or primary emergency!
                urgency: 'critical',
                impact: 'Vital personal priority',
                recommendedAction: 'Check hospital status, delegate minor academic/work tasks, and communicate status to key contacts.',
                isTied: true, // Demonstrates tied priority handling
                confidence: 0.9
            });
            constraints.push({
                id: 'c_deg_med',
                description: 'Physical location constraint / Emotional focus divided',
                type: 'health'
            });
        }
        if (text.includes('landlord') || text.includes('money') || text.includes('rent') || text.includes('paise')) {
            issues.push("Financial & Housing Pressure");
            priorities.push({
                id: 'p_deg_housing',
                title: 'Landlord & Rent Timeline Negotiation',
                rank: priorities.length + 1,
                urgency: 'high',
                impact: 'Secures shelter stability',
                recommendedAction: 'Send polite message requesting 3-day extension due to family emergency.',
                isTied: false,
                confidence: 0.8
            });
            constraints.push({
                id: 'c_deg_fin',
                description: 'Temporary liquidity constraint',
                type: 'financial'
            });
        }
        // Default fallback if no specific keywords matched
        if (priorities.length === 0) {
            issues.push("Complex Multi-Constraint Situation");
            priorities.push({
                id: 'p_deg_gen',
                title: 'Isolate & Stabilize Urgent Blocker',
                rank: 1,
                urgency: 'high',
                impact: 'Prevents cascade failure',
                recommendedAction: 'Pick the task with the nearest deadline and complete a 20-minute focus sprint.',
                isTied: false,
                confidence: 0.7
            });
        }
        // Deduplicate and rank priorities
        priorities.sort((a, b) => a.rank - b.rank);
        return {
            mode: 'degraded_fallback',
            summary: `System operated under high-load fallback mode (${errorReason}). We extracted key urgent issues and structured a quick action plan.`,
            identifiedIssues: issues.length > 0 ? issues : ["Multiple concurrent obligations requiring triage"],
            priorities: priorities,
            constraints: constraints,
            recommendedNextAction: priorities[0]?.recommendedAction || "Focus on the single item with the tightest time deadline.",
            clarificationQuestions: [
                "Which of these issues has a hard deadline within the next 6 hours?",
                "Can any non-critical commitment be delayed by 24 hours?"
            ],
            atRiskFlag: false,
            riskGuidance: null,
            confidenceScore: 0.75
        };
    }
}
exports.DegradedFallbackEngine = DegradedFallbackEngine;
exports.degradedFallback = new DegradedFallbackEngine();
