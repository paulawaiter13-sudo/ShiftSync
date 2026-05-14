import { Router } from 'express';
import {
  handleCreateIncident,
  handleCreateIncidentFromAlert,
  handleGetIncidentById,
  handleListIncidents,
  handleUpdateIncidentStatus
} from '../controllers/incident.controller';

const incidentRouter = Router();

incidentRouter.post('/from-alert/:alertId', handleCreateIncidentFromAlert);
incidentRouter.get('/', handleListIncidents);
incidentRouter.post('/', handleCreateIncident);
incidentRouter.get('/:id', handleGetIncidentById);
incidentRouter.patch('/:id/status', handleUpdateIncidentStatus);

export { incidentRouter };
