import { create } from "zustand"

import { createDefaultProps, initializeHistory } from "../config/default"
import { ElementProps, ElementType, FormElement, ViewportAppearance } from "../types/element"
import { HistorySnapshot, HistoryState } from "../types/history"
import { Modes, Viewports } from "../types/general"
import { Form } from "../schemas/responses"


interface FormBuilderState {
  elements: FormElement[]
  selectedId: string | null
  formId: string | null
  formTitle: string
  formDescription: string
  activeViewport: Viewports
  activeMode: Modes
  history: HistoryState;


  addElement: (type: ElementType, index?: number, props?: Partial<ElementProps>) => void
  removeElement: (id: string) => void
  duplicateElement: (id: string) => void
  selectElement: (id: string | null) => void
  moveElement: (fromIndex: number, toIndex: number) => void
  updateProps: (id: string, patch: Partial<ElementProps>) => void
  /** Update only viewport-specific appearance fields for the currently active viewport (or an explicit one). */
  updateViewportProps: (id: string, patch: ViewportAppearance, viewport?: Viewports) => void
  setFormMeta: (patch: { title?: string; description?: string }) => void
  setFormId: (id: string | null) => void
  setViewport: (viewport: Viewports) => void
  setMode: (mode: Modes) => void
  /** Hydrate the builder from a server Form response, replacing all current state. */
  loadForm: (form: Form) => void
  clearAll: () => void

  // History methods
  saveSnapshot: () => void;
  undo: () => boolean;
  redo: () => boolean;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clearHistory: () => void;
  jumpToSnapshot: (index: number) => boolean;
}

function makeElement(type: ElementType): FormElement {
  return {
    id: crypto.randomUUID(),
    type,
    props: createDefaultProps(type),
  }
}

function createSnapshot(state: FormBuilderState): HistorySnapshot {
  return {
    components: structuredClone(state.elements),
    formTitle: state.formTitle,
    formDescription: state.formDescription,
    formId: state.formId,
    timestamp: Date.now(),
  };
}

