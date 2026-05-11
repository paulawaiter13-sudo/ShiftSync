import { createServer } from 'node:http';
import { createApp } from './app';
import { prisma } from './lib/prisma';

const port = Number(process.env.PORT ?? 4000);
const app = createApp();
const server = createServer(app);

async function shutdown(signal: string) {
  console.log(`Received ${signal}. Closing server...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

server.listen(port, () => {
  console.log(`ShiftSync Alerts API listening on http://localhost:${port}`);
});

process.on('SIGINT', () => {
  void shutdown('SIGINT');
});

process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});
