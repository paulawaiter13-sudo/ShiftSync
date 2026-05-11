import { existsSync, readFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const prismaDir = resolve(process.cwd(), 'prisma');
const databasePath = resolve(prismaDir, 'dev.db');
const sqlPath = resolve(prismaDir, 'init.sql');

if (existsSync(databasePath)) {
  rmSync(databasePath);
}

const database = new DatabaseSync(databasePath);

try {
  const schemaSql = readFileSync(sqlPath, 'utf8');
  database.exec(schemaSql);
  console.log(`Initialized SQLite database at ${databasePath}`);
} finally {
  database.close();
}
