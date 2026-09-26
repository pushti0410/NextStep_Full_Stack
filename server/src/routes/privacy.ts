import { Router, Request, Response } from 'express';
import { dbService } from '../db/database.js';

export const privacyRouter = Router();

/**
 * DELETE /api/privacy/purge/:userId
 * Complete GDPR data purge removing situations, version records, audit logs, and prompt logs.
 */
privacyRouter.delete('/purge/:userId', (req: Request, res: Response): void => {
  try {
    const userId = req.params.userId;
    if (!userId || userId.trim().length === 0) {
      res.status(400).json({ error: "userId parameter is required." });
      return;
    }

    const purgeReport = dbService.purgeUserData(userId);

    res.status(200).json({
      success: true,
      message: `Complete GDPR data purge executed for user [${userId}].`,
      purgeReport
    });
  } catch (err) {
    console.error("Data purge failure:", err);
    res.status(500).json({ error: "Failed to purge user data.", details: (err as Error).message });
  }
});
