"use client"

import { useRef, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import {
  Plus,
  Workflow,
  BarChart3,
  History,
  Settings,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Toolbox } from "./toolbox/toolbox"

const RAIL_ICONS = [
  { icon: Workflow, labelKey: "structure" },
  { icon: BarChart3, labelKey: "responses" },
  { icon: History, labelKey: "activity" },
] as const

export function ToolboxSidebar() {
  const t = useTranslations("form_builder")
  const locale = useLocale()
  const isRtl = locale === "fa"

  const [open, setOpen] = useState(false)
  const [pinned, setPinned] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }

  const scheduleClose = () => {
    if (pinned) return
    cancelClose()
    closeTimer.current = setTimeout(() => setOpen(false), 120)
  }

  const isVisible = open || pinned

  const tooltipSide = isRtl ? "left" : "right"

  return (
    <div className="relative z-30 flex h-full">
      {/* Icon rail */}
      <div className={cn(
        "flex h-full w-16 flex-col items-center gap-1 border-border bg-sidebar py-4",
        isRtl ? "border-l" : "border-r"
      )}>
        <button
          type="button"
          onMouseEnter={() => {
            cancelClose()
            setOpen(true)
          }}
          onMouseLeave={scheduleClose}
          onClick={() => {
            setPinned((p) => {
              const next = !p
              setOpen(next)
              return next
            })
          }}
          aria-label={t("sidebar.addElements")}
          aria-pressed={pinned}
          className={cn(
            "flex size-10 items-center justify-center rounded-xl border transition-colors",
            isVisible
              ? "border-border bg-muted text-foreground"
              : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Plus className="size-5" />
        </button>

        <div className="my-1 h-px w-8 bg-border" />

        <div className="flex flex-col items-center gap-1">
          {RAIL_ICONS.map(({ icon: Icon, labelKey }) => (
            <Tooltip key={labelKey}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label={t(`sidebar.${labelKey}`)}
                  className="flex size-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Icon className="size-5" />
                </button>
              </TooltipTrigger>

              <TooltipContent side={tooltipSide}>
                {t(`sidebar.${labelKey}`)}
              </TooltipContent>
            </Tooltip>

          ))}
        </div>

        <div className="mt-auto">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label={t("sidebar.settings")}
                className="flex size-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Settings className="size-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side={tooltipSide}>{t("sidebar.settings")}</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Flyout toolbox */}
      <div
        onMouseEnter={cancelClose}
        onMouseLeave={scheduleClose}
        className={cn(
          "absolute top-3 bottom-3 w-80 overflow-hidden rounded-2xl border border-border bg-card shadow-xl transition-all duration-200 ease-out",
          isRtl ? "right-[4.5rem]" : "left-[4.5rem]",
          isVisible
            ? "pointer-events-auto translate-x-0 opacity-100"
            : cn(
                "pointer-events-none opacity-0",
                isRtl ? "translate-x-3" : "-translate-x-3"
              )
        )}
      >
        <Toolbox
          onClose={() => {
            setPinned(false)
            setOpen(false)
          }}
        />
      </div>
    </div>
  )
}
