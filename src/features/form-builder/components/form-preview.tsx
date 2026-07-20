"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { useTranslations } from "next-intl"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { FormElement } from "../types/element"
import { Viewports } from "../types/general"
import { useFormBuilderStore } from "../stores/form-builder-store"
import { useViewportStyles } from "../hooks/use-viewport-styles"
import { ViewportSwitcher } from "./viewport-switcher"

// ---------------------------------------------------------------------------
// Viewport width constraints (matches canvas.tsx)
// ---------------------------------------------------------------------------
const VIEWPORT_MAX_WIDTH: Record<Viewports, string> = {
  desktop: "672px",
  tablet:  "768px",
  mobile:  "390px",
}

const VIEWPORT_BADGE: Record<Viewports, string | null> = {
  desktop: null,
  tablet:  "768 px — Tablet",
  mobile:  "390 px — Mobile",
}

// ---------------------------------------------------------------------------
// Width classes for field layout
// ---------------------------------------------------------------------------
const WIDTH_CLASSES: Record<string, string> = {
  full:  "w-full",
  half:  "w-[calc(50%-0.375rem)]",
  third: "w-[calc(33.333%-0.5rem)]",
}

const SIZE_CLASSES: Record<string, string> = {
  sm:      "h-7 text-xs",
  default: "h-9 text-sm",
  lg:      "h-11 text-base",
}

