import { ElementProps, ElementType } from "../types/element";
import { HistoryState } from "../types/history";

export const DEFAULT_HISTORY_SIZE = 50;

export const initializeHistory = (): HistoryState => ({
    snapshots: [],
    currentIndex: -1,
    maxHistorySize:  DEFAULT_HISTORY_SIZE
  });

  ///v2
  const LABELS: Record<ElementType, string> = {
    text: "Text field",
    textarea: "Message",
    email: "Email address",
    number: "Amount",
    url: "Website",
    dropdown: "Select an option",
    "single-choice": "Choose one",
    "multiple-choice": "Select all that apply",
    checkbox: "I agree to the terms",
    date: "Select a date",
    file: "Upload a file",
    heading: "Section heading",
    paragraph: "Add a short description to guide people filling out this form.",
    divider: "",
  }
  
  const PLACEHOLDERS: Partial<Record<ElementType, string>> = {
    text: "Enter text...",
    textarea: "Type your message...",
    email: "you@example.com",
    number: "0",
    url: "https://example.com",
    dropdown: "Select...",
  }

  function defaultOptions() {
    return [
      { id: crypto.randomUUID(), label: "Option 1", value: "option-1" },
      { id: crypto.randomUUID(), label: "Option 2", value: "option-2" },
      { id: crypto.randomUUID(), label: "Option 3", value: "option-3" },
    ]
  }
  
  const CHOICE_TYPES: ElementType[] = [
    "dropdown",
    "single-choice",
    "multiple-choice",
  ]

  export function createDefaultProps(type: ElementType | undefined): ElementProps {
    const base: ElementProps = {
      label: type ? LABELS[type] : "",
      placeholder: type ? PLACEHOLDERS[type] : "",
      description: "",
      helpText: "",
      defaultValue: "",
      options: type && CHOICE_TYPES.includes(type) ? defaultOptions() : undefined,
  
      width: "full",
      labelPosition: type === "checkbox" ? "left" : "top",
      size: "default",
      labelAlign: "left",
      hidden: false,

      viewportStyles: {
        mobile: {},
        tablet: {},
      },
  
      radius: 10,
      borderWidth: 1,
      accentColor: "#171717",
      showBorder: true,
      background: "transparent",
  
      required: false,
    }
    return base
  }
