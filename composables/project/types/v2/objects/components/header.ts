export interface BaseHeader {
  title: string;
}

export interface RowHeader extends BaseHeader {
  layout?: string;
  image?: string;
  text?: string;
}

export interface ChoiceHeader extends BaseHeader {
  layout?: string;
  image?: string;
  text?: string;
}

export interface AddonHeader extends BaseHeader {
  layout?: string;
  image?: string;
  text?: string;
}
