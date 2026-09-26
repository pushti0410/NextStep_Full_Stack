import fs from 'fs';
import path from 'path';
import { Situation, SituationVersion, DataPurgeResult } from '../types.js';

interface AuditRecord {
  id: string;
  userId: string;
  situationId?: string;
  action: string;
  timestamp: string;
  details?: Record<string, any>;
}

interface PromptRecord {
  id: string;
  userId: string;
  situationId?: string;
  prompt: string;
  output: string;
  timestamp: string;
}

interface IdempotencyRecord {
  key: string;
  payloadHash: string;
  result: any;
  timestamp: number;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface SchemaDB {
  situations: Situation[];
  versions: SituationVersion[];
  auditLogs: AuditRecord[];
  promptLogs: PromptRecord[];
  idempotencyStore: Record<string, IdempotencyRecord>;
}

class DatabaseService {
  private db: SchemaDB = {
    situations: [],
    versions: [],
    auditLogs: [],
    promptLogs: [],
    idempotencyStore: {}
  };

  constructor() {
    this.init();
  }

  private init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.db = JSON.parse(raw);
      } catch (err) {
        console.error('Failed to parse existing DB file, starting clean DB', err);
        this.save();
      }
    } else {
      this.save();
    }
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.db, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving DB:', err);
    }
  }

  // --- Situation Operations ---
  public getSituation(id: string): Situation | undefined {
    return this.db.situations.find(s => s.id === id);
  }

  public saveSituation(situation: Situation) {
    const idx = this.db.situations.findIndex(s => s.id === situation.id);
    if (idx >= 0) {
      this.db.situations[idx] = situation;
    } else {
      this.db.situations.push(situation);
    }
    this.save();
  }

  // --- Version Operations ---
  public saveVersion(version: SituationVersion) {
    this.db.versions.push(version);
    this.save();
  }

  public getVersionsForSituation(situationId: string): SituationVersion[] {
    return this.db.versions
      .filter(v => v.situationId === situationId)
      .sort((a, b) => a.version - b.version);
  }

  public getLatestVersion(situationId: string): SituationVersion | undefined {
    const versions = this.getVersionsForSituation(situationId);
    return versions.length > 0 ? versions[versions.length - 1] : undefined;
  }

  // --- Idempotency Store ---
  public getIdempotency(key: string): IdempotencyRecord | undefined {
    const rec = this.db.idempotencyStore[key];
    if (!rec) return undefined;
    // Expire after 10 minutes
    if (Date.now() - rec.timestamp > 600000) {
      delete this.db.idempotencyStore[key];
      this.save();
      return undefined;
    }
    return rec;
  }

  public setIdempotency(key: string, payloadHash: string, result: any) {
    this.db.idempotencyStore[key] = {
      key,
      payloadHash,
      result,
      timestamp: Date.now()
    };
    this.save();
  }

  // --- Audit & Prompt Logging ---
  public addAuditLog(userId: string, action: string, situationId?: string, details?: Record<string, any>) {
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

  public addPromptLog(userId: string, prompt: string, output: string, situationId?: string) {
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
  public purgeUserData(userId: string): DataPurgeResult {
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

export const dbService = new DatabaseService();
