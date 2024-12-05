import type { BackpackRow } from '~/composables/project/types/backpack';
import type { ProjectImage } from '~/composables/project/types/media';
import type { AnyObject } from '~/composables/project/types/objects';
import type { ProjectScore } from '~/composables/project/types/score';
import type { AnyStyle, StyleTarget } from '~/composables/project/types/styles';

/**
 * CYOA Project
 *
 * Structure:
 * pages -> rows -> choices -> components
 */
export interface Project {
  // Project content
  content: {
    // Project objects (pages, rows, choices, etc.)
    entries: Record<string, AnyObject>;
    // Links between objects (parent -> child relations)
    children: Record<string, string[]>;
    // Project scores
    scores: Record<string, ProjectScore>;
  };

  // Project configuration
  config: {
    // Pages config
    pages: {
      // Which page the CYOA starts on
      main: string;
      // Which pages are display as tabs
      tabs?: string[];
    };
    // Backpack config
    backpack: {
      // Backpack rows
      rows: BackpackRow;
    };
  };

  // Project styling
  styles: {
    // All the project styles rules are stored here and referenced by ID elsewhere
    rules: Record<string, AnyStyle>;
    // Default project styles for every target
    defaults: Record<StyleTarget, string>;
  };

  // Project media files
  media: {
    images: Record<string, ProjectImage>;
  };
}
