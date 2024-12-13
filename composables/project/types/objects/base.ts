export enum ObjectType {
  page = 'page',
  row = 'row',
  choice = 'choice',
  addon = 'addon',
}

export interface ObjectBase {
  id: string;
  type: ObjectType;
}
