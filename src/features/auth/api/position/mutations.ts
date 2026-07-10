import { deleteFromApi, postToApi, putToApi } from "@/lib/api";
import { API_ROUTES } from "@/config/api-routes";
import { positionSchema } from "../../schemas/position/responses";
import {
  CreatePositionInput,
  UpdatePositionInput,
  createPositionSchema,
  updatePositionSchema,
} from "../../schemas/position/requests";
import { useTenantMutation } from "@/lib/tenant-query";

export function useCreatePosition() {
  return useTenantMutation({
    mutationFn: async (data: CreatePositionInput) => {
      const parsed = createPositionSchema.parse(data);
      return postToApi(API_ROUTES.ADMIN.POSITIONS.CREATE, parsed, positionSchema);
    },
  });
}

export function useUpdatePosition() {
  return useTenantMutation({
    mutationFn: async (data: UpdatePositionInput) => {
      const parsed = updatePositionSchema.parse(data);
      return putToApi(
        API_ROUTES.ADMIN.POSITIONS.update(data.id),
        { ...parsed, id: undefined },
        positionSchema,
      );
    },
  });
}

export function useDeletePosition() {
  return useTenantMutation({
    mutationFn: async (id: number | string) =>
      deleteFromApi(API_ROUTES.ADMIN.POSITIONS.delete(id)),
  });
}
