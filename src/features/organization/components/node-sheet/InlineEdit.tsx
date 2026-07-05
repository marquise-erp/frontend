"use client";

import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { PencilEdit01Icon } from "@hugeicons/core-free-icons";

interface InlineEditProps {
  value: string;
  onChange: (next: string) => void;
  className?: string;
  inputClassName?: string;
  ariaLabel: string;
  disabled?: boolean;
  placeholder?: string;
}

export function InlineEdit({
  value,
  onChange,
  className,
  inputClassName,
  ariaLabel,
  disabled = false,
  placeholder,
}: InlineEditProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  function commit() {
    const next = draft.trim();
    onChange(next.length ? next : value);
    if (!next.length) setDraft(value);
    setEditing(false);
  }

  if (editing) {
    return (
      <Input
        ref={inputRef}
        autoFocus
        aria-label={ariaLabel}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.nativeEvent.isComposing || e.keyCode === 229) return;
          if (e.key === "Enter") commit();
          if (e.key === "Escape") {
            setDraft(value);
            setEditing(false);
          }
        }}
        disabled={disabled}
        className={cn("h-auto rounded-md px-2 py-0.5", inputClassName)}
      />
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        if (disabled) return;
        setDraft(value);
        setEditing(true);
      }}
      className={cn(
        "group flex items-center gap-1.5 rounded-md text-left hover:bg-secondary/60 disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
    >
      <span className={!value && placeholder ? "text-muted-foreground/60" : ""}>
        {value || placeholder || ""}
      </span>
      <HugeiconsIcon
        icon={PencilEdit01Icon}
        className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
      />
    </button>
  );
}
