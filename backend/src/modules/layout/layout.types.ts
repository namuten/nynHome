export interface LayoutSection {
  sectionKey: string;
  postIds: number[];
  order: number;
  isVisible: boolean;
}

export type UpdateLayoutDto = LayoutSection[];
