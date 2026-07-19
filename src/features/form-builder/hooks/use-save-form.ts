import { useFormBuilderStore } from "../stores/form-builder-store"
import { useCreateForm, useUpdateForm } from "../api/mutations"
import { buildFormPayload } from "../api/serialise"

/**
 * Unified hook for persisting the current form state.
 *
 * - If `formId` is null → calls POST (create) and stores the returned id in the
 *   Zustand store via `setFormId`.
 * - If `formId` is set  → calls PUT (update).
 *
 * Returns `{ save, isPending }` so the caller does not need to reason about
 * create vs. update logic.
 */
export function useSaveForm() {
  const formId = useFormBuilderStore((s) => s.formId)
  const setFormId = useFormBuilderStore((s) => s.setFormId)
  const createMutation = useCreateForm()
  const updateMutation = useUpdateForm()

  const isPending = createMutation.isPending || updateMutation.isPending

  async function save() {
    const state = useFormBuilderStore.getState()
    const payload = buildFormPayload(state)

    if (!state.formId) {
      const created = await createMutation.mutateAsync(payload)
      setFormId(String(created.id))
      return created
    }

    return updateMutation.mutateAsync({ id: state.formId, ...payload })
  }

  return { save, isPending }
}