export const useFormBuilderStore = create<FormBuilderState>((set, get) => ({
  elements: [],
  selectedId: null,
  formId: null,
  formTitle: "Untitled form",
  formDescription: "Build your form by dragging elements from the left panel.",
  activeViewport: "desktop",
  activeMode: "editor",
  history: {
    snapshots: [
      {
        components: [],
        formTitle: "Untitled form",
        formDescription: "Build your form by dragging elements from the left panel.",
        formId: null,
        timestamp: Date.now(),
      },
    ],
    currentIndex: 0,
    maxHistorySize: 50,
  },

  addElement: (type, index, overrides) => {
    set((state) => {
      const element = makeElement(type)
      if (overrides) {
        element.props = { ...element.props, ...overrides }
      }
      const elements = [...state.elements]
      if (index === undefined || index < 0 || index > elements.length) {
        elements.push(element)
      } else {
        elements.splice(index, 0, element)
      }
      return { elements, selectedId: element.id }
    })
    get().saveSnapshot()
  },

  removeElement: (id) => {
    set((state) => ({
      elements: state.elements.filter((el) => el.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId,
    }))
    get().saveSnapshot()
  },

  duplicateElement: (id) => {
    set((state) => {
      const index = state.elements.findIndex((el) => el.id === id)
      if (index === -1) return state
      const original = state.elements[index]
      const copy: FormElement = {
        id: crypto.randomUUID(),
        type: original.type,
        props: {
          ...original.props,
          options: original.props.options?.map((o) => ({
            ...o,
            id: crypto.randomUUID(),
          })),
        },
      }
      const elements = [...state.elements]
      elements.splice(index + 1, 0, copy)
      return { elements, selectedId: copy.id }
    })
    get().saveSnapshot()
  },

  selectElement: (id) => set({ selectedId: id }),

  moveElement: (fromIndex, toIndex) => {
    set((state) => {
      const elements = [...state.elements]
      const [moved] = elements.splice(fromIndex, 1)
      elements.splice(toIndex, 0, moved)
      return { elements }
    })
    get().saveSnapshot()
  },

  updateProps: (id, patch) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, props: { ...el.props, ...patch } } : el
      ),
    }))
    get().saveSnapshot()
  },

  updateViewportProps: (id, patch, viewport) => {
    const targetViewport = viewport ?? get().activeViewport
    // Desktop is the baseline — write directly onto ElementProps
    if (targetViewport === "desktop") {
      get().updateProps(id, patch)
      return
    }
    set((state) => ({
      elements: state.elements.map((el) => {
        if (el.id !== id) return el
        return {
          ...el,
          props: {
            ...el.props,
            viewportStyles: {
              ...el.props.viewportStyles,
              [targetViewport]: {
                ...el.props.viewportStyles[targetViewport],
                ...patch,
              },
            },
          },
        }
      }),
    }))
    get().saveSnapshot()
  },

  setFormMeta: (patch) => {
    set((state) => ({
      formTitle: patch.title ?? state.formTitle,
      formDescription: patch.description ?? state.formDescription,
    }))
    get().saveSnapshot()
  },

  setFormId: (id) => set({ formId: id }),

  setViewport: (viewport) => set({ activeViewport: viewport }),

  setMode: (mode) => set({ activeMode: mode }),

  loadForm: (form) => {
    const elements = (form.elements as FormElement[]) ?? []
    const snapshot: HistorySnapshot = {
      components: structuredClone(elements),
      formTitle: form.title,
      formDescription: form.description ?? "",
      formId: String(form.id),
      timestamp: Date.now(),
    }
    set({
      elements,
      formId: String(form.id),
      formTitle: form.title,
      formDescription: form.description ?? "",
      selectedId: null,
      activeMode: "editor",
      history: {
        snapshots: [snapshot],
        currentIndex: 0,
        maxHistorySize: 50,
      },
    })
  },

  clearAll: () => {
    set({ elements: [], selectedId: null })
    get().saveSnapshot()
  },

  saveSnapshot: () => {
    const state = get();
    const snapshot = createSnapshot(state);

    set((state) => {
      const history = state.history;

      const snapshots = history.snapshots.slice(
        0,
        history.currentIndex + 1
      );

      snapshots.push(snapshot);

      if (snapshots.length > history.maxHistorySize) {
        snapshots.shift();
      }

      return {
        history: {
          ...history,
          snapshots,
          currentIndex: snapshots.length - 1,
        },
      };
    });
  },

  undo: () => {
    const state = get();
    const { history } = state;

    if (history.currentIndex <= 0) return false;

    const index = history.currentIndex - 1;
    const snapshot = history.snapshots[index];

    set({
      elements: structuredClone(snapshot.components),
      formTitle: snapshot.formTitle,
      formDescription: snapshot.formDescription,
      formId: snapshot.formId,
      history: {
        ...history,
        currentIndex: index,
      },
    });

    return true;
  },

  redo: () => {
    const state = get();
    const { history } = state;

    if (history.currentIndex >= history.snapshots.length - 1)
      return false;

    const index = history.currentIndex + 1;
    const snapshot = history.snapshots[index];

    set({
      elements: structuredClone(snapshot.components),
      formTitle: snapshot.formTitle,
      formDescription: snapshot.formDescription,
      formId: snapshot.formId,
      history: {
        ...history,
        currentIndex: index,
      },
    });

    return true;
  },

  canUndo: () => get().history.currentIndex > 0,

  canRedo: () => {
    const history = get().history;
    return history.currentIndex < history.snapshots.length - 1;
  },

  clearHistory: () => {
    const state = get();
    set({
      history: {
        snapshots: [createSnapshot(state)],
        currentIndex: 0,
        maxHistorySize: 50,
      },
    })
  },

  jumpToSnapshot: (index) => {
    const state = get();
    const history = state.history;

    if (index < 0 || index >= history.snapshots.length)
      return false;

    const snapshot = history.snapshots[index];

    set({
      elements: structuredClone(snapshot.components),
      formTitle: snapshot.formTitle,
      formDescription: snapshot.formDescription,
      formId: snapshot.formId,
      history: {
        ...history,
        currentIndex: index,
      },
    });

    return true;
  },


}))
