import { StructuredResponse, Situation, SituationVersion, DeltaSummary } from '../types';

export interface APIResponseMeta {
  wasRepaired?: boolean;
  isDegraded?: boolean;
  processingLogs?: string[];
  idempotencyHit?: boolean;
  idempotencyKey?: string;
}

export interface AnalyzeResult {
  situation: Situation;
  version: SituationVersion;
  deltaSummary?: DeltaSummary | null;
  _meta?: APIResponseMeta;
}

const API_BASE = '/api';

export class APIService {
  /**
   * Submits initial situation (Idempotent)
   */
  public async submitSituation(
    rawInput: string,
    idempotencyKey?: string,
    chaosMode?: 'none' | '429' | 'malformed'
  ): Promise<AnalyzeResult> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Candidate-Id': 'candidate@hazhteq.com'
    };

    if (idempotencyKey) {
      headers['X-Idempotency-Key'] = idempotencyKey;
    }

    if (chaosMode === '429') {
      headers['X-Chaos'] = '429';
    } else if (chaosMode === 'malformed') {
      headers['X-Chaos'] = 'malformed';
    }

    const res = await fetch(`${API_BASE}/situations`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ rawInput, userId: 'user_demo_1' })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Unknown server error' }));
      throw new Error(err.error || `Server responded with ${res.status}`);
    }

    return res.json();
  }

  /**
   * Submits situation update / reassessment
   */
  public async reassessSituation(
    situationId: string,
    rawInput: string,
    idempotencyKey?: string
  ): Promise<AnalyzeResult> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Candidate-Id': 'candidate@hazhteq.com'
    };
    if (idempotencyKey) headers['X-Idempotency-Key'] = idempotencyKey;

    const res = await fetch(`${API_BASE}/situations/${situationId}/reassess`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ rawInput, userId: 'user_demo_1' })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Reassessment failed' }));
      throw new Error(err.error || `Server responded with ${res.status}`);
    }

    return res.json();
  }

  /**
   * Purges user data (GDPR Blocker 7)
   */
  public async purgeUserData(userId: string = 'user_demo_1'): Promise<any> {
    const res = await fetch(`${API_BASE}/privacy/purge/${userId}`, {
      method: 'DELETE',
      headers: {
        'X-Candidate-Id': 'candidate@hazhteq.com'
      }
    });
    return res.json();
  }

  /**
   * Runs all 7 shared scenarios
   */
  public async runBenchmark(): Promise<any> {
    const res = await fetch(`${API_BASE}/scenarios/run-all`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return res.json();
  }
}

export const apiService = new APIService();
