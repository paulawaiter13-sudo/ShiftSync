# ShiftSync Stage 1

Stage 1 delivers alert intake and an operations dashboard for raw alerts. Alerts are intentionally modeled as signals that can be documented, triaged, and tracked without becoming incidents.

## Stack

- Backend: Node.js, Express, TypeScript, Prisma, SQLite
- Frontend: React, TypeScript, Vite, Tailwind CSS

## Setup

1. Install workspace dependencies:

   ```bash
   npm install
   ```

2. Generate the Prisma client, create the SQLite database, and seed realistic alert data:

   ```bash
   npm run db:setup
   ```

## Run

Start both apps together:

```bash
npm run dev
```

Or run them separately:

```bash
npm run dev:backend
npm run dev:frontend
```

## URLs

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:4000/api`

## Build

```bash
npm run build
```
