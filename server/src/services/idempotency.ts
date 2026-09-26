import crypto from 'crypto';
import { dbService } from '../db/database.js';

export class IdempotencyService {
  /**
   * Generates or extracts idempotency key for incoming request
   */
  public getOrGenerateKey(reqKey?: string, userId?: string, payload?: string): string {
    if (reqKey && reqKey.trim().length > 0) {
      return reqKey.trim();
    }
    const hash = crypto.createHash('sha256')
      .update(`${userId || 'anon'}_${payload || ''}`)
      .digest('hex');
    return `auto_${hash.substring(0, 16)}`;
  }

  /**
   * Checks if an idempotency key has already been processed or is currently processing
   */
  public checkIdempotency(key: string, payloadHash: string): { isDuplicate: boolean; cachedResult?: any } {
    const existing = dbService.getIdempotency(key);
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
  public saveIdempotency(key: string, payloadHash: string, result: any) {
    dbService.setIdempotency(key, payloadHash, result);
  }
}

export const idempotencyService = new IdempotencyService();
