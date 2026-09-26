"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const DATA_DIR = path_1.default.join(process.cwd(), 'data');
const DB_FILE = path_1.default.join(DATA_DIR, 'db.json');
class DatabaseService {
    db = {
        situations: [],
        versions: [],
        auditLogs: [],
        promptLogs: [],
        idempotencyStore: {}
    };
    constructor() {
        this.init();
    }
    init() {
        if (!fs_1.default.existsSync(DATA_DIR)) {
            fs_1.default.mkdirSync(DATA_DIR, { recursive: true });
        }
        if (fs_1.default.existsSync(DB_FILE)) {
            try {
                const raw = fs_1.default.readFileSync(DB_FILE, 'utf-8');
                this.db = JSON.parse(raw);
            }
            catch (err) {
                console.error('Failed to parse existing DB file, starting clean DB', err);
                this.save();
            }
        }
        else {
            this.save();
        }
    }
    save() {
        try {
            fs_1.default.writeFileSync(DB_FILE, JSON.stringify(this.db, null, 2), 'utf-8');
        }
        catch (err) {
            console.error('Error saving DB:', err);
        }
    }
    // --- Situation Operations ---
    getSituation(id) {
        return this.db.situations.find(s => s.id === id);
    }
    saveSituation(situation) {
        const idx = this.db.situations.findIndex(s => s.id === situation.id);
        if (idx >= 0) {
            this.db.situations[idx] = situation;
        }
        else {
            this.db.situations.push(situation);
        }
        this.save();
    }
    // --- Version Operations ---
    saveVersion(version) {
        this.db.versions.push(version);
        this.save();
    }
    getVersionsForSituation(situationId) {
        return this.db.versions
            .filter(v => v.situationId === situationId)
            .sort((a, b) => a.version - b.version);
    }
    getLatestVersion(situationId) {
        const versions = this.getVersionsForSituation(situationId);
        return versions.length > 0 ? versions[versions.length - 1] : undefined;
    }
    // --- Idempotency Store ---
    getIdempotency(key) {
        const rec = this.db.idempotencyStore[key];
        if (!rec)
            return undefined;
        // Expire after 10 minutes
        if (Date.now() - rec.timestamp > 600000) {
            delete this.db.idempotencyStore[key];
            this.save();
            return undefined;
        }
        return rec;
    }
    setIdempotency(key, payloadHash, result) {
        this.db.idempotencyStore[key] = {
            key,
            payloadHash,
            result,
            timestamp: Date.now()
        };
        this.save();
    }
    // --- Audit & Prompt Logging ---
    addAuditLog(userId, action, situationId, details) {
        this.db.auditLogs.push({
            id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            userId,
            situationId,
            action,
            timestamp: new Date().toISOString(),
            details
        });
        this.save();
    }
    addPromptLog(userId, prompt, output, situationId) {
        this.db.promptLogs.push({
            id: `prompt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            userId,
            situationId,
            prompt,
            output,
            timestamp: new Date().toISOString()
        });
        this.save();
    }
    // --- Blocker 7: GDPR Purge Execution ---
    purgeUserData(userId) {
        const situationsToPurge = this.db.situations.filter(s => s.userId === userId);
        const situationIds = new Set(situationsToPurge.map(s => s.id));
        const initialSituationsCount = this.db.situations.length;
        const initialVersionsCount = this.db.versions.length;
        const initialLogsCount = this.db.auditLogs.length;
        const initialPromptsCount = this.db.promptLogs.length;
        // Deep filter
        this.db.situations = this.db.situations.filter(s => s.userId !== userId);
        this.db.versions = this.db.versions.filter(v => !situationIds.has(v.situationId));
        this.db.auditLogs = this.db.auditLogs.filter(a => a.userId !== userId && (!a.situationId || !situationIds.has(a.situationId)));
        this.db.promptLogs = this.db.promptLogs.filter(p => p.userId !== userId && (!p.situationId || !situationIds.has(p.situationId)));
        this.save();
        return {
            userId,
            situationsPurged: initialSituationsCount - this.db.situations.length,
            versionsPurged: initialVersionsCount - this.db.versions.length,
            logsPurged: initialLogsCount - this.db.auditLogs.length,
            promptsPurged: initialPromptsCount - this.db.promptLogs.length,
            timestamp: new Date().toISOString()
        };
    }
}
exports.dbService = new DatabaseService();
