import { Router } from 'express';
import {
  handleCreateIncident,
  handleCreateIncidentFromAlert,
  handleGetIncidentById,
  handleListIncidents,
  handleUpdateIncidentStatus
} from '../controllers/incident.controller';

const incidentRouter = Router();

incidentRouter.get('/', handleListIncidents);
incidentRouter.get('/:id', handleGetIncidentById);
incidentRouter.post('/', handleCreateIncident);
incidentRouter.post('/from-alert/:alertId', handleCreateIncidentFromAlert);
incidentRouter.patch('/:id/status', handleUpdateIncidentStatus);

export { incidentRouter };
