"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useAuthMe } from "@/features/auth/api/auth";
import { useAcceptInvite, useInvitePreview } from "../api";
import { isInvitePreviewExpired } from "../schemas/invite-accept.schema";
import { isApiError } from "@/lib/api-error";

interface InviteAcceptViewProps {
  token: string;
}

function invitePath(token: string) {
  return `/invite/${token}`;
}

export function InviteAcceptView({ token }: InviteAcceptViewProps) {
  const t = useTranslations("invite");
  const { data: invite, isLoading, isError, error } = useInvitePreview(token);
  const { data: authData, isLoading: authLoading } = useAuthMe();
  const acceptMutation = useAcceptInvite(token);

  const isAuthenticated = Boolean(authData?.user);
  const inviteNext = invitePath(token);

  if (isLoading || authLoading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (isError || !invite) {
    const message = isApiError(error) ? error.message : t("invalid");
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>{t("invalidTitle")}</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button asChild variant="outline">
            <Link href="/auth/login">{t("goToLogin")}</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isInvitePreviewExpired(invite)) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>{t("expiredTitle")}</CardTitle>
          <CardDescription>{t("expiredDescription")}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const registerHref = `/auth/register?next=${encodeURIComponent(inviteNext)}&token=${encodeURIComponent(token)}`;
  const loginHref = `/auth/login?next=${encodeURIComponent(inviteNext)}`;

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>
          {invite.inviter_name
            ? t("descriptionWithInviter", { name: invite.inviter_name })
            : t("description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{t("organization")}</dt>
            <dd className="font-medium">{invite.organization_name}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{t("role")}</dt>
            <dd className="font-medium">{invite.role_name}</dd>
          </div>
          {invite.position_name ? (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">{t("position")}</dt>
              <dd className="font-medium">{invite.position_name}</dd>
            </div>
          ) : null}
        </dl>

        {isAuthenticated ? (
          <div className="flex flex-col gap-3">
            <p className="text-center text-sm text-muted-foreground">
              {t("authenticatedHint", {
                name: [authData!.user!.first_name, authData!.user!.last_name].filter(Boolean).join(" ") || authData!.user!.name || "کاربر"
              })}
            </p>
            <Button
              className="w-full"
              disabled={acceptMutation.isPending}
              onClick={() => acceptMutation.mutate()}
            >
              {acceptMutation.isPending ? t("approving") : t("approve")}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-center text-sm text-muted-foreground">
              {invite.requires_registration ? t("registerHint") : t("unauthenticatedHint")}
            </p>
            {invite.requires_registration ? (
              <>
                <Button asChild className="w-full">
                  <Link href={registerHref}>{t("register")}</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href={loginHref}>{t("login")}</Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild className="w-full">
                  <Link href={loginHref}>{t("login")}</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href={registerHref}>{t("register")}</Link>
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
