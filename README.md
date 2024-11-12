# Interactive CYOA Creator NG

## Standalone Usage

1. Download the latest version from https://github.com/ltouroumov/cyoa-editor/releases/
2. Update the `config/viewer/projects.json` file to add your project(s)
3. Upload the directory

### `projects.json` file

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

### `backgrounds.json` file

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