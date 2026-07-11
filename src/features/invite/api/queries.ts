"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchFromApi } from "@/lib/api";
import { API_ROUTES } from "@/config/api-routes";
import { invitePreviewSchema, type InvitePreview } from "../schemas/invite-accept.schema";

export const publicInviteKeys = {
  all: ["public-invite"] as const,
  detail: (token: string) => [...publicInviteKeys.all, token] as const,
};

export function useInvitePreview(token: string) {
  return useQuery({
    queryKey: publicInviteKeys.detail(token),
    queryFn: () =>
      fetchFromApi<InvitePreview>(
        API_ROUTES.ADMIN.INVITES.detail(token),
        invitePreviewSchema,
      ),
    enabled: Boolean(token),
    retry: false,
    refetchOnWindowFocus: false,
  });
}
