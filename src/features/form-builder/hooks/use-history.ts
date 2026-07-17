import { useFormBuilderStore } from "../stores/form-builder-store";

export const useHistory = () => {
  const {
    undo,
    redo,
    canUndo,
    canRedo,
    saveSnapshot,
    clearHistory,
    jumpToSnapshot,
    history,
  } = useFormBuilderStore();

  return {
    // Methods
    undo,
    redo,
    saveSnapshot,
    clearHistory,
    jumpToSnapshot,
    
    // State
    canUndo: canUndo(),
    canRedo: canRedo(),
    historyLength: history.snapshots.length,
    currentIndex: history.currentIndex,
    snapshots: history.snapshots,
    
    // Computed properties
    hasHistory: history.snapshots.length > 1,
    isAtBeginning: history.currentIndex === 0,
    isAtEnd: history.currentIndex === history.snapshots.length - 1
  };
};
