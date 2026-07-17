"use client"

import { Calendar, ChevronDown, Upload } from "lucide-react"

import { useTranslations } from "next-intl"

import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { FormElement } from "../types/element"

const sizeHeights: Record<string, string> = {
  sm: "h-7 text-xs",
  default: "h-9 text-sm",
  lg: "h-11 text-base",
}

function fieldStyle(el: FormElement): React.CSSProperties {
  const { radius, borderWidth, showBorder, background } = el.props
  return {
    borderRadius: radius,
    borderWidth: showBorder ? borderWidth : 0,
    backgroundColor:
      background === "muted"
        ? "var(--muted)"
        : background === "card"
          ? "var(--card)"
          : "transparent",
  }
}

function Fake({
  el,
  children,
}: {
  el: FormElement
  children?: React.ReactNode
}) {
  return (
    <div
      style={fieldStyle(el)}
      className={cn(
        "flex w-full items-center border border-input px-3 text-muted-foreground",
        sizeHeights[el.props.size]
      )}
    >
      {children}
    </div>
  )
}

export function ElementControl({ el }: { el: FormElement }) {
  const { props, type } = el
  const t = useTranslations("form_builder.canvas.placeholders")

  switch (type) {
    case "text":
    case "email":
    case "number":
    case "url":
      return (
        <Fake el={el}>
          <span className="truncate">{props.placeholder || t("text")}</span>
        </Fake>
      )

    case "textarea":
      return (
        <div
          style={fieldStyle(el)}
          className="min-h-20 w-full border border-input p-3 text-sm text-muted-foreground"
        >
          {props.placeholder || t("textarea")}
        </div>
      )

    case "dropdown":
      return (
        <Fake el={el}>
          <span className="flex-1 truncate">
            {props.placeholder || t("select")}
          </span>
          <ChevronDown className="size-4 shrink-0" />
        </Fake>
      )

    case "date":
      return (
        <Fake el={el}>
          <span className="flex-1 truncate">
            {props.placeholder || t("selectDate")}
          </span>
          <Calendar className="size-4 shrink-0" />
        </Fake>
      )

    case "single-choice":
      return (
        <div className="flex flex-col gap-2.5">
          {props.options?.map((opt) => (
            <div key={opt.id} className="flex items-center gap-2.5">
              <span
                className="size-4 shrink-0 rounded-full border border-input"
                style={{ borderColor: props.accentColor }}
              />
              <span className="text-sm text-foreground">{opt.label}</span>
            </div>
          ))}
        </div>
      )

    case "multiple-choice":
      return (
        <div className="flex flex-col gap-2.5">
          {props.options?.map((opt) => (
            <div key={opt.id} className="flex items-center gap-2.5">
              <span
                className="size-4 shrink-0 rounded-[4px] border border-input"
                style={{ borderColor: props.accentColor }}
              />
              <span className="text-sm text-foreground">{opt.label}</span>
            </div>
          ))}
        </div>
      )

    case "checkbox":
      return (
        <div className="flex items-center gap-2.5">
          <Checkbox className="pointer-events-none" />
          <span className="text-sm text-foreground">{props.label}</span>
        </div>
      )

    case "file":
      return (
        <div
          style={fieldStyle(el)}
          className="flex w-full flex-col items-center justify-center gap-1.5 border border-dashed border-input py-6 text-muted-foreground"
        >
          <Upload className="size-5" />
          <span className="text-xs">{t("upload")}</span>
        </div>
      )

    case "heading":
      return (
        <h3 className="text-xl font-semibold text-foreground">{props.label}</h3>
      )

    case "paragraph":
      return (
        <p className="text-sm leading-relaxed text-muted-foreground">
          {props.label}
        </p>
      )

    case "divider":
      return <div className="h-px w-full bg-border" />

    default:
      return null
  }
}

const NO_LABEL_TYPES = ["heading", "paragraph", "divider", "checkbox"]

export function ElementPreview({ el }: { el: FormElement }) {
  const { props, type } = el
  const showLabel =
    !NO_LABEL_TYPES.includes(type) && props.labelPosition !== "hidden"
  const horizontal = props.labelPosition === "left"

  const label = showLabel ? (
    <div
      className={cn(
        "flex items-center gap-1",
        horizontal ? "w-40 shrink-0 pt-2" : "",
        props.labelAlign === "center" && "justify-center",
        props.labelAlign === "right" && "justify-end"
      )}
    >
      <span className="text-sm font-medium text-foreground">{props.label}</span>
      {props.required ? (
        <span className="text-destructive" aria-hidden>
          *
        </span>
      ) : null}
    </div>
  ) : null

  return (
    <div
      className={cn(
        "flex w-full gap-2",
        horizontal ? "flex-row" : "flex-col"
      )}
    >
      {label}
      <div className="flex flex-1 flex-col gap-1.5">
        {props.description ? (
          <p className="text-xs text-muted-foreground">{props.description}</p>
        ) : null}
        <ElementControl el={el} />
        {props.helpText ? (
          <p className="text-xs text-muted-foreground">{props.helpText}</p>
        ) : null}
      </div>
    </div>
  )
}
