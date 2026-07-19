"use client"

import { MousePointerClick } from "lucide-react"
import { useTranslations } from "next-intl"

import { cn } from "@/lib/utils"
import { useFormBuilderStore } from "../stores/form-builder-store"
import { CanvasElement } from "./canvas-element"
import { ViewportSwitcher } from "./viewport-switcher"
import { useDroppable } from "@dnd-kit/react"
import { Viewports } from "../types/general"

/** Maximum width the form card shrinks to per viewport */
const VIEWPORT_MAX_WIDTH: Record<Viewports, string> = {
  desktop: "672px",  // max-w-2xl equivalent
  tablet:  "768px",
  mobile:  "390px",
}

/** Label shown under the form card when not in desktop mode */
const VIEWPORT_BADGE_LABEL: Record<Viewports, string | null> = {
  desktop: null,
  tablet:  "768 px — Tablet",
  mobile:  "390 px — Mobile",
}

export function Canvas() {
  const t = useTranslations("form_builder")
  const elements = useFormBuilderStore((s) => s.elements)
  const formTitle = useFormBuilderStore((s) => s.formTitle)
  const formDescription = useFormBuilderStore((s) => s.formDescription)
  const selectElement = useFormBuilderStore((s) => s.selectElement)
  const activeViewport = useFormBuilderStore((s) => s.activeViewport)

  const droppable = useDroppable({
    id: "canvas",
  })

  const badge = VIEWPORT_BADGE_LABEL[activeViewport]

  return (
    <div
      className="relative h-full w-full overflow-auto bg-muted/40"
      style={{
        backgroundImage:
          "radial-gradient(var(--color-border) 1.2px, transparent 1.2px)",
        backgroundSize: "18px 18px",
      }}
      onClick={() => selectElement(null)}
    >
      {/* Toolbar */}
      <div
        className="sticky top-0 z-10 flex items-center justify-center border-b border-border bg-background/80 px-4 py-2 backdrop-blur-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <ViewportSwitcher />
      </div>

      <div className="flex justify-center px-6 py-8">
        {/* Form card — width transitions on viewport change */}
        <div
          className="w-full transition-[max-width] duration-300 ease-in-out"
          style={{ maxWidth: VIEWPORT_MAX_WIDTH[activeViewport] }}
        >
          <div
            ref={droppable.ref}
            className={cn(
              "min-h-[70vh] rounded-2xl border bg-background/80 p-6 shadow-sm backdrop-blur-sm transition-colors",
              droppable.isDropTarget ? "border-primary/60 ring-2 ring-primary/20" : "border-border"
            )}
          >
            {/* Form header */}
            <div className="mb-6 border-b border-border pb-5">
              <h1 className="text-2xl font-semibold text-balance text-foreground">
                {formTitle}
              </h1>
              <p className="mt-1 text-sm text-pretty text-muted-foreground">
                {formDescription}
              </p>
            </div>

            {elements.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
                <span className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <MousePointerClick className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {t("canvas.dragElements")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("canvas.hoverHint")}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {elements.map((el, index) => (
                  <CanvasElement key={el.id} el={el} index={index} />
                ))}
              </div>
            )}
          </div>

          {/* Viewport size badge */}
          {badge && (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              {badge}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
