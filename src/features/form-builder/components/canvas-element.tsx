"use client"

import { Copy, GripVertical, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { FormElement } from "../types/element"
import { useFormBuilderStore } from "../stores/form-builder-store"
import { useSortable } from '@dnd-kit/react/sortable';
import { getToolboxItem } from "../config/toolbox-items"
import { ElementPreview } from "./element.preview"
import { useViewportStyles } from "../hooks/use-viewport-styles"


const widthClasses: Record<string, string> = {
    full: "w-full",
    half: "w-[calc(50%-0.375rem)]",
    third: "w-[calc(33.333%-0.5rem)]",
}

export function CanvasElement({
    el,
    index,
}: {
    el: FormElement
    index: number
}) {
    const t = useTranslations("form_builder")
    const selectedId = useFormBuilderStore((s) => s.selectedId)
    const selectElement = useFormBuilderStore((s) => s.selectElement)
    const removeElement = useFormBuilderStore((s) => s.removeElement)
    const duplicateElement = useFormBuilderStore((s) => s.duplicateElement)
    const activeViewport = useFormBuilderStore((s) => s.activeViewport)
    const vpStyles = useViewportStyles(el.props, activeViewport)

    const isSelected = selectedId === el.id

    const {
        ref,
        handleRef,
        isDragging,
    } = useSortable({
        id: el.id,
        index,
        data: {
            source: "canvas",
            index,
        },
    })

    return (
        <div
            ref={ref}
            className={cn(widthClasses[vpStyles.width], isDragging && "z-10 opacity-50")}
        >
            <div
                role="button"
                tabIndex={0}
                onClick={(e) => {
                    e.stopPropagation()
                    selectElement(el.id)
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        selectElement(el.id)
                    }
                }}
                className={cn(
                    "group relative rounded-xl p-4 transition-all", //border bg-card
                    isSelected
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border hover:border-primary/40 hover:shadow-sm",
                    el.props.hidden && "opacity-50"
                )}
            >
                {/* Top bar: type label + actions */}
                <div className={cn("absolute left-0 pl-4 mb-2 flex items-center justify-between opacity-0 transition-opacity",
                    "group-hover:opacity-100",
                    isSelected && "opacity-100"
                )}>
                    {/* <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                        {t(`toolbox.items.${el.type}.label`)}
                    </span> */}
                    <div
                        className={cn(
                            "flex items-center gap-0.5 ",
                        )}
                    >
                        <Button
                            variant="ghost"
                            size="icon-xs"
                            aria-label={t("properties.actions.duplicate")}
                            onClick={(e) => {
                                e.stopPropagation()
                                duplicateElement(el.id)
                            }}
                        >
                            <Copy className="size-3.5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon-xs"
                            aria-label={t("properties.actions.delete")}
                            onClick={(e) => {
                                e.stopPropagation()
                                removeElement(el.id)
                            }}
                        >
                            <Trash2 className="size-3.5" />
                        </Button>
                        <button
                            ref={handleRef}
                            type="button"
                            aria-label={t("canvas.dragElements")}
                            className="flex size-6 cursor-grab items-center justify-center rounded-md text-muted-foreground hover:bg-muted active:cursor-grabbing"
                        >
                            <GripVertical className="size-3.5" />
                        </button>
                    </div>
                </div>

                <ElementPreview el={el} />
            </div>
        </div>
    )
}
