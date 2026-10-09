# CodeAtlas

> **Understand any codebase in minutes.**

A Visual Studio Code extension that automatically analyzes JavaScript/TypeScript projects and renders an interactive developer dashboard — helping you understand architecture, explore folders, trace file relationships, and generate a README — all without leaving VS Code.

---

## Features

| Feature | Description |
|---|---|
| 🔍 **Project Detection** | Automatically detects framework, language, package manager, build tool, and entry point |
| 📊 **Project Dashboard** | Summary cards with key project metrics at a glance |
| 📁 **Folder Explorer** | Interactive collapsible file tree with per-extension color coding |
| 🔗 **File Relationships** | See every file's local imports, npm dependencies, and what references it |
| 📄 **README Generator** | One-click professional README.md with badges, tech stack, folder structure, and more |

---

## Quick Start

1. Open any JavaScript/TypeScript project in VS Code
2. Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
3. Run **`CodeAtlas: Analyze Project`**
4. The interactive dashboard opens instantly

---

## Supported Frameworks

- React / React + Vite
- Next.js
- Vue.js / Nuxt.js
- Angular
- SvelteKit
- Express.js / Fastify / NestJS
- Node.js

---

## Development

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### Setup

```bash
# Install extension host dependencies
npm install

# Install and build the webview UI
npm run build:webview

# Compile the extension TypeScript
npm run compile
```

### Running Locally

1. Open the `codeatlas/` folder in VS Code
2. Press **F5** — this opens an Extension Development Host
3. In the new window, open any JS/TS project
4. Run `CodeAtlas: Analyze Project` from the Command Palette

### Project Structure

```
codeatlas/
├── src/                    # Extension host (TypeScript)
│   ├── extension.ts        # Entry point + WebviewPanel
│   ├── scanner/            # File system scanner
│   ├── detector/           # Framework/language detector
│   ├── analyzer/           # Import relationship analyzer
│   └── generator/          # README generator
├── webview-ui/             # React + Vite + Tailwind dashboard
│   └── src/
│       ├── App.tsx
│       └── components/
│           ├── Dashboard.tsx
│           ├── FolderExplorer.tsx
│           ├── FileRelationships.tsx
│           └── ReadmeGenerator.tsx
└── .vscode/
    ├── launch.json
    └── tasks.json
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Extension Host | TypeScript, VS Code Extension API |
| Webview UI | React 18, Vite, Tailwind CSS |
| Icons | Lucide React |
| Animations | Framer Motion |
| Fonts | Satoshi (UI) + Italianno (branding) + JetBrains Mono (code) |

---

## License

MIT © Arush Vishwakarma
