"use client"

import { useTranslations } from "next-intl"
import { Plus, AlertCircle, LayoutTemplate } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useForms } from "../api/queries"
import { useDeleteForm } from "../api/mutations"
import { Form } from "../schemas/responses"
import { FormCard } from "./form-card"

interface FormsListViewProps {
  onEdit: (form: Form) => void
  onPreview: (form: Form) => void
  onVersions: (form: Form) => void
  onNew: () => void
}

export function FormsListView({ onEdit, onPreview, onVersions, onNew }: FormsListViewProps) {
  const t = useTranslations("forms_list")
  const { data: forms, isLoading, isError } = useForms()
  const deleteMutation = useDeleteForm()

  function handleDelete(form: Form) {
    if (!window.confirm(t("deleteConfirm", { title: form.title }))) return
    deleteMutation.mutate(form.id)
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{t("title")}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{t("description")}</p>
        </div>
        <Button onClick={onNew} className="gap-2">
          <Plus className="size-4" aria-hidden />
          {t("newForm")}
        </Button>
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3 rounded-xl border border-border p-4">
              <div className="flex items-start gap-3">
                <Skeleton className="size-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-10 rounded-full" />
              </div>
              <Skeleton className="h-8 w-full rounded-md" />
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 py-16 text-center">
          <AlertCircle className="size-10 text-destructive/70" aria-hidden />
          <div>
            <p className="font-medium text-foreground">{t("loadError")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("loadErrorHint")}</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && forms?.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border py-20 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <LayoutTemplate className="size-7" aria-hidden />
          </span>
          <div>
            <p className="font-medium text-foreground">{t("empty")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("emptyHint")}</p>
          </div>
          <Button onClick={onNew} className="gap-2">
            <Plus className="size-4" aria-hidden />
            {t("newForm")}
          </Button>
        </div>
      )}

      {/* Grid */}
      {!isLoading && !isError && forms && forms.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {forms.map((form) => (
            <FormCard
              key={form.id}
              form={form}
              onEdit={onEdit}
              onPreview={onPreview}
              onVersions={onVersions}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
