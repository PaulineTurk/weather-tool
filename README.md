# Field Weather Dashboard

Weather dashboard for field agents to monitor conditions across multiple plots.

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

## Getting Started

### Install dependencies
```bash
pnpm install
```

### Run database migrations
```bash
pnpm db:migrate
```

### Run development servers
```bash
pnpm dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:4000

## Tech Stack

- **Frontend**: React 18, Vite, Zustand, TailwindCSS
- **Backend**: Express, TypeScript
- **Database**: SQLite with Prisma ORM
