# Portfolio

A local web server app for managing project port allocations — track which projects use which ports, detect process liveness, and avoid port conflicts.

## Features

- **Tree visualization** — projects → services → ports hierarchy
- **CRUD management** — create, edit, delete projects and their services
- **Port conflict detection** — warns when two services claim the same port
- **Process liveness check** — TCP connect check every 10s, with per-service latency measurement (1s interval)
- **Import / Export** — backup and restore your port registry as JSON
- **Auto-backup** — rotating backups (up to 5) on every modification
- **Quick open** — open a project's directory in File Explorer, VS Code, or terminal
- **PWA support** — install as a standalone desktop window
- **Light / Dark / System theme**
- **i18n** — English, Simplified Chinese, Japanese
- **Drag-and-drop** reordering of projects and services
- **Keyboard shortcuts** — `Ctrl+N` new project, `Ctrl+K` focus search, `Esc` close modals

## Tech Stack

| Layer    | Choice                                                  |
| -------- | ------------------------------------------------------- |
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui |
| Backend  | Node.js + Express + TypeScript                          |
| i18n     | react-i18next + i18next                                 |
| Storage  | Local JSON (`~/.portfolio/data.json`)                   |
| Package  | pnpm monorepo                                           |

## Getting Started

### Prerequisites

- Node.js ≥ 18
- pnpm

### Development

```bash
pnpm install
pnpm dev          # Frontend :45321 + Backend :45311
```

Open `http://localhost:45321`.

### Production

```bash
pnpm build
pnpm start        # Serves on :35688
```

Open `http://localhost:35688`, then click the install button in Chrome's address bar to add Portfolio as a PWA standalone window.

## Project Structure

```
Portfolio/
├── packages/
│   ├── shared/          # Type definitions (Project, Service, API types)
│   ├── server/          # Express backend
│   │   └── src/
│   │       ├── routes/      # API route handlers
│   │       ├── services/    # Storage, port checker, backup, open
│   │       └── middleware/  # Validation, error handling
│   └── web/             # React frontend
│       └── src/
│           ├── components/  # UI components (tree, modals, common, layout)
│           ├── hooks/       # Custom hooks (projects, ping, latency, shortcuts)
│           ├── lib/         # API client, theme provider
│           ├── locales/     # i18n translation files (en, zh, ja)
│           └── pages/       # Dashboard
├── .develop/
│   └── Requirements.md      # Full requirements document
└── pnpm-workspace.yaml
```

## API Endpoints

### Projects

| Method   | Path                     | Description                                      |
| -------- | ------------------------ | ------------------------------------------------ |
| `GET`    | `/api/projects`          | List all projects (`?search=` & `?tag=` filters) |
| `POST`   | `/api/projects`          | Create project                                   |
| `GET`    | `/api/projects/:id`      | Get project detail                               |
| `PUT`    | `/api/projects/:id`      | Update project                                   |
| `DELETE` | `/api/projects/:id`      | Delete project (cascading services)              |
| `PUT`    | `/api/projects/reorder`  | Reorder projects (`{ projectIds: string[] }`)    |
| `POST`   | `/api/projects/:id/open` | Open project path in explorer/code/terminal      |

### Services

| Method   | Path                                 | Description      |
| -------- | ------------------------------------ | ---------------- |
| `POST`   | `/api/projects/:id/services`         | Add service      |
| `PUT`    | `/api/projects/:id/services/:sid`    | Update service   |
| `DELETE` | `/api/projects/:id/services/:sid`    | Delete service   |
| `PUT`    | `/api/projects/:id/services/reorder` | Reorder services |

### Check & Ping

| Method | Path                               | Description                     |
| ------ | ---------------------------------- | ------------------------------- |
| `POST` | `/api/check`                       | Check all services' port status |
| `POST` | `/api/check/:projectId`            | Check one project's services    |
| `POST` | `/api/check/:projectId/:serviceId` | Check single service            |
| `POST` | `/api/ping-port`                   | TCP connect latency to a port   |

### Data

| Method | Path          | Description                                               |
| ------ | ------------- | --------------------------------------------------------- |
| `GET`  | `/api/export` | Export all data as JSON                                   |
| `POST` | `/api/import` | Import JSON data (`{ data, mode: "merge" \| "replace" }`) |

### Response Format

```json
// Success
{ "ok": true, "data": { ... } }

// Error
{ "ok": false, "error": { "code": "NOT_FOUND", "message": "Project not found" } }
```

## Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/).

```
<type>: <description>
```

| Type | Usage |
|------|-------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, missing semicolons, etc. |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | Performance improvement |
| `test` | Adding or correcting tests |
| `chore` | Tooling, dependencies, build scripts |
| `ci` | CI/CD configuration |

All commits must be GPG-signed.

## License

[GNU Affero General Public License v3.0](LICENSE)
