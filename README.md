# Field Weather Dashboard

Weather dashboard for field agents to monitor conditions across multiple plots.

## Requirements

- Node.js >= 18
- pnpm >= 9
- Internet access (weather provider + geocoding)

## Project Structure

```
weather-tool/
├── packages/
│   ├── frontend/          # React + Vite + Zustand + Tailwind
│   ├── backend/           # Express API
│   └── database/          # Prisma + SQLite
├── package.json           # Root workspace config
└── pnpm-workspace.yaml    # pnpm workspaces config
```

## Quick Start (Local)

### 1) Install dependencies
```bash
pnpm install --config.confirmModulesPurge=false
```

### 2) Configure environment variables

Create a `.env` file at the project root:

```bash
FROGCAST_API_TOKEN=your_token_here
```

Notes:
- `FROGCAST_API_TOKEN` is required to retrieve weather forecasts.
- Keep the exact `KEY=value` format (no spaces around `=`).
- Restart backend after any `.env` change.

### 3) Generate Prisma client
```bash
pnpm --filter @field-weather/database run generate
```

### 4) Run database migrations
```bash
pnpm db:migrate
```

### 5) Run development servers
```bash
pnpm dev
```

Default URLs:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`

## Weather API Flow

- Frontend calls backend routes under `/api/*`.
- Backend calls Frogcast using `FROGCAST_API_TOKEN`.
- There is no separate local weather server; weather is served by backend routes.

Useful route for direct weather checks:

```bash
GET /api/fields/weather?latitude=48.1222&longitude=2.0344
```


## Tech Stack

- **Frontend**: React 18, Vite, Zustand, TailwindCSS
- **Backend**: Express, TypeScript
- **Database**: SQLite with Prisma ORM
