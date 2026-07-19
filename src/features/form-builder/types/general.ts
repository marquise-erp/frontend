import { ElementType } from "./element";

export type Viewports = 'mobile' | 'tablet' | 'desktop';

export type Modes = 'editor' | 'preview';


export type ActiveDrag =
  | { kind: "toolbox"; type: ElementType }
  | { kind: "canvas"; id: string | number | undefined }
  | null