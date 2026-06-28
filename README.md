<p align="center">
  <img src="assets/logo.svg" alt="Portfolio" width="128" />
</p>

<h1 align="center">Portfolio</h1>

<p align="center">A local web server app for managing project port allocations — track which projects use which ports, detect process liveness, and avoid port conflicts.</p>

## Features

- **Tree & Card views** — toggle between detail list and compact card grid layout
- **CRUD management** — create, edit, delete projects and their services
- **Preview panel** — zoomed-out iframe preview per project, toggle with MonitorPlay button
- **Power saving mode** — screenshot service pages via html-to-image, replace live iframe with static image
- **Preview mask** — hover over screenshot shows eye icon with i18n prompt, click to view live iframe
- **5s revert countdown** — mouse-leave timer before iframe switches back to image
- **Hostname proxy** — `pPORT.localhost` transparently proxies to `localhost:PORT`, with WebSocket support
- **Right-click preview** — right-click a service chip to set it as the project's preview
- **Custom tag colors** — pre-define tags with colors; GitHub-style auto-computed background/text
- **Collapsible tag filter** — sidebar with drag-to-reorder tags, tag manager
- **Port conflict detection** — warns when two services claim the same port
- **Process liveness check** — auto check every 10s, per-service TCP latency every 5s
- **Import / Export** — backup and restore your port registry as JSON
- **Auto-backup** — rotating backups (up to 5) on every modification
- **Quick open** — open a project's directory in File Explorer, VS Code, or terminal
- **PWA support** — install as a standalone desktop window
- **Cross-platform** — Windows, macOS, Linux (including WSL)
- **npm package** — `npx portfolio-local` to run instantly, no clone needed
- **Light / Dark / System theme** — theme-aware tag colors, custom scrollbar
- **i18n** — English, Simplified Chinese, Japanese
- **Drag-and-drop** reordering of projects and services
- **Keyboard shortcuts** — `Ctrl+N` new project, `Ctrl+K` focus search, `Esc` close modals
- **Latency cache** — survives view mode switches without data loss

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

### Quick Start (npm)

```bash
npx portfolio-local
```

Open `http://localhost:35688`. To install permanently:

```bash
npm i -g portfolio-local
portfolio
```

Click the install button in Chrome's address bar to add Portfolio as a PWA standalone window.

### Development (from source)

```bash
git clone git@github.com:Crequency/Portfolio.git
cd Portfolio
pnpm install
pnpm dev          # Frontend :45321 + Backend :45311
```

Open `http://localhost:45321`.

### Production Build (from source)

```bash
pnpm build
pnpm start        # Serves on :35688
```

## Platform Support

Portfolio runs on **Windows**, **macOS**, and **Linux** (including WSL). Port status detection uses native system commands per platform (`netstat`, `ss`, `lsof`) with a TCP connect fallback.

## Project Structure

```
Portfolio/
├── assets/
│   └── logo.svg                     # Project logo
├── packages/
│   ├── shared/                      # Type definitions (Project, Service, API types)
│   ├── server/                      # Express backend
│   │   └── src/
│   │       ├── cli.ts               # npm CLI entry point
│   │       ├── index.ts             # App factory + dev server
│   │       ├── routes/              # API route handlers (projects, services, check,
│   │       │                        #   data, ping, proxy)
│   │       ├── services/            # Storage, port checker, backup, open project
│   │       └── middleware/          # Validation, error handling
│   └── web/                         # React frontend
│       └── src/
│           ├── components/          # tree (ServiceCard, ProjectCard, PreviewPanel),
│           │                        #   modals (Create/Edit Project/Service,
│           │                        #   DeleteConfirm, TagManager),
│           │                        #   common (StatusBadge, TagChip, LatencyChip,
│           │                        #   PingIndicator, SettingsDialog),
│           │                        #   sidebar (TagSidebar), layout (TopNav)
│           ├── hooks/               # useProjects, usePing, useServiceLatency,
│           │                        #   useDefinedTags, useKeyboardShortcuts
│           ├── lib/                 # api (typed fetch client), theme (ThemeProvider),
│           │                        #   tagColorUtils (color algorithm), utils (cn)
│           ├── locales/             # i18n translation files (en, zh, ja)
│           └── pages/               # Dashboard
├── .develop/
│   └── Requirements.md              # Full requirements document
└── pnpm-workspace.yaml
```

## API Endpoints

### Projects

| Method   | Path                     | Description                                                      |
| -------- | ------------------------ | ---------------------------------------------------------------- |
| `GET`    | `/api/projects`          | List all projects (`?search=` by name/port, `?tag=` by tag name) |
| `POST`   | `/api/projects`          | Create project                                                   |
| `GET`    | `/api/projects/:id`      | Get project detail                                               |
| `PUT`    | `/api/projects/:id`      | Update project                                                   |
| `DELETE` | `/api/projects/:id`      | Delete project (cascading services)                              |
| `PUT`    | `/api/projects/reorder`  | Reorder projects (`{ projectIds: string[] }`)                    |
| `POST`   | `/api/projects/:id/open` | Open project path in explorer/code/terminal                      |

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

### Info & Health

| Method | Path          | Description              |
| ------ | ------------- | ------------------------ |
| `GET`  | `/api/info`   | Server info (port, etc.) |
| `GET`  | `/api/health` | Health check             |

### Proxy

| Host                        | Description                               |
| --------------------------- | ----------------------------------------- |
| `http://p{PORT}.localhost/` | Transparent proxy to `localhost:{PORT}`   |
| `ws://p{PORT}.localhost/`   | WebSocket proxy (HTTP upgrade → TCP pipe) |

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

| Type       | Usage                                                   |
| ---------- | ------------------------------------------------------- |
| `feat`     | New feature                                             |
| `fix`      | Bug fix                                                 |
| `docs`     | Documentation only                                      |
| `style`    | Formatting, missing semicolons, etc.                    |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf`     | Performance improvement                                 |
| `test`     | Adding or correcting tests                              |
| `chore`    | Tooling, dependencies, build scripts                    |
| `ci`       | CI/CD configuration                                     |

## License

[GNU Affero General Public License v3.0](LICENSE)
