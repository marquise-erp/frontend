"use client"

import { GripVertical } from "lucide-react"
import { useDraggable } from '@dnd-kit/react';
import { useTranslations } from "next-intl"

import { cn } from "@/lib/utils"
import { ToolboxItem as ToolboxItemType } from "../../types/toolbox";
import { ICONS } from "../../config/toolbox-items";
import { useFormBuilderStore } from "../../stores/form-builder-store";
import { ElementProps } from "../../types/element";

export function ToolboxItem({ item }: { item: ToolboxItemType }) {
    const t = useTranslations("form_builder")
    const addElement = useFormBuilderStore((s) => s.addElement)
    const Icon = ICONS[item.icon]

    const draggable = useDraggable({
        id: `toolbox:${item.type}`,
        data: { source: "toolbox", type: item.type },
    });

    const handleAdd = () => {
        const defaultProps: Partial<ElementProps> = {
            label: t.has(`defaultProps.labels.${item.type}`) ? t(`defaultProps.labels.${item.type}`) : undefined,
            placeholder: t.has(`defaultProps.placeholders.${item.type}`) ? t(`defaultProps.placeholders.${item.type}`) : undefined,
        };

        if (['dropdown', 'single-choice', 'multiple-choice'].includes(item.type)) {
            defaultProps.options = [
                { id: crypto.randomUUID(), label: t('defaultProps.options.option1'), value: "option-1" },
                { id: crypto.randomUUID(), label: t('defaultProps.options.option2'), value: "option-2" },
                { id: crypto.randomUUID(), label: t('defaultProps.options.option3'), value: "option-3" },
            ];
        }

        addElement(item.type, undefined, defaultProps);
    };

    return (
        <button
            ref={draggable.ref}
            type="button"
            onClick={handleAdd}
            className={cn(
                "group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-start transition-colors",
                "hover:bg-muted focus-visible:bg-muted focus-visible:outline-none",
                draggable.isDragging && "opacity-40"
            )}
        >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground group-hover:text-foreground">
                {Icon ? <Icon className="size-4" /> : null}
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium text-foreground">
                    {t(`toolbox.items.${item.type}.label`)}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                    {t(`toolbox.items.${item.type}.description`)}
                </span>
            </span>
            <GripVertical className="size-4 shrink-0 text-muted-foreground/50 opacity-0 transition-opacity group-hover:opacity-100" />
        </button>
    )
}
