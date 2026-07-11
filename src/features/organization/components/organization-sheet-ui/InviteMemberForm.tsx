"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HugeiconsIcon } from "@hugeicons/react";
import { Plus, X } from "@hugeicons/core-free-icons";

import { usePositions } from "@/features/auth/api/position";
import { useInviteMember } from "../../api";
import { API_ERROR_CODES, toApiError } from "@/lib/api-error";
import {
  inviteMemberInputSchema,
  type InviteMemberInput,
} from "../../schemas/invite-input.schema";
import type { Role } from "@/features/auth/schemas/role/responses";
import type { User } from "@/features/auth/schemas/user/responses";

const NONE_POSITION_VALUE = "__none__";

function toRoleId(v: string | number): string {
  return String(v);
}

function toPositionId(v: string | number): string {
  return String(v);
}

interface InviteMemberFormProps {
  organizationId: string;
  users: User[];
  roles: Role[];
  onClose: () => void;
  onSuccess?: () => void;
}

export function InviteMemberForm({
  organizationId,
  users,
  roles,
  onClose,
  onSuccess,
}: InviteMemberFormProps) {
  const t = useTranslations('organization.sheet');
  const [mode, setMode] = useState<"select" | "mobile">("select");
  const inviteMutation = useInviteMember();
  const { data: positions = [] } = usePositions();

  const isMobileMode = mode === "mobile";
  const firstRoleId = roles[0] ? toRoleId(roles[0].id) : "";
  const defaultValues: InviteMemberInput = {
    userId: "",
    mobile: "",
    roleId: firstRoleId,
    positionId: "",
    organizationId,
  };

  const form = useForm({
    defaultValues,
    validators: {
      onChange: ({ value }) => {
        const result = inviteMemberInputSchema.safeParse(value);
        if (result.success) return undefined;
        return result.error.issues;
      },
    },
    onSubmit: async ({ value }) => {
      const mobile = isMobileMode
        ? value.mobile
        : users.find((user) => String(user.id) === value.userId)?.mobile ?? "";

      if (!mobile) {
        toast.error(t('invite.sendFailed'));
        return;
      }

      try {
        await inviteMutation.mutateAsync({
          ...value,
          mobile,
          roleId: toRoleId(value.roleId),
          positionId: value.positionId || "",
        });
        toast.success(t('invite.sendInvite'));
        form.reset();
        onSuccess?.();
        onClose();
      } catch (err) {
        const apiError = toApiError(err);
        if (apiError.is(API_ERROR_CODES.PENDING_INVITATION_EXISTS)) {
          toast.error(t('invite.pendingExists'));
          return;
        }
        toast.error(apiError.message || t('invite.sendFailed'));
      }
    },
  });

  const isSubmitting = inviteMutation.isPending;

  const toggleMode = () => {
    if (isMobileMode) {
      setMode("select");
      form.setFieldValue("mobile", "");
    } else {
      setMode("mobile");
      form.setFieldValue("userId", "");
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="mt-3 rounded-xl border bg-secondary/30 p-4"
    >
      <form.Subscribe
        selector={(state) => state.values.roleId}
        children={(roleId) => {
          const rolePositions = positions.filter(
            (position) => String(position.role?.id) === String(roleId),
          );

          return (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label>{isMobileMode ? t('invite.mobile') : t('invite.user')}</Label>
                <div className="flex items-center gap-2">
                  {isMobileMode ? (
                    <form.Field
                      name="mobile"
                      children={(field) => (
                        <Input
                          autoFocus
                          type="tel"
                          inputMode="tel"
                          value={field.state.value ?? ""}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder={t('invite.enterMobile')}
                          className="flex-1 rounded-lg bg-background"
                          disabled={isSubmitting}
                        />
                      )}
                    />
                  ) : (
                    <form.Field
                      name="userId"
                      children={(field) => (
                        <Select
                          value={field.state.value || ""}
                          onValueChange={(val) => field.handleChange(String(val))}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger className="flex-1 rounded-lg bg-background">
                            <SelectValue placeholder={t('invite.selectUser')} />
                          </SelectTrigger>
                          <SelectContent>
                            {users.length === 0 ? (
                              <div className="px-3 py-2 text-sm text-muted-foreground">
                                {t('members.noMembers')}
                              </div>
                            ) : (
                              users.map((user) => {
                                const displayName = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.name || "کاربر";
                                return (
                                  <SelectItem key={user.id} value={String(user.id)}>
                                    {displayName} — {user.mobile}
                                  </SelectItem>
                                );
                              })
                            )}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  )}
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="shrink-0 rounded-lg bg-background"
                    onClick={toggleMode}
                    disabled={isSubmitting}
                    aria-pressed={isMobileMode}
                  >
                    {isMobileMode ? (
                      <HugeiconsIcon icon={X} strokeWidth={2} className="size-4" />
                    ) : (
                      <HugeiconsIcon icon={Plus} strokeWidth={2} className="size-4" />
                    )}
                    <span className="sr-only">
                      {isMobileMode
                        ? "Back to selecting an existing user"
                        : "Add a user by mobile number"}
                    </span>
                  </Button>
                </div>

                {!isMobileMode && (
                  <p className="text-xs text-muted-foreground">{t('invite.notInList')}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label>{t('invite.role')}</Label>
                <form.Field
                  name="roleId"
                  children={(field) => (
                    <Select
                      value={field.state.value}
                      onValueChange={(val) => {
                        field.handleChange(toRoleId(val));
                        form.setFieldValue("positionId", "");
                      }}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className="w-full rounded-lg bg-background">
                        <SelectValue placeholder={t('invite.selectRole')} />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.length === 0 ? (
                          <div className="px-3 py-2 text-sm text-muted-foreground">{t('roles.noRoles')}</div>
                        ) : (
                          roles.map((r) => {
                            const rid = toRoleId(r.id);
                            return (
                              <SelectItem key={rid} value={rid}>
                                {r.name}
                              </SelectItem>
                            );
                          })
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label>{t('invite.position')}</Label>
                <form.Field
                  name="positionId"
                  children={(field) => (
                    <Select
                      value={field.state.value ? toPositionId(field.state.value) : NONE_POSITION_VALUE}
                      onValueChange={(val) => {
                        field.handleChange(val === NONE_POSITION_VALUE ? "" : toPositionId(val));
                      }}
                      disabled={isSubmitting || !roleId}
                    >
                      <SelectTrigger className="w-full rounded-lg bg-background">
                        <SelectValue placeholder={t('invite.selectPosition')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NONE_POSITION_VALUE}>
                          {t('invite.noPosition')}
                        </SelectItem>
                        {rolePositions.length === 0 ? (
                          <div className="px-3 py-2 text-sm text-muted-foreground">
                            {t('invite.noPositions')}
                          </div>
                        ) : (
                          rolePositions.map((position) => {
                            const pid = toPositionId(position.id);
                            return (
                              <SelectItem key={pid} value={pid}>
                                {position.name}
                              </SelectItem>
                            );
                          })
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                  {t('invite.cancel')}
                </Button>
                <form.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
                  children={([canSubmit]) => (
                    <Button
                      type="submit"
                      className="bg-foreground text-background hover:bg-foreground/90"
                      disabled={!canSubmit || isSubmitting}
                    >
                      {isSubmitting ? "..." : t('invite.sendInvite')}
                    </Button>
                  )}
                />
              </div>
            </div>
          );
        }}
      />

      {inviteMutation.isError && (
        <p className="mt-3 text-xs text-destructive">
          {(inviteMutation.error as any)?.message || "Failed to invite member"}
        </p>
      )}
    </form>
  );
}
