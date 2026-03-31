# Getting Started

This guide will help you set up the development environment for ICC Neo (Interactive CYOA Creator Neo).

## Prerequisites

| Tool     | Version  | Notes                              |
| -------- | -------- | ---------------------------------- |
| Node.js  | 24+      | Required, see `.node-version`      |
| Corepack | Built-in | Included with Node.js 16.10+       |
| Yarn     | 4.9.2    | Managed automatically via Corepack |

### Installing Node.js

Use a version manager for easier switching between projects:

```bash
# Using fnm
fnm install 24
fnm use 24

# Using nvm
nvm install 24
nvm use 24

# Using volta
volta install node@24
```

### Enabling Corepack

Corepack manages package manager versions automatically:

```bash
corepack enable
```

This ensures Yarn 4.9.2 is used (as specified in `package.json`).

## Installation

```bash
# Clone the repository
git clone https://github.com/ltouroumov/cyoa-editor.git
cd cyoa-editor

# Install dependencies
yarn install
```

> [!NOTE]
> The `.yarn/releases/yarn-4.9.2.cjs` file is intentionally committed. This is Yarn's "zero-install" pattern ensuring all contributors use the exact same version.

## Running the Development Server

```bash
yarn dev
```

The server starts at `http://localhost:3000` by default.

### Custom Host and Port

If you need to change the host or port (e.g., `localhost` doesn't resolve correctly, or port 3000 is in use):

```bash
# Use environment variables
NUXT_HOST=127.0.0.1 NUXT_PORT=3001 yarn dev

# Or export them
export NUXT_HOST=127.0.0.1
export NUXT_PORT=3001
yarn dev
```

| Variable    | Default     | Description         |
| ----------- | ----------- | ------------------- |
| `NUXT_HOST` | `localhost` | Server bind address |
| `NUXT_PORT` | `3000`      | Server port         |

## Available Scripts

| Command         | Description                              |
| --------------- | ---------------------------------------- |
| `yarn dev`      | Start development server with hot reload |
| `yarn build`    | Build for production                     |
| `yarn generate` | Generate static site                     |
| `yarn preview`  | Preview production build locally         |
| `yarn lint`     | Run ESLint on all source files           |

## Project Structure

```bash
cyoa-editor/
├── app/                    # Application source code
│   ├── components/         # Vue components (viewer/, editor/, utils/)
│   ├── composables/        # Business logic and state
│   ├── pages/              # Route pages (index, editor)
│   ├── assets/             # CSS and static assets
│   └── plugins/            # Nuxt plugins
├── public/                 # Static files served as-is
│   └── config/viewer/      # Viewer configuration files
├── docs/                   # Documentation
├── .yarn/                  # Yarn Berry configuration
└── nuxt.config.ts          # Nuxt configuration
```

## Next Steps

- [Viewer Guide](viewer-guide.md) — Configure the viewer for your projects
- [Architecture](architecture.md) — Understand the codebase structure
