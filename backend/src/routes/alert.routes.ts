import { Router } from 'express';
import {
  handleAcknowledgeAlert,
  handleCreateAlert,
  handleCreateInvestigationNote,
  handleGetAlertById,
  handleListInvestigationNotes,
  handleListAlerts,
  handleUpdateAlertStatus
} from '../controllers/alert.controller';

const alertRouter = Router();

alertRouter.get('/', handleListAlerts);
alertRouter.get('/:id', handleGetAlertById);
alertRouter.get('/:id/notes', handleListInvestigationNotes);
alertRouter.post('/', handleCreateAlert);
alertRouter.post('/:id/notes', handleCreateInvestigationNote);
alertRouter.patch('/:id/acknowledge', handleAcknowledgeAlert);
alertRouter.patch('/:id/status', handleUpdateAlertStatus);

export { alertRouter };
