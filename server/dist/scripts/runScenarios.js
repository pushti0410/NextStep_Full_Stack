"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const scenarios_js_1 = require("../routes/scenarios.js");
const aiEngine_js_1 = require("../services/aiEngine.js");
async function runBenchmark() {
    console.log("==========================================================================");
    console.log("⚡ NEXTSTEP SHARED SCENARIO BENCHMARK TEST SUITE (7 INPUTS)");
    console.log("==========================================================================");
    let passed = 0;
    for (const sc of scenarios_js_1.SHARED_SCENARIOS) {
        console.log(`\n--------------------------------------------------------------------------`);
        console.log(`[Scenario #${sc.id}] Type: ${sc.type}`);
        console.log(`Input: "${sc.input}"`);
        const start = Date.now();
        const { response, wasRepaired, isDegraded, logs } = await aiEngine_js_1.aiEngine.analyzeSituation(sc.input);
        const duration = Date.now() - start;
        console.log(`Mode: [${response.mode.toUpperCase()}] | Time: ${duration}ms | Degraded: ${isDegraded} | Repaired: ${wasRepaired}`);
        console.log(`Summary: "${response.summary}"`);
        console.log(`Top Priority: "${response.priorities[0]?.title || 'None'}"`);
        console.log(`Recommended Next Step: "${response.recommendedNextAction}"`);
        if (response.priorities.some(p => p.isTied)) {
            console.log(`⚠️ TIED PRIORITIES DETECTED: ${response.priorities.filter(p => p.isTied).map(p => p.title).join(' <-> ')}`);
        }
        let isPass = true;
        if (sc.id === 4 && response.mode !== 'calm_safety')
            isPass = false;
        if (sc.id === 6 && !response.atRiskFlag)
            isPass = false;
        if (isPass) {
            console.log(`Result: ✅ PASS`);
            passed++;
        }
        else {
            console.log(`Result: ❌ FAIL`);
        }
        if (logs.length > 0) {
            console.log(`Logs: ${logs.join(' | ')}`);
        }
    }
    console.log("\n==========================================================================");
    console.log(`BENCHMARK COMPLETE: ${passed}/${scenarios_js_1.SHARED_SCENARIOS.length} PASSED (${Math.round((passed / scenarios_js_1.SHARED_SCENARIOS.length) * 100)}%)`);
    console.log("==========================================================================");
}
runBenchmark().catch(console.error);
