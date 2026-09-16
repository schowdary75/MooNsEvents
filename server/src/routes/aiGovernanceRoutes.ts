import { Router } from 'express';
import { aiGovernanceController } from '../controllers/aiGovernanceController.js';
import { authorize } from '../middlewares/authenticate.js';
import { requireRecentMfa } from '../middlewares/tenantScope.js';
import { validate } from '../middlewares/validate.js';
import {
  mayaKillSwitchSchema,
  reviewMayaActionSchema,
} from '../validators/aiGovernanceValidator.js';

export const aiGovernanceRoutes = Router();
aiGovernanceRoutes.get(
  '/kill-switches',
  authorize('admin', 'editor', 'approver'),
  aiGovernanceController.killSwitches,
);
aiGovernanceRoutes.put(
  '/kill-switches',
  authorize('admin'),
  requireRecentMfa(),
  validate(mayaKillSwitchSchema),
  aiGovernanceController.setKillSwitch,
);
aiGovernanceRoutes.post(
  '/actions/:proposalId/review',
  authorize('admin', 'editor', 'approver'),
  requireRecentMfa(),
  validate(reviewMayaActionSchema),
  aiGovernanceController.review,
);
aiGovernanceRoutes.get(
  '/actions/:proposalId/incident-receipt',
  authorize('admin', 'editor', 'approver'),
  aiGovernanceController.incidentReceipt,
);
