import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchFromApi, postToApi, putToApi, deleteFromApi } from "@/lib/api";
import { API_ROUTES } from "@/config/api-routes";
import {
  organizationListSchema,
  organizationNodeSchema,
  type OrganizationTreeNode,
  type OrganizationType,
} from "../schemas/organization-entities";
import { ORGANIZATION_LEVELS } from "../config/organization-levels";
import { buildOrgForest } from "../lib/build-org-tree";

export const organizationKeys = {
  all: ["organizations"] as const,
  list: () => [...organizationKeys.all, "list"] as const,
};

function orgUrl(template: string, id: number | string) {
  return template.replace("{id}", String(id));
}

export type CreateOrganizationInput = {
  parentId: string;
  parentType: OrganizationType;
  name: string;
  code?: string;
};

export type UpdateOrganizationInput = {
  id: string;
  name: string;
  code?: string;
};

/**
 * Fetches the organization structure and returns it as a ready-to-render forest.
 */
export function useOrganizations() {
  return useQuery({
    queryKey: organizationKeys.list(),
    queryFn: () =>
      fetchFromApi(
        API_ROUTES.ADMIN.ORGANIZATION.ORGANIZATIONS.LIST,
        organizationListSchema,
      ),
    select: buildOrgForest,
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ parentId, parentType, name, code }: CreateOrganizationInput) => {
      const type = ORGANIZATION_LEVELS[parentType].child;
      if (!type) throw new Error("Cannot add a child to this organization level.");

      return postToApi(
        API_ROUTES.ADMIN.ORGANIZATION.ORGANIZATIONS.CREATE,
        {
          parent_id: Number(parentId),
          name,
          type,
          code: code ?? null,
        },
        organizationNodeSchema,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.all });
    },
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name, code }: UpdateOrganizationInput) =>
      putToApi(
        orgUrl(API_ROUTES.ADMIN.ORGANIZATION.ORGANIZATIONS.UPDATE, id),
        { name, code: code ?? null },
        organizationNodeSchema,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.all });
    },
  });
}

export function useDeleteOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) =>
      deleteFromApi(orgUrl(API_ROUTES.ADMIN.ORGANIZATION.ORGANIZATIONS.DELETE, id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.all });
    },
  });
}

export type { OrganizationTreeNode };
