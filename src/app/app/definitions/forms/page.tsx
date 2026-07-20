"use client"

import { useState } from "react"
import { FormBuilder } from "@/features/form-builder/components/form-builder"
import { FormsListView } from "@/features/form-builder/components/forms-list-view"
import { Form } from "@/features/form-builder/schemas/responses"

type View =
  | { mode: "list" }
  | { mode: "builder"; formId: string | null }

export default function FormsPage() {
  const [view, setView] = useState<View>({ mode: "list" })

  if (view.mode === "builder") {
    return (
      <div className="-m-6">
        <FormBuilder
          formId={view.mode === "builder" ? view.formId : null}
          onBack={() => setView({ mode: "list" })}
        />
      </div>
    )
  }

  function handleEdit(form: Form) {
    setView({ mode: "builder", formId: String(form.id) })
  }

  function handlePreview(form: Form) {
    // Open builder directly in preview mode — FormBuilder handles this via prop
    setView({ mode: "builder", formId: String(form.id) })
  }

  function handleVersions(_form: Form) {
    // Future: open a versions sheet
  }

  function handleNew() {
    setView({ mode: "builder", formId: null })
  }

  return (
    <FormsListView
      onEdit={handleEdit}
      onPreview={handlePreview}
      onVersions={handleVersions}
      onNew={handleNew}
    />
  )
}
