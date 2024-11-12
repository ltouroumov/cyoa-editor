# Interactive CYOA Creator NG

## Standalone Usage

1. Download the latest version from https://github.com/ltouroumov/cyoa-editor/releases/
2. Update the `config/viewer/projects.json` file to add your project(s)
3. Upload the **root directory** of your domain

### Configure the viewer

#### `projects.json` file

This file defines the list of projects displayed on the landing page of the viewer and the side menu.
If no value is specified in `default` (set to `null`), no CYOA will be automatically loaded.

```json5
{
  "items": [
    {
      // URL of the project.json file
      "remoteFileUrl": "https://raw.githubusercontent.com/ltouroumov/worm-cyoa-v6-fork/master/extract-v6.0.json",
      // Title displayed in the list
      "title": "Worm V6.0 (Pixel's Version)",
      // Internal identifier, used by the software
      "id": "worm-v6.0-pixel"
    }
    // ...
  ],
  // Default CYOA to display when the page loads
  // Set to `null` to show the list
  "default": "worm-v6-lt"
}
```

#### `backgrounds.json` file

Controls the loading backgrounds.

```json5
{
  // Enable or Disable the loading backgrounds
  "enabled": true,
  // List of images to randomly choose from
  // If there is only one file, it will always be displayed
  "images": [
    {
      // Relative path or URL
      "url": "bgs/load-01.webp"
    }
    // ...
  ]
}
```
### Installation is a sub-folder (advanced)

It is possible to install the viewer in a sub-folder of a domain.

#### Update `index.html`

1) In the file `index.html`
   1) Replace all instances of `/assets/` with `/your-folder/assets/`.
   2) Replace `baseURL:"/"` with `baseURL:"/your-folder/"`

#### Custom Build

The simple way is to build the software with your custom URL with the `NUXT_APP_BASE_URL` environment variable. This requires knowledge of software development and the right environment.
