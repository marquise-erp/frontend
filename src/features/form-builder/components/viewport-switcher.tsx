"use client"

import { Monitor, Tablet, Smartphone } from "lucide-react"
import { useTranslations } from "next-intl"

import { cn } from "@/lib/utils"
import { useFormBuilderStore } from "../stores/form-builder-store"
import { Viewports } from "../types/general"

const VIEWPORT_OPTIONS: { value: Viewports; Icon: React.ElementType }[] = [
  { value: "desktop", Icon: Monitor },
  { value: "tablet", Icon: Tablet },
  { value: "mobile", Icon: Smartphone },
]

interface ViewportSwitcherProps {
  className?: string
}

export function ViewportSwitcher({ className }: ViewportSwitcherProps) {
  const activeViewport = useFormBuilderStore((s) => s.activeViewport)
  const setViewport = useFormBuilderStore((s) => s.setViewport)
  const t = useTranslations("form_builder.properties.viewport")

  return (
    <div
      role="group"
      aria-label={t("label")}
      className={cn(
        "flex items-center rounded-md border border-border bg-muted p-0.5",
        className
      )}
    >
      {VIEWPORT_OPTIONS.map(({ value, Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={activeViewport === value}
          aria-label={t(value)}
          onClick={() => setViewport(value)}
          className={cn(
            "flex h-7 w-8 items-center justify-center rounded transition-colors",
            activeViewport === value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Icon className="size-3.5" aria-hidden />
        </button>
      ))}
    </div>
  )
}
