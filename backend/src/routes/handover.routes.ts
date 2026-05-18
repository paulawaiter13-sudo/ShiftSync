import { Router } from 'express';
import {
  handleCreateHandover,
  handleGetHandoverById,
  handleGetHandoverSuggestions,
  handleListHandovers,
  handleUpdateHandover,
  handleUpdateHandoverStatus
} from '../controllers/handover.controller';

const handoverRoutes = Router();

handoverRoutes.get('/suggestions/current-shift', handleGetHandoverSuggestions);
handoverRoutes.get('/', handleListHandovers);
handoverRoutes.post('/', handleCreateHandover);
handoverRoutes.get('/:id', handleGetHandoverById);
handoverRoutes.patch('/:id/status', handleUpdateHandoverStatus);
handoverRoutes.patch('/:id', handleUpdateHandover);

export default handoverRoutes;