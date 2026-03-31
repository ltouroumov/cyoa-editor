# Viewer Configuration Guide

This guide explains how to configure and deploy the ICC Neo viewer.

## Overview

The viewer loads configuration from `config/viewer/` in the deployment root (this folder is in `public` directory in repo). Two files control behavior:

- **`projects.json`**: List of available CYOA projects
- **`backgrounds.json`**: Loading screen backgrounds

## projects.json Configuration

Location: `config/viewer/projects.json`

### Complete Example

```json
{
  "items": [
    {
      "file_url": "https://example.com/my-cyoa/project.json",
      "title": "My CYOA Project",
      "id": "my-project",
      "author": "Author Name",
      "description": "A description of the project",
      "thumbnail_url": "https://example.com/thumbnail.png"
    },
    {
      "file_url": "project.json",
      "title": "Local Project",
      "id": "local-project"
    }
  ],
  "default": null,
  "show_load_file": true,
  "show_project_sidebar": true,
  "remote": "https://example.com/more-projects.json",
  "remotes": ["https://another-source.com/projects.json"]
}
```

### Project Entry Fields

| Field           | Type   | Required | Description                      |
| --------------- | ------ | -------- | -------------------------------- |
| `file_url`      | string | `Yes`    | URL or path to project JSON file |
| `title`         | string | `Yes`    | Display name in the menu         |
| `id`            | string | `Yes`    | Unique identifier                |
| `author`        | string | `No`     | Author name                      |
| `description`   | string | `No`     | Project description              |
| `thumbnail_url` | string | `No`     | Thumbnail image URL              |

### Library Settings

| Field                  | Type           | Default | Description                                     |
| ---------------------- | -------------- | ------- | ----------------------------------------------- |
| `default`              | string \| null | `null`  | Project ID to auto-load, or `null` to show menu |
| `show_load_file`       | boolean        | `true`  | Show "Load File" option                         |
| `show_project_sidebar` | boolean        | `true`  | Show sidebar navigation                         |
| `remote`               | string         | —       | URL to fetch additional project list            |
| `remotes`              | string[]       | —       | Array of URLs for multiple project sources      |

### file_url Path Resolution

All project URLs are resolved via `document.baseURI`, which Nuxt sets based on `app.baseURL`:

| `file_url`               | Deployed URL        | Resolves to                          |
| ------------------------ | ------------------- | ------------------------------------ |
| `https://cdn.com/p.json` | `example.com/cyoa/` | `https://cdn.com/p.json`             |
| `project.json`           | `example.com/cyoa/` | `example.com/cyoa/project.json`      |
| `./data/project.json`    | `example.com/cyoa/` | `example.com/cyoa/data/project.json` |
| `/project.json`          | `example.com/cyoa/` | `example.com/project.json`           |

> [!TIP]
> **Best practice:**
>
> - Use **full URLs** for external/remote projects
> - Use **relative paths** (without leading `/`) for bundled projects
> - **Avoid** leading-slash paths like `/project.json` for subfolder deployments

## backgrounds.json Configuration

Location: `config/viewer/backgrounds.json`

```json
{
  "enabled": true,
  "images": [{ "url": "bgs/load-01.webp" }, { "url": "bgs/load-02.webp" }]
}
```

| Field          | Type    | Description                                          |
| -------------- | ------- | ---------------------------------------------------- |
| `enabled`      | boolean | Enable/disable loading backgrounds                   |
| `images[].url` | string  | Relative path (from deployment root) or absolute URL |

## Deployment

### Sample Project Folder Structure

Organize bundled projects in separate folders for clean management:

```bash
your-deployment/
├── config/viewer/
│   ├── projects.json
│   └── backgrounds.json
├── bgs/                    # Loading backgrounds
├── projects/               # Your CYOA projects
│   ├── my-cyoa/
│   │   ├── project.json    # The CYOA data file
│   │   └── images/         # Project images (if local)
│   │       ├── choice1.png
│   │       └── row-header.jpg
│   └── another-cyoa/
│       ├── project.json
│       └── images/
├── assets/                 # Viewer assets (generated)
└── index.html
```

Example `projects.json` for this structure:

```json
{
  "items": [
    {
      "id": "my-cyoa",
      "title": "My CYOA",
      "file_url": "projects/my-cyoa/project.json"
    },
    {
      "id": "another-cyoa",
      "title": "Another CYOA",
      "file_url": "projects/another-cyoa/project.json"
    }
  ],
  "default": null
}
```

### Option 1: Build from Source

For custom base URLs or subfolder deployment:

```bash
git clone https://github.com/ltouroumov/cyoa-editor.git
cd cyoa-editor
yarn install
NUXT_APP_BASE_URL=/your-path/ yarn generate
```

Output is in `.output/public/`.

### Option 2: GitHub Releases

For root domain deployment:

1. Download `release.zip` from [Releases](https://github.com/ltouroumov/cyoa-editor/releases)
2. Extract and configure `config/viewer/projects.json`
3. Upload to your host

---

## Platform Deployment Examples

### Neocities

Neocities hosts at root (e.g., `yoursite.neocities.org/`).

1. Download `release.zip` (built with `/` base URL)
2. Extract locally
3. Add your projects to `projects/` folder
4. Update `config/viewer/projects.json`
5. Upload via Neocities dashboard or CLI

### GitHub Pages

Deploy your viewer at `username.github.io/cyoa-editor/`.

**Steps:**

1. **Fork** the repository on GitHub (keep the name `cyoa-editor`)
2. **Enable GitHub Pages** in your fork:
   - Go to Settings → Pages
   - Source: **GitHub Actions**
3. **Add your projects:**
   - Create `public/projects/your-cyoa/` folder with your `project.json` and images
   - Update `public/config/viewer/projects.json` with your project entries
4. **Push to master** — the workflow runs automatically and deploys

Your viewer will be live at `https://yourusername.github.io/cyoa-editor/`

> [!IMPORTANT]
> The base URL is hardcoded to `/cyoa-editor/`. If you rename the repository, update `.github/workflows/nuxtjs.yml`:
>
> ```yaml
> - name: Generate Static Site
>   run: yarn run generate
>   env:
>     NITRO_PRESET: github_pages
>     NUXT_APP_BASE_URL: /${{ github.event.repository.name }}/
> ```
