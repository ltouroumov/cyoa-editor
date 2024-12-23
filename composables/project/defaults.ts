import type {
  Project,
  ProjectConfig,
  ProjectContent,
  ProjectMedia,
  ProjectStyles,
} from '~/composables/project/types/v2';
import { StyleTarget } from '~/composables/project/types/v2/styles';

export const DefaultProjectContent: ProjectContent = {
  entries: {},
  children: {},
  scores: {},
};

export const DefaultProjectConfig: ProjectConfig = {
  pages: {
    main: '@default',
  },
  backpack: {
    rows: [],
  },
};

export const DefaultProjectStyles: ProjectStyles = {
  rules: {},
  defaults: {
    [StyleTarget.page]: '@default.page',
    [StyleTarget.row]: '@default.row',
    [StyleTarget.choice]: '@default.choice',
  },
};

export const DefaultProjectMedia: ProjectMedia = {
  images: {},
};

export const DefaultProject: Project = {
  content: DefaultProjectContent,
  config: DefaultProjectConfig,
  styles: DefaultProjectStyles,
  media: DefaultProjectMedia,
};
