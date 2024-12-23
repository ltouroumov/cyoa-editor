import type { BackpackRow } from '~/composables/project/types/v2/backpack';
import type { ProjectImage } from '~/composables/project/types/v2/media';
import type { AnyObject } from '~/composables/project/types/v2/objects';
import type { ProjectScore } from '~/composables/project/types/v2/score';
import type {
  AnyStyle,
  StyleTarget,
} from '~/composables/project/types/v2/styles';

export interface ProjectContent {
  // Index objects (pages, rows, choices, etc.)
  entries: Record<string, AnyObject>;
  // Links between objects (parent -> child relations)
  children: Record<string, string[]>;
  // Index scores
  scores: Record<string, ProjectScore>;
}

export interface ProjectBackpack {
  // Backpack rows
  rows: BackpackRow[];
}

export interface ProjectPages {
  // Which page the CYOA starts on
  main: string;
  // Which pages are display as tabs
  tabs?: string[];
}

export interface ProjectConfig {
  // Pages config
  pages: ProjectPages;
  // Backpack config
  backpack: ProjectBackpack;
}

export interface ProjectStyles {
  // All the project styles rules are stored here and referenced by ID elsewhere
  rules: Record<string, AnyStyle>;
  // Default project styles for every target
  defaults: Record<StyleTarget, string>;
}

export interface ProjectMedia {
  images: Record<string, ProjectImage>;
}

/**
 * CYOA Index
 *
 * Structure:
 * pages -> rows -> choices -> components
 */
export interface Project {
  // Index content
  content: ProjectContent;

  // Index configuration
  config: ProjectConfig;

  // Index styling
  styles: ProjectStyles;

  // Index media files
  media: ProjectMedia;
}
