# ICC Neo (Interactive CYOA Creator Neo)

A Nuxt.js web application for creating and viewing interactive Choose Your Own Adventure (CYOA) projects. Designed to be compatible with the MeanDelay iCYOA viewer format.

## Current Focus

The **Viewer** is the primary focus of development. It reads V1 format projects (MeanDelay compatible) and provides an enhanced viewing experience with:

- Project browsing and selection
- Choice tracking and backpack system
- Build saving and loading
- Search functionality
- Responsive design with dark/light themes

The **Editor** is an early-stage prototype intended to eventually replace the original ICC editor.

## Documentation

| Document                                   | Description                         |
| ------------------------------------------ | ----------------------------------- |
| [Getting Started](docs/getting-started.md) | Quick setup guide for developers    |
| [Viewer Guide](docs/viewer-guide.md)       | Viewer configuration and deployment |
| [Architecture](docs/architecture.md)       | Project structure and concepts      |
| [Data Formats](docs/data-formats.md)       | V1 and V2 format specifications     |

## Quick Start

```bash
# Prerequisites: Node.js 24+, Corepack enabled
corepack enable

# Clone and install
git clone https://github.com/ltouroumov/cyoa-editor.git
cd cyoa-editor
yarn install

# Run development server
yarn dev
```

See [Getting Started](getting-started.md) for detailed setup instructions.

## Tech Stack

- **Framework**: Nuxt 4 (SPA mode)
- **Language**: TypeScript (strict mode)
- **UI**: PrimeVue 4, TailwindCSS v4
- **State**: Pinia with persistence
- **Storage**: Dexie (IndexedDB)
- **Package Manager**: Yarn 4 (Berry)

## License

See [LICENSE.txt](../LICENSE.txt) for license information.
