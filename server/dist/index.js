"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const situations_js_1 = require("./routes/situations.js");
const privacy_js_1 = require("./routes/privacy.js");
const scenarios_js_1 = require("./routes/scenarios.js");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// API Request Logging
app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});
// Health check
app.get('/api/health', (_req, res) => {
    res.status(200).json({
        status: 'online',
        system: 'NextStep End-to-End Decision Engine',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});
// Route registration
app.use('/api/situations', situations_js_1.situationRouter);
app.use('/api/privacy', privacy_js_1.privacyRouter);
app.use('/api/scenarios', scenarios_js_1.scenarioRouter);
app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 NextStep End-to-End Server running on port ${PORT}`);
    console.log(`🔗 API Base: http://localhost:${PORT}/api`);
    console.log(`=======================================================`);
});
