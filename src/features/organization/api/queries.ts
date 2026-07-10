import { fetchFromApi } from "@/lib/api";
import { API_ROUTES } from "@/config/api-routes";
import { useTenantQuery } from "@/lib/tenant-query";
import { buildOrgForest } from "../lib/build-org-tree";
import {
  organizationListResponseSchema,
  organizationRefListSchema,
  OrganizationResponse,
  organizationResponseSchema,
} from "../schemas/responses";
import type {  OrganizationListResponse } from "../schemas/responses";
import {
  invitationListSchema,
  type InvitationList,
} from "../schemas/invite.schema";

export const organizationKeys = {
  all: ["organizations"] as const,
  list: () => [...organizationKeys.all, "list"] as const,
  detail: (id: number) => [...organizationKeys.all, "detail", id] as const,
};

export const inviteKeys = {
  all: ["invites"] as const,
  list: (organizationId: number | string) =>
    [...inviteKeys.all, "list", organizationId] as const,
};

export const brandKeys = {
  all: ["brands"] as const,
  list: () => [...brandKeys.all, "list"] as const,
};


export function useOrganizations() {
  return useTenantQuery({
    queryKey: organizationKeys.list(),
    queryFn: () =>
      fetchFromApi<OrganizationListResponse>(
        API_ROUTES.ADMIN.ORGANIZATION.ORGANIZATIONS.LIST,
        organizationListResponseSchema,
      ),
    select: buildOrgForest,
  });
}

export const useOrganization = (id: number, enabled = true) => {
    return useTenantQuery({
        queryKey: organizationKeys.detail(id),
        queryFn: () =>
          fetchFromApi<OrganizationResponse>(
            API_ROUTES.ADMIN.ORGANIZATION.ORGANIZATIONS.detail(id),
            organizationResponseSchema,
          ),
        enabled: enabled && id > 0,
      });
  };

export function useBrands() {
  return useTenantQuery({
    queryKey: brandKeys.list(),
    queryFn: () =>
      fetchFromApi(API_ROUTES.ADMIN.ORGANIZATION.BRANDS, organizationRefListSchema),
  });
}

export function useOrganizationInvites(organizationId: number | string, enabled = true) {
  const id = Number(organizationId);

  return useTenantQuery({
    queryKey: inviteKeys.list(id),
    queryFn: () =>
      fetchFromApi<InvitationList>(
        API_ROUTES.ADMIN.ORGANIZATION.INVITES.list(id),
        invitationListSchema,
      ),
    enabled: enabled && id > 0,
  });
}
