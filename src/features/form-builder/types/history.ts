import { FormElement } from "./element";

export type HistorySnapshot = {
    components: FormElement[];
    formTitle: string;
    formDescription: string
    formId: string | null;
    timestamp: number;
  };
  
  export type HistoryState = {
    snapshots: HistorySnapshot[];
    currentIndex: number;
    maxHistorySize: number;
  };