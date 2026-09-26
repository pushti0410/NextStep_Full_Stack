"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.privacyRouter = void 0;
const express_1 = require("express");
const database_js_1 = require("../db/database.js");
exports.privacyRouter = (0, express_1.Router)();
/**
 * DELETE /api/privacy/purge/:userId
 * Complete GDPR data purge removing situations, version records, audit logs, and prompt logs.
 */
exports.privacyRouter.delete('/purge/:userId', (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId || userId.trim().length === 0) {
            res.status(400).json({ error: "userId parameter is required." });
            return;
        }
        const purgeReport = database_js_1.dbService.purgeUserData(userId);
        res.status(200).json({
            success: true,
            message: `Complete GDPR data purge executed for user [${userId}].`,
            purgeReport
        });
    }
    catch (err) {
        console.error("Data purge failure:", err);
        res.status(500).json({ error: "Failed to purge user data.", details: err.message });
    }
});
