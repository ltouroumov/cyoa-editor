# Data Formats

ICC Neo works with two data formats. This document describes their structure and usage.

## Format Overview

| Format                    | Used By | Purpose                                |
| ------------------------- | ------- | -------------------------------------- |
| [**V1**](./formats/v1.md) | Viewer  | MeanDelay iCYOA compatibility          |
| [**V2**](./formats/v2.md) | Editor  | Internal editor format (not finalized) |

## Format Detection

On import, the system validates against Yup schemas:

1. Check if valid V1 → load directly in viewer
2. Check if valid V2 → load in editor
3. Invalid → throw `ImportError`

## V1 to V2 Conversion

When opening V1 projects in the editor, they are converted:

- Rows → `ObjectType.row` with `header` component
- Objects → `ObjectType.choice` with nested components
- Addons → `ObjectType.addon`
- Width classes → numeric width values (60-column grid)
- Conditions → simplified term structure
