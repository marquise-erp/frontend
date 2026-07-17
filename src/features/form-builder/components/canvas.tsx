"use client"

import { MousePointerClick } from "lucide-react"
import { useTranslations } from "next-intl"

import { cn } from "@/lib/utils"
import { useFormBuilderStore } from "../stores/form-builder-store"
import { CanvasElement } from "./canvas-element"
import { useDroppable } from "@dnd-kit/react"

export function Canvas() {
  const t = useTranslations("form_builder")
  const elements = useFormBuilderStore((s) => s.elements)
  const formTitle = useFormBuilderStore((s) => s.formTitle)
  const formDescription = useFormBuilderStore((s) => s.formDescription)
  const selectElement = useFormBuilderStore((s) => s.selectElement)

  const droppable = useDroppable({
    id: "canvas",
  })

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
      <div className="mx-auto max-w-2xl px-6 py-10">
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
      </div>
    </div>
  )
}
