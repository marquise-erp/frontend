"use client"

import { useRef, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import {
  Plus,
  Workflow,
  BarChart3,
  Settings,
  Undo,
  Redo,
  History,
  Eye,
  EyeOff,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Toolbox } from "./toolbox/toolbox"
import { useFormBuilderStore } from "../stores/form-builder-store"

const RAIL_ICONS = [
  { icon: Workflow, labelKey: "structure" },
  { icon: BarChart3, labelKey: "responses" },
] as const

export function ToolboxSidebar() {
  const t = useTranslations("form_builder")
  const locale = useLocale()
  const isRtl = locale === "fa"

  const [open, setOpen] = useState(false)
  const [pinned, setPinned] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const history = useFormBuilderStore((s) => s.history)
  const undo = useFormBuilderStore((s) => s.undo)
  const redo = useFormBuilderStore((s) => s.redo)
  const jumpToSnapshot = useFormBuilderStore((s) => s.jumpToSnapshot)
  const activeMode = useFormBuilderStore((s) => s.activeMode)
  const setMode = useFormBuilderStore((s) => s.setMode)

  const isPreviewing = activeMode === "preview"

  const canUndo = history.currentIndex > 0;
  const canRedo = history.currentIndex < history.snapshots.length - 1;

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

          {/* Preview toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label={t(isPreviewing ? "sidebar.exitPreview" : "sidebar.preview")}
                aria-pressed={isPreviewing}
                onClick={() => setMode(isPreviewing ? "editor" : "preview")}
                className={cn(
                  "flex size-10 items-center justify-center rounded-xl border transition-colors",
                  isPreviewing
                    ? "border-border bg-muted text-foreground"
                    : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {isPreviewing ? (
                  <EyeOff className="size-5" />
                ) : (
                  <Eye className="size-5" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side={tooltipSide}>
              {t(isPreviewing ? "sidebar.exitPreview" : "sidebar.preview")}
            </TooltipContent>
          </Tooltip>

          <div className="my-1 h-px w-8 bg-border" />

          <HoverCard>
            <HoverCardTrigger asChild>
              <button
                type="button"
                aria-label="History"
                className="flex size-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <History className="size-5" />
              </button>
            </HoverCardTrigger>
            <HoverCardContent side={tooltipSide} className="w-64 p-2 mr-4">
              <div className="flex flex-col space-y-1 max-h-60 overflow-y-auto">
                <span className="text-xs font-medium text-muted-foreground mb-2 px-2">History</span>
                {[...history.snapshots].reverse().map((snapshot, reversedIndex) => {
                  const index = history.snapshots.length - 1 - reversedIndex
                  const date = new Date(snapshot.timestamp)
                  const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                  const isCurrent = index === history.currentIndex
                  
                  return (
                    <button
                      key={snapshot.timestamp + "-" + index}
                      onClick={() => jumpToSnapshot(index)}
                      className={cn(
                        "flex flex-col items-start rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted text-left",
                        isCurrent && "bg-muted text-primary font-medium"
                      )}
                    >
                      <span>{snapshot.components.length} elements</span>
                      <span className="text-xs text-muted-foreground">{timeString}</span>
                    </button>
                  )
                })}
              </div>
            </HoverCardContent>
          </HoverCard>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={undo}
                disabled={!canUndo}
                aria-label="Undo"
                className="flex size-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
              >
                <Undo className="size-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side={tooltipSide}>Undo</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={redo}
                disabled={!canRedo}
                aria-label="Redo"
                className="flex size-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
              >
                <Redo className="size-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side={tooltipSide}>Redo</TooltipContent>
          </Tooltip>
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
