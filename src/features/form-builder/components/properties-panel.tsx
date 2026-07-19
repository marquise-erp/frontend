"use client"

import { useTranslations } from "next-intl"
import { Settings2, Trash2, Copy, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ElementType } from "../types/element"
import { useFormBuilderStore } from "../stores/form-builder-store"
import { getToolboxItem, ICONS } from "../config/toolbox-items"
import { InlineRow, PropRow, Segmented } from "./properties/property-controls"
import { OptionsEditor } from "./properties/option-editor"
import { ViewportSwitcher } from "./viewport-switcher"
import { useViewportStyles } from "../hooks/use-viewport-styles"


const CONTENT_TYPES: ElementType[] = ["heading", "paragraph", "divider"]
const OPTION_TYPES: ElementType[] = [
  "dropdown",
  "single-choice",
  "multiple-choice",
]
const PLACEHOLDER_TYPES: ElementType[] = [
  "text",
  "textarea",
  "email",
  "number",
  "url",
  "dropdown",
  "date",
]
const TEXT_LENGTH_TYPES: ElementType[] = ["text", "textarea", "email", "url"]

export function PropertiesPanel() {
  const selectedId = useFormBuilderStore((s) => s.selectedId)
  const element = useFormBuilderStore((s) =>
    s.elements.find((el) => el.id === s.selectedId)
  )
  const updateProps = useFormBuilderStore((s) => s.updateProps)
  const updateViewportProps = useFormBuilderStore((s) => s.updateViewportProps)
  const removeElement = useFormBuilderStore((s) => s.removeElement)
  const duplicateElement = useFormBuilderStore((s) => s.duplicateElement)
  const selectElement = useFormBuilderStore((s) => s.selectElement)
  const activeViewport = useFormBuilderStore((s) => s.activeViewport)
  const t = useTranslations("form_builder.properties")
  const tToolbox = useTranslations("form_builder.toolbox.items")

  const open = Boolean(selectedId && element)

  // Resolved appearance values for the active viewport (falls back to desktop baseline)
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const vpStyles = element ? useViewportStyles(element.props, activeViewport) : null

  return (
    <div
      className={cn(
        "flex h-full shrink-0 flex-col border-r border-border bg-card transition-all duration-200 ease-out",
        open ? "w-[340px]" : "w-0 overflow-hidden border-l-0"
      )}
    >
      {element ? (
        <>
          <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                {(() => {
                  const Icon = ICONS[getToolboxItem(element.type).icon]
                  return Icon ? <Icon className="size-4" /> : null
                })()}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {tToolbox(`${element.type}.label`)}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {t("title")}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Close properties"
              onClick={() => selectElement(null)}
            >
              <X className="size-4" />
            </Button>
          </div>

          <Tabs defaultValue="general" className="min-h-0 flex-1">
            <TabsList variant="line" className="w-full justify-start px-3 pt-2">
              <TabsTrigger value="general">
                <Settings2 className="size-3.5" data-icon="inline-start" />
                {t("tabs.general")}
              </TabsTrigger>
              <TabsTrigger value="appearance">{t("tabs.appearance")}</TabsTrigger>
              <TabsTrigger value="style">{t("tabs.style")}</TabsTrigger>
              <TabsTrigger value="validation">{t("tabs.rules")}</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[calc(100%-2.75rem)]">
              <div className="px-4 py-4">
                {/* GENERAL */}
                <TabsContent value="general" className="flex flex-col gap-4">
                  <PropRow
                    label={
                      CONTENT_TYPES.includes(element.type)
                        ? t("fields.content")
                        : t("fields.label")
                    }
                    htmlFor="prop-label"
                  >
                    {element.type === "paragraph" ? (
                      <Textarea
                        id="prop-label"
                        value={element.props.label}
                        onChange={(e) =>
                          updateProps(element.id, { label: e.target.value })
                        }
                      />
                    ) : element.type === "divider" ? (
                      <p className="text-xs text-muted-foreground">
                        {t("fields.dividerNoContent")}
                      </p>
                    ) : (
                      <Input
                        id="prop-label"
                        value={element.props.label}
                        onChange={(e) =>
                          updateProps(element.id, { label: e.target.value })
                        }
                      />
                    )}
                  </PropRow>

                  {PLACEHOLDER_TYPES.includes(element.type) ? (
                    <PropRow label={t("fields.placeholder")} htmlFor="prop-placeholder">
                      <Input
                        id="prop-placeholder"
                        value={element.props.placeholder ?? ""}
                        onChange={(e) =>
                          updateProps(element.id, {
                            placeholder: e.target.value,
                          })
                        }
                      />
                    </PropRow>
                  ) : null}

                  {!CONTENT_TYPES.includes(element.type) ? (
                    <>
                      <PropRow label={t("fields.description")} htmlFor="prop-desc">
                        <Input
                          id="prop-desc"
                          placeholder={t("fields.descriptionHint")}
                          value={element.props.description ?? ""}
                          onChange={(e) =>
                            updateProps(element.id, {
                              description: e.target.value,
                            })
                          }
                        />
                      </PropRow>
                      <PropRow label={t("fields.helpText")} htmlFor="prop-help">
                        <Input
                          id="prop-help"
                          placeholder={t("fields.helpTextHint")}
                          value={element.props.helpText ?? ""}
                          onChange={(e) =>
                            updateProps(element.id, {
                              helpText: e.target.value,
                            })
                          }
                        />
                      </PropRow>
                    </>
                  ) : null}

                  {OPTION_TYPES.includes(element.type) ? (
                    <>
                      <Separator />
                      <OptionsEditor el={element} />
                    </>
                  ) : null}
                </TabsContent>

                {/* APPEARANCE */}
                <TabsContent
                  value="appearance"
                  className="flex flex-col gap-4"
                >
                  {/* Viewport switcher */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      {t("viewport.label")}
                    </span>
                    <ViewportSwitcher />
                  </div>

                  {activeViewport !== "desktop" && (
                    <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
                      {t("viewport.overrideHint")}
                    </p>
                  )}

                  {!CONTENT_TYPES.includes(element.type) ? (
                    <PropRow label={t("fields.labelPosition")}>
                      <Segmented
                        value={vpStyles!.labelPosition}
                        onChange={(v) =>
                          updateViewportProps(element.id, { labelPosition: v })
                        }
                        options={[
                          { value: "top", label: t("values.position.top") },
                          { value: "left", label: t("values.position.left") },
                          { value: "hidden", label: t("values.position.hidden") },
                        ]}
                      />
                    </PropRow>
                  ) : null}

                  <PropRow label={t("fields.labelAlign")}>
                    <Segmented
                      value={vpStyles!.labelAlign}
                      onChange={(v) =>
                        updateViewportProps(element.id, { labelAlign: v })
                      }
                      options={[
                        { value: "left", label: t("values.align.left") },
                        { value: "center", label: t("values.align.center") },
                        { value: "right", label: t("values.align.right") },
                      ]}
                    />
                  </PropRow>

                  <PropRow label={t("fields.width")}>
                    <Segmented
                      value={vpStyles!.width}
                      onChange={(v) =>
                        updateViewportProps(element.id, { width: v })
                      }
                      options={[
                        { value: "full", label: t("values.width.full") },
                        { value: "half", label: t("values.width.half") },
                        { value: "third", label: t("values.width.third") },
                      ]}
                    />
                  </PropRow>

                  {!CONTENT_TYPES.includes(element.type) ? (
                    <PropRow label={t("fields.size")}>
                      <Segmented
                        value={vpStyles!.size}
                        onChange={(v) =>
                          updateViewportProps(element.id, { size: v })
                        }
                        options={[
                          { value: "sm", label: t("values.size.sm") },
                          { value: "default", label: t("values.size.default") },
                          { value: "lg", label: t("values.size.lg") },
                        ]}
                      />
                    </PropRow>
                  ) : null}

                  <Separator />
                  <InlineRow label={t("fields.hideElement")}>
                    <Switch
                      checked={element.props.hidden}
                      onCheckedChange={(checked) =>
                        updateProps(element.id, { hidden: checked })
                      }
                    />
                  </InlineRow>
                </TabsContent>

                {/* STYLE */}
                <TabsContent value="style" className="flex flex-col gap-4">
                  <PropRow label={`${t("fields.cornerRadius")} — ${element.props.radius}px`}>
                    <Slider
                      value={[element.props.radius]}
                      min={0}
                      max={24}
                      step={1}
                      onValueChange={(v) =>
                        updateProps(element.id, {
                          radius: Array.isArray(v) ? v[0] : v,
                        })
                      }
                    />
                  </PropRow>

                  <InlineRow label={t("fields.showBorder")}>
                    <Switch
                      checked={element.props.showBorder}
                      onCheckedChange={(checked) =>
                        updateProps(element.id, { showBorder: checked })
                      }
                    />
                  </InlineRow>

                  {element.props.showBorder ? (
                    <PropRow
                      label={`${t("fields.borderWidth")} — ${element.props.borderWidth}px`}
                    >
                      <Slider
                        value={[element.props.borderWidth]}
                        min={0}
                        max={4}
                        step={1}
                        onValueChange={(v) =>
                          updateProps(element.id, {
                            borderWidth: Array.isArray(v) ? v[0] : v,
                          })
                        }
                      />
                    </PropRow>
                  ) : null}

                  <PropRow label={t("fields.background")}>
                    <Segmented
                      value={element.props.background}
                      onChange={(v) =>
                        updateProps(element.id, { background: v })
                      }
                      options={[
                        { value: "transparent", label: t("values.background.transparent") },
                        { value: "muted", label: t("values.background.muted") },
                        { value: "card", label: t("values.background.card") },
                      ]}
                    />
                  </PropRow>

                  <PropRow label={t("fields.accentColor")} hint={t("fields.accentColorHint")}>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={element.props.accentColor}
                        onChange={(e) =>
                          updateProps(element.id, {
                            accentColor: e.target.value,
                          })
                        }
                        className="size-9 shrink-0 cursor-pointer rounded-lg border border-border bg-transparent p-1"
                        aria-label={t("fields.accentColor")}
                      />
                      <Input
                        value={element.props.accentColor}
                        onChange={(e) =>
                          updateProps(element.id, {
                            accentColor: e.target.value,
                          })
                        }
                      />
                    </div>
                  </PropRow>
                </TabsContent>

                {/* VALIDATION */}
                <TabsContent
                  value="validation"
                  className="flex flex-col gap-4"
                >
                  {CONTENT_TYPES.includes(element.type) ? (
                    <p className="text-sm text-muted-foreground">
                      {t("fields.noRules")}
                    </p>
                  ) : (
                    <>
                      <InlineRow label={t("fields.required")}>
                        <Switch
                          checked={element.props.required}
                          onCheckedChange={(checked) =>
                            updateProps(element.id, { required: checked })
                          }
                        />
                      </InlineRow>
                      <Separator />

                      {TEXT_LENGTH_TYPES.includes(element.type) ? (
                        <div className="flex gap-3">
                          <PropRow label={t("fields.minLength")} htmlFor="prop-min-len">
                            <Input
                              id="prop-min-len"
                              type="number"
                              value={element.props.minLength ?? ""}
                              onChange={(e) =>
                                updateProps(element.id, {
                                  minLength: e.target.value
                                    ? Number(e.target.value)
                                    : undefined,
                                })
                              }
                            />
                          </PropRow>
                          <PropRow label={t("fields.maxLength")} htmlFor="prop-max-len">
                            <Input
                              id="prop-max-len"
                              type="number"
                              value={element.props.maxLength ?? ""}
                              onChange={(e) =>
                                updateProps(element.id, {
                                  maxLength: e.target.value
                                    ? Number(e.target.value)
                                    : undefined,
                                })
                              }
                            />
                          </PropRow>
                        </div>
                      ) : null}

                      {element.type === "number" ? (
                        <div className="flex gap-3">
                          <PropRow label={t("fields.minValue")} htmlFor="prop-min">
                            <Input
                              id="prop-min"
                              type="number"
                              value={element.props.min ?? ""}
                              onChange={(e) =>
                                updateProps(element.id, {
                                  min: e.target.value
                                    ? Number(e.target.value)
                                    : undefined,
                                })
                              }
                            />
                          </PropRow>
                          <PropRow label={t("fields.maxValue")} htmlFor="prop-max">
                            <Input
                              id="prop-max"
                              type="number"
                              value={element.props.max ?? ""}
                              onChange={(e) =>
                                updateProps(element.id, {
                                  max: e.target.value
                                    ? Number(e.target.value)
                                    : undefined,
                                })
                              }
                            />
                          </PropRow>
                        </div>
                      ) : null}

                      {TEXT_LENGTH_TYPES.includes(element.type) ? (
                        <PropRow
                          label={t("fields.pattern")}
                          htmlFor="prop-pattern"
                          hint={t("fields.patternHint")}
                        >
                          <Input
                            id="prop-pattern"
                            placeholder="^[a-zA-Z]+$"
                            value={element.props.pattern ?? ""}
                            onChange={(e) =>
                              updateProps(element.id, {
                                pattern: e.target.value,
                              })
                            }
                          />
                        </PropRow>
                      ) : null}

                      <PropRow label={t("fields.errorMessage")} htmlFor="prop-error">
                        <Input
                          id="prop-error"
                          placeholder={t("fields.errorMessageDefault")}
                          value={element.props.errorMessage ?? ""}
                          onChange={(e) =>
                            updateProps(element.id, {
                              errorMessage: e.target.value,
                            })
                          }
                        />
                      </PropRow>
                    </>
                  )}
                </TabsContent>
              </div>
            </ScrollArea>
          </Tabs>

          <div className="flex items-center gap-2 border-t border-border p-3">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => duplicateElement(element.id)}
            >
              <Copy className="size-4" data-icon="inline-start" />
              {t("actions.duplicate")}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="flex-1"
              onClick={() => removeElement(element.id)}
            >
              <Trash2 className="size-4" data-icon="inline-start" />
              {t("actions.delete")}
            </Button>
          </div>
        </>
      ) : null}
    </div>
  )
}
