import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { alertRouter } from './routes/alert.routes';
import { incidentRouter } from './routes/incident.routes';
import { errorHandler } from './middleware/error-handler';
import { notFoundHandler } from './middleware/not-found';

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173'
    })
  );
  app.use(helmet());
  app.use(express.json());
  app.use(morgan('dev'));

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'ShiftSync Alerts API'
    });
  });

  app.use('/api/alerts', alertRouter);
  app.use('/api/incidents', incidentRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
