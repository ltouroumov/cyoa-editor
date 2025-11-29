# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interactive CYOA Creator NG is a Nuxt.js application for creating and viewing interactive Choose Your Own Adventure (CYOA) projects.

**Current Development Focus**: The **viewer** is the primary focus of development. It is designed to be compatible with the MeanDelay iCYOA viewer and uses the **V1 file format**.

The app has two main modes:
- **Viewer** (main focus): Browse and interact with CYOA projects, make choices, manage builds. Uses **V1 format** for compatibility with MeanDelay iCYOA.
- **Editor** (early prototype): Create and edit CYOA projects with a visual editor. Uses **V2 format** (not yet finalized). This is an early-stage prototype intended to eventually replace the iCYOA editor with an improved and more performant version.

## Development Commands

```bash
# Install dependencies (requires Node.js 24+)
yarn install

# Run development server
yarn dev

# Build for production
yarn build

# Preview production build
yarn preview

# Lint code
yarn lint
```

## Architecture

### Application Structure

The codebase follows Nuxt.js conventions with all application code in the `app/` directory:

- **`app/pages/`**: Two main routes
  - `index.vue`: Viewer mode (default, SSR disabled)
  - `editor.vue`: Editor mode for creating/editing projects

- **`app/components/`**: Organized by feature
  - `viewer/`: Components for viewing and interacting with CYOA projects
  - `editor/`: Components for editing CYOA projects
  - `utils/`: Shared utility components

- **`app/composables/`**: Core business logic and state management
  - `project/`: Project data model, schemas, and validation
  - `viewer/`: Viewer-specific logic (backpack, points, search)
  - `editor/`: Editor-specific logic
  - `store/`: Pinia stores (project, viewer, settings)
  - `shared/`: Database tables and utilities

### Data Model

**IMPORTANT**: The viewer and editor use different data formats:
- **Viewer**: Uses **V1 format** (MeanDelay iCYOA compatible) - see `app/composables/project/types/v1/`
- **Editor**: Uses **V2 format** (not yet finalized) - see `app/composables/project/types/v2/`

#### V2 Data Model (Editor Only)

The V2 project data model is hierarchical: **pages → rows → choices → addons**

Key types defined in `app/composables/project/types/v2/`:

```typescript
interface Project {
  content: ProjectContent;  // objects, children links, scores
  config: ProjectConfig;    // pages config, backpack config
  styles: ProjectStyles;    // style rules and defaults
  media: ProjectMedia;      // images and media assets
}

enum ObjectType {
  page = 'page',
  row = 'row',
  choice = 'choice',
  addon = 'addon',
}
```

In V2, objects are stored in a flat map with parent-child relationships tracked separately:
- `objects`: Map of all objects by ID
- `children`: Map of parent ID to array of child references
- `parents`: Computed reverse index

### State Management

Uses Pinia stores with composable patterns:

- **`useProjectStore()`** (`app/composables/project/useProjectStore.ts`): Main project data store
  - Manages objects, children, scores, config, styles, media
  - Handles parent-child relationships
  - Used by both viewer and editor

- **`useViewerStore()`** (`app/composables/store/viewer.ts`): Viewer UI state
  - Modal visibility (backpack, notes, search, project menu)
  - Project list from `config/viewer/projects.json`

- **`useEditorStore()`** (`app/composables/editor/useEditorStore.ts`): Editor mode state
  - Current editing mode (library/editor)
  - Screen navigation and breadcrumbs

### Data Persistence

Uses Dexie.js (IndexedDB wrapper) for local storage (`app/composables/shared/useDexie.ts`):

```typescript
class AppDb extends Dexie {
  builds!: EntityTable<SavedBuildData, 'id'>;
  projects!: EntityTable<EditorProject, 'id'>;
  projects_versions!: EntityTable<EditorProjectVersion, 'id'>;
}
```

- **Builds**: User-saved builds/choices in viewer mode
- **Projects**: Editor projects and their versions

### Viewer Configuration

Projects are loaded from `public/config/viewer/projects.json`:

```json
{
  "items": [
    {
      "remoteFileUrl": "https://...",
      "title": "Project Title",
      "id": "project-id"
    }
  ],
  "default": "project-id",  // Auto-load this project, or null
  "show_load_file": true,
  "show_project_sidebar": true
}
```

Supports remote project lists via the `remote` field for fetching additional projects.

### Styling System

- **Tailwind CSS v4** with custom configuration
- **PrimeVue** UI components with custom "Gold Morning" preset
- Dynamic styles generated from project style rules (see `app/components/viewer/style/engine.ts`)
- Supports both light and dark themes via `.light-theme` / `.dark-theme` classes
- Custom grid system: extends up to 60 columns for flexible layouts

### Import/Export

**Format Usage**:
- **V1 Format** (see `app/composables/project/schema/v1-format.ts`): Used by the **viewer** for MeanDelay iCYOA compatibility. This is the primary production format.
- **V2 Format** (see `app/composables/project/schema/v2-format.ts`): Used by the **editor** (early prototype). This format is not yet finalized and subject to change.

Import logic handles format detection in `app/composables/project/import.ts`. When working on the viewer, use V1 format exclusively.

## Linting and Code Style

ESLint configuration (`eslint.config.mjs`) enforces:
- TypeScript strict mode
- Vue 3 best practices
- Import ordering: builtin → external → internal → relative
- Automatic unused import removal (`unused-imports` plugin)
- Prettier integration

Unused variable naming: prefix with `_` to ignore warnings.

## Base URL Configuration

Production builds default to `/cyoa-editor/` base URL (configured in `nuxt.config.ts`).

Override with `NUXT_APP_BASE_URL` environment variable for custom deployment paths.
