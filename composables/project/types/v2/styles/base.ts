export enum StyleType {
  simple = 'simple',
  advanced = 'advanced',
  css = 'css',
}

export enum StyleTarget {
  page = 'page',
  row = 'row',
  choice = 'choice',
}

export interface BaseStyle {
  id: string;
  type: StyleType;
  target: StyleTarget;
  name?: string;
  comment?: string;
}
