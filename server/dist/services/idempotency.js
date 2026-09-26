"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.idempotencyService = exports.IdempotencyService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const database_js_1 = require("../db/database.js");
class IdempotencyService {
    /**
     * Generates or extracts idempotency key for incoming request
     */
    getOrGenerateKey(reqKey, userId, payload) {
        if (reqKey && reqKey.trim().length > 0) {
            return reqKey.trim();
        }
        const hash = crypto_1.default.createHash('sha256')
            .update(`${userId || 'anon'}_${payload || ''}`)
            .digest('hex');
        return `auto_${hash.substring(0, 16)}`;
    }
    /**
     * Checks if an idempotency key has already been processed or is currently processing
     */
    checkIdempotency(key, payloadHash) {
        const existing = database_js_1.dbService.getIdempotency(key);
        if (existing) {
            return {
                isDuplicate: true,
                cachedResult: existing.result
            };
        }
        return { isDuplicate: false };
    }
    /**
     * Saves response for idempotency key
     */
    saveIdempotency(key, payloadHash, result) {
        database_js_1.dbService.setIdempotency(key, payloadHash, result);
    }
}
exports.IdempotencyService = IdempotencyService;
exports.idempotencyService = new IdempotencyService();
