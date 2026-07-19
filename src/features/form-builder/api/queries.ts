import { fetchFromApi } from "@/lib/api"
import { API_ROUTES } from "@/config/api-routes"
import { useTenantQuery } from "@/lib/tenant-query"
import { formSchema, formListSchema } from "../schemas/responses"

export const formKeys = {
  all: ["forms"] as const,
  list: () => [...formKeys.all, "list"] as const,
  detail: (id: number | string) => [...formKeys.all, "detail", id] as const,
}

export function useForms() {
  return useTenantQuery({
    queryKey: formKeys.list(),
    queryFn: () => fetchFromApi(API_ROUTES.ADMIN.FORMS.LIST, formListSchema),
  })
}

export function useForm(id: number | string | null | undefined) {
  return useTenantQuery({
    queryKey: formKeys.detail(id ?? ""),
    queryFn: () => fetchFromApi(API_ROUTES.ADMIN.FORMS.detail(id!), formSchema),
    enabled: id != null,
  })
}
