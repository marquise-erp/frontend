"use client"

import { Plus, X } from "lucide-react"

import { useTranslations } from "next-intl"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import { SectionTitle } from "./property-controls"
import { useFormBuilderStore } from "../../stores/form-builder-store"
import { FormElement } from "../../types/element"

export function OptionsEditor({ el }: { el: FormElement }) {
  const t = useTranslations("form_builder.properties")
  const updateProps = useFormBuilderStore((s) => s.updateProps)
  const options = el.props.options ?? []

  const update = (id: string, label: string) => {
    updateProps(el.id, {
      options: options.map((o) =>
        o.id === id
          ? { ...o, label, value: label.toLowerCase().replace(/\s+/g, "-") }
          : o
      ),
    })
  }

  const remove = (id: string) => {
    updateProps(el.id, { options: options.filter((o) => o.id !== id) })
  }

  const add = () => {
    updateProps(el.id, {
      options: [
        ...options,
        {
          id: crypto.randomUUID(),
          label: `${t("fields.option")} ${options.length + 1}`,
          value: `option-${options.length + 1}`,
        },
      ],
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <SectionTitle>{t("fields.options")}</SectionTitle>
      <div className="flex flex-col gap-2">
        {options.map((opt, i) => (
          <div key={opt.id} className="flex items-center gap-2">
            <span className="w-4 shrink-0 text-center text-xs text-muted-foreground">
              {i + 1}
            </span>
            <Input
              value={opt.label}
              onChange={(e) => update(opt.id, e.target.value)}
              className="h-8"
            />
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Remove option"
              onClick={() => remove(opt.id)}
              disabled={options.length <= 1}
            >
              <X className="size-4" />
            </Button>
          </div>
        ))}
      </div>
      <Button variant="outline" size="sm" onClick={add} className="w-full">
        <Plus className="size-4" data-icon="inline-start" />
        {t("fields.addOption")}
      </Button>
    </div>
  )
}