// ---------------------------------------------------------------------------
// Per-element interactive control
// ---------------------------------------------------------------------------
function PreviewControl({
  el,
  value,
  onChange,
}: {
  el: FormElement
  value: string | string[]
  onChange: (v: string | string[]) => void
}) {
  const { props, type } = el
  const sizeClass = SIZE_CLASSES[props.size] ?? SIZE_CLASSES.default

  switch (type) {
    case "text":
    case "email":
    case "number":
    case "url":
      return (
        <Input
          type={type === "number" ? "number" : type === "email" ? "email" : type === "url" ? "url" : "text"}
          placeholder={props.placeholder}
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          className={cn(sizeClass)}
          style={{
            borderRadius: props.radius,
            borderWidth: props.showBorder ? props.borderWidth : 0,
          }}
        />
      )

    case "textarea":
      return (
        <Textarea
          placeholder={props.placeholder}
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-20 text-sm"
          style={{
            borderRadius: props.radius,
            borderWidth: props.showBorder ? props.borderWidth : 0,
          }}
        />
      )

    case "dropdown":
      return (
        <Select value={value as string} onValueChange={(v) => onChange(v)}>
          <SelectTrigger
            className={cn(sizeClass)}
            style={{ borderRadius: props.radius }}
          >
            <SelectValue placeholder={props.placeholder || "Select..."} />
          </SelectTrigger>
          <SelectContent>
            {props.options?.map((opt) => (
              <SelectItem key={opt.id} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )

    case "single-choice":
      return (
        <div className="flex flex-col gap-2.5">
          {props.options?.map((opt) => (
            <label
              key={opt.id}
              className="flex cursor-pointer items-center gap-2.5"
            >
              <span
                className={cn(
                  "flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors",
                  value === opt.value
                    ? "border-[var(--accent)] bg-[var(--accent)]"
                    : "border-input bg-background"
                )}
                style={
                  value === opt.value
                    ? { borderColor: props.accentColor, backgroundColor: props.accentColor }
                    : { borderColor: undefined }
                }
                onClick={() => onChange(opt.value)}
              >
                {value === opt.value && (
                  <span className="size-1.5 rounded-full bg-white" />
                )}
              </span>
              <span className="text-sm text-foreground">{opt.label}</span>
            </label>
          ))}
        </div>
      )

    case "multiple-choice": {
      const selected = Array.isArray(value) ? value : []
      return (
        <div className="flex flex-col gap-2.5">
          {props.options?.map((opt) => {
            const checked = selected.includes(opt.value)
            return (
              <label
                key={opt.id}
                className="flex cursor-pointer items-center gap-2.5"
              >
                <span
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors",
                    checked
                      ? "border-[var(--accent)]"
                      : "border-input bg-background"
                  )}
                  style={
                    checked
                      ? { borderColor: props.accentColor, backgroundColor: props.accentColor }
                      : {}
                  }
                  onClick={() => {
                    const next = checked
                      ? selected.filter((v) => v !== opt.value)
                      : [...selected, opt.value]
                    onChange(next)
                  }}
                >
                  {checked && (
                    <svg viewBox="0 0 10 10" className="size-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="1.5,5 4,8 8.5,2" />
                    </svg>
                  )}
                </span>
                <span className="text-sm text-foreground">{opt.label}</span>
              </label>
            )
          })}
        </div>
      )
    }

    case "checkbox":
      return (
        <div className="flex items-center gap-2.5">
          <Checkbox
            checked={value === "true"}
            onCheckedChange={(v) => onChange(v ? "true" : "false")}
          />
          <span className="text-sm text-foreground">{props.label}</span>
        </div>
      )

    case "date":
      return (
        <Input
          type="date"
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          className={cn(sizeClass)}
          style={{
            borderRadius: props.radius,
            borderWidth: props.showBorder ? props.borderWidth : 0,
          }}
        />
      )

    case "file":
      return (
        <label
          className="flex w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-input py-6 text-muted-foreground transition-colors hover:bg-muted/40"
          style={{ borderRadius: props.radius }}
        >
          <input type="file" className="sr-only" />
          <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M12 3v12m0-12-4 4m4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-xs">Click or drag a file to upload</span>
        </label>
      )

    case "heading":
      return <h3 className="text-xl font-semibold text-foreground">{props.label}</h3>

    case "paragraph":
      return <p className="text-sm leading-relaxed text-muted-foreground">{props.label}</p>

    case "divider":
      return <div className="h-px w-full bg-border" />

    default:
      return null
  }
}

// ---------------------------------------------------------------------------
// One element row — label + control, respecting viewport styles
// ---------------------------------------------------------------------------
const NO_LABEL_TYPES = ["heading", "paragraph", "divider", "checkbox"]

function PreviewElement({
  el,
  value,
  onChange,
}: {
  el: FormElement
  value: string | string[]
  onChange: (v: string | string[]) => void
}) {
  const activeViewport = useFormBuilderStore((s) => s.activeViewport)
  const vpStyles = useViewportStyles(el.props, activeViewport)

  if (el.props.hidden) return null

  const showLabel =
    !NO_LABEL_TYPES.includes(el.type) && vpStyles.labelPosition !== "hidden"
  const horizontal = vpStyles.labelPosition === "left"

  const label = showLabel ? (
    <div
      className={cn(
        "flex items-center gap-1",
        horizontal ? "w-40 shrink-0 pt-2" : "",
        vpStyles.labelAlign === "center" && "justify-center",
        vpStyles.labelAlign === "right" && "justify-end"
      )}
    >
      <span className="text-sm font-medium text-foreground">{el.props.label}</span>
      {el.props.required && (
        <span className="text-destructive" aria-hidden>*</span>
      )}
    </div>
  ) : null

  return (
    <div
      className={cn(
        WIDTH_CLASSES[vpStyles.width],
        "flex gap-2",
        horizontal ? "flex-row" : "flex-col"
      )}
    >
      {label}
      <div className="flex flex-1 flex-col gap-1.5">
        {el.props.description && (
          <p className="text-xs text-muted-foreground">{el.props.description}</p>
        )}
        <PreviewControl el={el} value={value} onChange={onChange} />
        {el.props.helpText && (
          <p className="text-xs text-muted-foreground">{el.props.helpText}</p>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main FormPreview component
// ---------------------------------------------------------------------------
export function FormPreview() {
  const t = useTranslations("form_builder")
  const elements = useFormBuilderStore((s) => s.elements)
  const formTitle = useFormBuilderStore((s) => s.formTitle)
  const formDescription = useFormBuilderStore((s) => s.formDescription)
  const activeViewport = useFormBuilderStore((s) => s.activeViewport)
  const setMode = useFormBuilderStore((s) => s.setMode)

  // Local form state — keyed by element id
  const [values, setValues] = useState<Record<string, string | string[]>>(() =>
    Object.fromEntries(elements.map((el) => [el.id, el.props.defaultValue ?? ""]))
  )

  const badge = VIEWPORT_BADGE[activeViewport]

  function handleChange(id: string, val: string | string[]) {
    setValues((prev) => ({ ...prev, [id]: val }))
  }

  return (
    <div
      className="relative flex h-full w-full flex-col overflow-auto bg-muted/40"
      style={{
        backgroundImage: "radial-gradient(var(--color-border) 1.2px, transparent 1.2px)",
        backgroundSize: "18px 18px",
      }}
    >
      {/* Toolbar */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/80 px-4 py-2 backdrop-blur-sm">
        <span className="text-xs font-medium text-muted-foreground">
          {t("preview.label")}
        </span>

        <ViewportSwitcher />

        <Button
          variant="outline"
          size="sm"
          onClick={() => setMode("editor")}
          className="gap-1.5 text-xs"
        >
          <X className="size-3.5" />
          {t("preview.exit")}
        </Button>
      </div>

      {/* Form card */}
      <div className="flex flex-1 justify-center px-6 py-8">
        <div
          className="w-full transition-[max-width] duration-300 ease-in-out"
          style={{ maxWidth: VIEWPORT_MAX_WIDTH[activeViewport] }}
        >
          <div className="rounded-2xl border border-border bg-background/80 p-6 shadow-sm backdrop-blur-sm">
            {/* Header */}
            <div className="mb-6 border-b border-border pb-5">
              <h1 className="text-2xl font-semibold text-balance text-foreground">
                {formTitle}
              </h1>
              <p className="mt-1 text-sm text-pretty text-muted-foreground">
                {formDescription}
              </p>
            </div>

            {elements.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                {t("preview.empty")}
              </p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {elements.map((el) => (
                  <PreviewElement
                    key={el.id}
                    el={el}
                    value={values[el.id] ?? ""}
                    onChange={(v) => handleChange(el.id, v)}
                  />
                ))}
              </div>
            )}

            {/* Submit button */}
            {elements.length > 0 && (
              <div className="mt-6 flex justify-end border-t border-border pt-4">
                <Button
                  type="button"
                  onClick={() => {
                    // reset state to simulate a fresh submission
                    setValues(
                      Object.fromEntries(
                        elements.map((el) => [el.id, el.props.defaultValue ?? ""])
                      )
                    )
                  }}
                >
                  {t("preview.submit")}
                </Button>
              </div>
            )}
          </div>

          {badge && (
            <p className="mt-2 text-center text-xs text-muted-foreground">{badge}</p>
          )}
        </div>
      </div>
    </div>
  )
}
