"use client"

import { useState, useEffect } from "react"
import { useLocale, useTranslations } from "next-intl"
import { ArrowLeft, Save, Loader2 } from "lucide-react"

import { ActiveDrag } from "../types/general"
import { DragDropManager, DragDropProvider, DragEndEvent, DragOverlay, DragStartEvent } from "@dnd-kit/react"
import { RestrictToWindow } from "@dnd-kit/dom/modifiers"
import { useFormBuilderStore } from "../stores/form-builder-store"
import { ToolboxSidebar } from "./toolbox-sidebar"
import { getToolboxItem, ICONS } from "../config/toolbox-items"
import { PropertiesPanel } from "./properties-panel"
import { Canvas } from "./canvas"
import { FormPreview } from "./form-preview"
import { useSaveForm } from "../hooks/use-save-form"
import { useForm } from "../api/queries"
import { Button } from "@/components/ui/button"

interface FormBuilderProps {
  /** When provided, the builder loads this form from the server on mount. null = new form. */
  formId?: string | null
  /** Called when the user wants to go back to the list. */
  onBack?: () => void
}

export function FormBuilder({ formId: initialFormId, onBack }: FormBuilderProps = {}) {
    const locale = useLocale()
    const dir = locale === "fa" ? "rtl" : "ltr"
    const t = useTranslations("form_builder")
    const [active, setActive] = useState<ActiveDrag>(null)
    const activeMode = useFormBuilderStore((s) => s.activeMode)
    const loadForm = useFormBuilderStore((s) => s.loadForm)
    const clearAll = useFormBuilderStore((s) => s.clearAll)
    const formTitle = useFormBuilderStore((s) => s.formTitle)
    const { save, isPending: isSaving } = useSaveForm()

    // Load form from server when an id is passed
    const { data: serverForm } = useForm(initialFormId ?? null)

    useEffect(() => {
        if (serverForm) {
            loadForm(serverForm)
        } else if (!initialFormId) {
            // New form — reset to blank slate
            clearAll()
        }
        // Only re-run when the fetched server data changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [serverForm])

    function handleDragStart(
        event: DragStartEvent,
        manager: DragDropManager
    ) {
        const data = event.operation.source?.data

        if (data?.source === "toolbox") {
            setActive({
                kind: "toolbox",
                type: data.type,
            })
            return
        }

        if (data?.source === "canvas") {
            setActive({
                kind: "canvas",
                id: event.operation.source?.id,
            })
        }
    }

    function handleDragEnd(event: DragEndEvent) {
        setActive(null)
        if (event.canceled) {
            return
        }

        const { operation } = event

        if (!operation.target) return

        const store = useFormBuilderStore.getState()
        const elements = store.elements

        const source = operation.source
        const target = operation.target

        if (source?.data?.source === "toolbox") {
            let index = elements.length

            if (target.id !== "canvas") {
                const overIndex = elements.findIndex(
                    (el) => el.id === target.id
                )

                if (overIndex !== -1) index = overIndex
            }

            const type = source.data.type;
            const defaultProps: any = {
                label: t.has(`defaultProps.labels.${type}`) ? t(`defaultProps.labels.${type}`) : undefined,
                placeholder: t.has(`defaultProps.placeholders.${type}`) ? t(`defaultProps.placeholders.${type}`) : undefined,
            };

            if (['dropdown', 'single-choice', 'multiple-choice'].includes(type)) {
                defaultProps.options = [
                    { id: crypto.randomUUID(), label: t('defaultProps.options.option1'), value: "option-1" },
                    { id: crypto.randomUUID(), label: t('defaultProps.options.option2'), value: "option-2" },
                    { id: crypto.randomUUID(), label: t('defaultProps.options.option3'), value: "option-3" },
                ];
            }

            store.addElement(type, index, defaultProps)
            return
        }

        if (
            source?.data?.source === "canvas" &&
            source.id !== target.id
        ) {
            const from = elements.findIndex(
                (el) => el.id === source.id
            )

            const to =
                target.id === "canvas"
                    ? elements.length - 1
                    : elements.findIndex((el) => el.id === target.id)

            if (from !== -1 && to !== -1) {
                store.moveElement(from, to)
            }
        }
    }


    return (

        <DragDropProvider
            modifiers={[RestrictToWindow,]}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div dir={dir} className="flex h-svh flex-col bg-background font-sans">
                {/* Top toolbar: back + title + save */}
                <header className="flex h-12 shrink-0 items-center gap-3 border-b border-border px-4">
                    {onBack && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onBack}
                            className="gap-1.5 text-muted-foreground"
                        >
                            <ArrowLeft className="size-4" aria-hidden />
                            {t("toolbar.back")}
                        </Button>
                    )}
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                        {formTitle}
                    </span>
                    <Button
                        size="sm"
                        onClick={save}
                        disabled={isSaving}
                        className="gap-1.5"
                    >
                        {isSaving ? (
                            <Loader2 className="size-4 animate-spin" aria-hidden />
                        ) : (
                            <Save className="size-4" aria-hidden />
                        )}
                        {isSaving ? t("toolbar.saving") : t("toolbar.save")}
                    </Button>
                </header>

                <div className="flex min-h-0 flex-1">
                    <ToolboxSidebar />
                    {activeMode === "preview" ? (
                        <div className="min-w-0 flex-1">
                            <FormPreview />
                        </div>
                    ) : (
                        <>
                            <div className="min-w-0 flex-1">
                                <Canvas />
                            </div>
                            <PropertiesPanel />
                        </>
                    )}
                </div>
            </div>

            <DragOverlay>
                {source => (
                    <DragPreview active={source.data.source} />
                )}
            </DragOverlay>
        </DragDropProvider>

    )
}

function DragPreview({ active }: { active: NonNullable<ActiveDrag> }) {
    const t = useTranslations("form_builder")
    if (active.kind === "toolbox") {
        const item = getToolboxItem(active.type)
        const Icon = ICONS[item.icon]
        return (
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
                <span className="flex size-7 items-center justify-center rounded-md border border-border text-foreground">
                    {Icon ? <Icon className="size-4" /> : null}
                </span>
                <span className="text-sm font-medium text-foreground">
                    {t(`toolbox.items.${active.type}.label`)}
                </span>
            </div>
        )
    }
    return (
        <div className="rounded-xl border border-primary bg-card px-4 py-3 text-sm font-medium text-foreground shadow-lg">
            {t("canvas.moving")}
        </div>
    )
}

