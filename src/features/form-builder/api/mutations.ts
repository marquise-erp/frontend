import { postToApi, putToApi, deleteFromApi } from "@/lib/api"
import { API_ROUTES } from "@/config/api-routes"
import { useTenantMutation } from "@/lib/tenant-query"
import {
  CreateFormInput,
  UpdateFormInput,
  createFormSchema,
  updateFormSchema,
} from "../schemas/requests"
import { formSchema } from "../schemas/responses"

export function useCreateForm() {
  return useTenantMutation({
    mutationFn: async (data: CreateFormInput) => {
      const parsed = createFormSchema.parse(data)
      return postToApi(API_ROUTES.ADMIN.FORMS.CREATE, parsed, formSchema)
    },
  })
}

export function useUpdateForm() {
  return useTenantMutation({
    mutationFn: async (data: UpdateFormInput) => {
      const parsed = updateFormSchema.parse(data)
      return putToApi(
        API_ROUTES.ADMIN.FORMS.update(parsed.id),
        { title: parsed.title, description: parsed.description, elements: parsed.elements },
        formSchema
      )
    },
  })
}

export function useDeleteForm() {
  return useTenantMutation({
    mutationFn: async (id: number | string) =>
      deleteFromApi(API_ROUTES.ADMIN.FORMS.delete(id)),
  })
}
