"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { ChevronDown, PanelLeftClose, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"

import { ToolboxItem } from "./toolbox-item"
import { CATEGORY_ORDER, TOOLBOX_ITEMS } from "../../config/toolbox-items"

export function Toolbox({ onClose }: { onClose?: () => void }) {
  const t = useTranslations("form_builder")
  const [query, setQuery] = useState("")
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = TOOLBOX_ITEMS.filter((item) => {
      if (!q) return true
      const label = t(`toolbox.items.${item.type}.label`).toLowerCase()
      const desc = t(`toolbox.items.${item.type}.description`).toLowerCase()
      return label.includes(q) || desc.includes(q)
    })
    return CATEGORY_ORDER.map((category) => ({
      category,
      items: filtered.filter((item) => item.category === category),
    })).filter((group) => group.items.length > 0)
  }, [query, t])

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-card">
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <h2 className="text-base font-semibold text-foreground">{t("toolbox.title")}</h2>
        {onClose ? (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Collapse panel"
          >
            <PanelLeftClose className="size-4" />
          </Button>
        ) : null}
      </div>

      <div className="px-4 pb-3">
        <InputGroup>
          <InputGroupAddon>
            <Search className="size-4" />
          </InputGroupAddon>
          <InputGroupInput
            placeholder={t("toolbox.search")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </InputGroup>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="px-2 pb-6">
          {grouped.map((group) => {
            const isCollapsed = collapsed[group.category]
            return (
              <div key={group.category} className="mb-1">
                <button
                  type="button"
                  onClick={() =>
                    setCollapsed((prev) => ({
                      ...prev,
                      [group.category]: !prev[group.category],
                    }))
                  }
                  className="flex w-full items-center justify-between px-3 py-2 text-xs font-medium tracking-wide text-muted-foreground uppercase transition-colors hover:text-foreground"
                >
                  {t(`toolbox.categories.${group.category}`)}
                  <ChevronDown
                    className={cn(
                      "size-4 transition-transform",
                      isCollapsed && "-rotate-90"
                    )}
                  />
                </button>
                {!isCollapsed ? (
                  <div className="flex flex-col gap-0.5">
                    {group.items.map((item) => (
                      <ToolboxItem key={item.type} item={item} />
                    ))}
                  </div>
                ) : null}
              </div>
            )
          })}

          {grouped.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              {t("toolbox.noElements", { query })}
            </p>
          ) : null}
        </div>
      </ScrollArea>
    </div>
  )
}
