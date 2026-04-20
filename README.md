# Plot Weather Dashboard

Weather dashboard for plot operators to monitor conditions across multiple plots.

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

Create a `.env` file at the project root ([Get your FrogCast Api Key](#api-keys)):

```bash
FROGCAST_API_TOKEN=your_token_here
```

Notes:

- `FROGCAST_API_TOKEN` is required to retrieve weather forecasts.
- Keep the exact `KEY=value` format (no spaces around `=`).
- Restart backend after any `.env` change.

### 3) Generate Prisma client

```bash
pnpm --filter @plot-weather/database run generate
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

### One-liner (All Steps)

For experienced users, here's a single command that runs all setup steps:

```bash
pnpm install --config.confirmModulesPurge=false && echo "FROGCAST_API_TOKEN=your_token_here" > .env && pnpm --filter @plot-weather/database run generate && pnpm db:migrate && pnpm dev
```

> **Note**: Replace `your_token_here` with your actual Frogcast API token, or edit the `.env` file after running.


## Tech Stack

- **Frontend**: React 18, Vite, Zustand, TailwindCSS
- **Backend**: Express, TypeScript
- **Database**: SQLite with Prisma ORM

---

## Architectural Choices

### Monorepo with pnpm Workspaces

The project is organized as a monorepo to keep frontend, backend, and database in a single repository. This simplifies type sharing, dependency management, and coordinated deployments.

### Frontend

| Choice | Rationale |
| --- | --- |
| **React 18** | Industry standard, rich ecosystem, reusable components |
| **Vite** | Modern build tool, instant HMR, minimal configuration |
| **Zustand** | Lightweight state management, simple API, no Redux boilerplate, built-in localStorage persistence |
| **TailwindCSS** | Utility-first, fast responsive design, optimized bundle |
| **React Router** | Simple and proven client-side navigation |

### Backend

| Choice | Rationale |
| --- | --- |
| **Express** | Minimalist, mature, large middleware ecosystem |
| **TypeScript** | Static typing for safety and autocompletion |
| **Zod** | Runtime schema validation for incoming data |

### Database

| Choice | Rationale |
| --- | --- |
| **Prisma** | Typed ORM, built-in migrations, ergonomic CLI, beginner-friendly |
| **SQLite** | Single-file database, zero configuration, ideal for local development |

### Why Prisma over Drizzle or raw SQL?

| Criteria | raw SQL | Drizzle | Prisma |
| --- | --- | --- | --- |
| Easy setup | ✅ | ✅ | ✅✅✅ |
| Typing | ❌ | ✅✅ | ✅✅✅ |
| Beginner-friendly | ✅ | ✅ | ✅✅✅ |
| Built-in migrations | ❌ | ✅ | ✅✅✅ |
| Bundle optimized | ✅✅ | ✅ | ❌ |

Prisma was chosen for its gentle learning curve and integrated migration tools, despite a less optimized bundle.

### Weather Provider

- **Frogcast API**: Free weather API with detailed data (temperature, precipitation, wind)
- **Nominatim**: Free geocoding to convert addresses to GPS coordinates

---

## Current Limitations

### Authentication

- Single static user (no authentication system)
- No registration/login
- No session or JWT management

### Data

- No weather response caching (API called on every request)
- Frogcast rate limiting can be reached quickly
- No offline mode

### Features

- No weather notifications (frost, rain, etc.)
- No interactive map for plot visualization
- No heatmap for overview
- Plot order not customizable (alphabetical only)

### Infrastructure

- SQLite for local use only (not suitable for multi-user production)
- No WebSockets for real-time updates
- No secrets management (`.env` in plain text)

---

## Future Evolutions (Version 2)

### Authentication

- JWT or OAuth for authentication
- Registration/login page
- Multiple user account support
- Default preferences selection on signup (°C/F)
- `DeleteUser` endpoint

### Weather

- Integration of a paid weather API or with higher quotas
- Response caching (1h)
- WebSockets for real-time updates
- Weather notifications (frost, rain, strong winds)

### UI/UX

- Interactive map for plot visualization
- Heatmap for overview of conditions
- Offline mode
- Manual plot reordering with persistence
- Advanced search bar with multiple filters

### Infrastructure

- Migration to PostgreSQL or MySQL for production
- Secrets management (Vault, AWS Secrets Manager, etc.)
- Dockerization for deployment
- CI/CD pipeline

### Code Quality

- Shared types between frontend and backend
- Better error handling and logging
- End-to-end integration tests

### Open Questions

- **Which weather API to integrate?** Need to identify the right provider for production use
- **What does the API require?** Determine exact data needed to fetch weather info (coordinates, plot ID, etc.)
- **What weather info is actually useful to users?** Need to clarify which metrics are needed:
  - Temperature (current, min, max)
  - Precipitation (probability, accumulation)
  - Wind speed and direction
  - Humidity
  - UV index
  - Frost risk alerts
  - Soil temperature?
  - Evapotranspiration?

> **Note**: For this proof of concept, it was decided to integrate a simple weather API (Frogcast) with basic weather data (temperature, precipitation, wind). This allows validating the core functionality before investing in a more complex integration.

---

## API Keys

To use this project, you must create a free account on [Frogcast](https://api.frogcast.com/) and retrieve your API token. Then add it to your local `.env` file at the project root as described in the [Quick Start](#2-configure-environment-variables) section.

> **Note**: Each user should create their own Frogcast account. The API is rate-limited and quickly returns 429 errors when a single account is shared among multiple users.
