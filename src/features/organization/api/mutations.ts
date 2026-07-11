import { postToApi, putToApi, deleteFromApi } from "@/lib/api";
import { API_ROUTES } from "@/config/api-routes";
import { useTenantMutation } from "@/lib/tenant-query";
import { ORGANIZATION_LEVELS } from "../types/organization-tree";
import { OrganizationResponse, organizationResponseSchema } from "../schemas/responses";
import {
  assignMemberRequestSchema,
  createOrganizationRequestSchema,
  updateOrganizationRequestSchema,
  type UpdateOrganizationRequest,
  type CreateOrganizationRequest,
} from "../schemas/requests";
import {
  assignMemberInputSchema,
  type AssignMemberInput,
} from "../schemas/member-input.schema";
import {
  createInviteRequestSchema,
  invitationSchema,
  type CreateInviteRequest,
  type Invitation,
} from "../schemas/invite.schema";
import {
  inviteMemberInputSchema,
  type InviteMemberInput,
} from "../schemas/invite-input.schema";

export function useCreateOrganization() {
  return useTenantMutation({
    mutationFn: async (data : CreateOrganizationRequest) => {
      const body = createOrganizationRequestSchema.parse(data);

      return postToApi<OrganizationResponse, CreateOrganizationRequest>(
        API_ROUTES.ADMIN.ORGANIZATION.ORGANIZATIONS.CREATE,
        body,
        organizationResponseSchema,
      );
    },
  });
}

export function useUpdateOrganization() {
  return useTenantMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateOrganizationRequest }) => {
      const body = updateOrganizationRequestSchema.parse(data);

      return putToApi<OrganizationResponse, UpdateOrganizationRequest>(
        API_ROUTES.ADMIN.ORGANIZATION.ORGANIZATIONS.update(id),
        body,
        organizationResponseSchema,
      );
    },
  });
}

export function useDeleteOrganization() {
  return useTenantMutation({
    mutationFn: async (id: number) =>
      deleteFromApi(API_ROUTES.ADMIN.ORGANIZATION.ORGANIZATIONS.delete(id)),
  });
}

export function useAssignUserToLevel() {
  return useTenantMutation({
    mutationFn: async (input: AssignMemberInput) => {
      const parsed = assignMemberInputSchema.parse(input);
      const body = assignMemberRequestSchema.parse({
        userId: parsed.userId || undefined,
        mobile: parsed.mobile || undefined,
        roleId: parsed.roleId,
        position: parsed.position || undefined,
        organizationId: parsed.levelId,
      });

      return postToApi(
        API_ROUTES.ADMIN.ORGANIZATION.MEMBERS.ASSIGN,
        body,
      );
    },
  });
}

export function useInviteMember() {
  return useTenantMutation({
    mutationFn: async (input: InviteMemberInput) => {
      const parsed = inviteMemberInputSchema.parse(input);
      const organizationId = Number(parsed.organizationId);
      const body = createInviteRequestSchema.parse({
        mobile: parsed.mobile,
        role_id: Number(parsed.roleId),
        position_id: parsed.positionId ? Number(parsed.positionId) : undefined,
      } satisfies CreateInviteRequest);

      return postToApi<Invitation, CreateInviteRequest>(
        API_ROUTES.ADMIN.ORGANIZATION.INVITES.create(organizationId),
        body,
        invitationSchema,
      );
    },
  });
}

export function useCancelInvite() {
  return useTenantMutation({
    mutationFn: async (invitationId: number) =>
      deleteFromApi(API_ROUTES.ADMIN.ORGANIZATION.INVITES.cancel(invitationId)),
  });
}

export function useResendInvite() {
  return useTenantMutation({
    mutationFn: async (invitationId: number) =>
      postToApi<Invitation, null>(
        API_ROUTES.ADMIN.ORGANIZATION.INVITES.resend(invitationId),
        null,
        invitationSchema,
      ),
  });
}
