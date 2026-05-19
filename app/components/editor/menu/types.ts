export type MenuBarItemData = {
  label: string;
  icon?: string;
  command?: () => void;
  menu?: MenuBarItemData[];
};
