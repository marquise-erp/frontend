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

import type { OrganizationType } from "../../schemas/types";
import type { Role } from "@/features/auth/schemas/rbac.schema";
import type { OrgMember } from "../../types/organization-tree";


// Role id in our assign schema is string to be compatible with mock rbac-store.
// Remote roles use numeric ids — we normalize to string here.
function toRoleId(v: string | number): string {
  return String(v);
}

interface InviteMemberFormProps {
  levelId: string;
  levelType: OrganizationType;
  users: OrgMember[];
  roles: Role[];
  onClose: () => void;
  onSuccess?: () => void;
}

export function InviteMemberForm({
  levelId,
  levelType,
  users,
  roles,
  onClose,
  onSuccess,
}: InviteMemberFormProps) {
  const t = useTranslations('organization.sheet');
  const [mode, setMode] = useState<"select" | "mobile">("select");

  const assignMutation = useAssignUserToLevel();

  const isMobileMode = mode === "mobile";

  const firstRoleId = roles[0] ? toRoleId(roles[0].id) : "";
  const defaultValues: AssignMemberInput = {
    userId: "",
    mobile: "",
    roleId: firstRoleId,
    position: "",
    levelId,
    levelType,
  };

  const form = useForm({
    defaultValues,
    validators: {
      onChange: ({ value }) => {
        const result = assignMemberInputSchema.safeParse(value);
        if (result.success) return undefined;
        return result.error.issues;
      },
    },
    onSubmit: async ({ value }) => {
      try {
        await assignMutation.mutateAsync({
          ...value,
          roleId: toRoleId(value.roleId),
          userId: isMobileMode ? undefined : value.userId || undefined,
          mobile: isMobileMode ? value.mobile : undefined,
        });
        toast.success(isMobileMode ? t('invite.sendInvite') : t('invite.memberAdded'));
        form.reset();
        onSuccess?.();
        onClose();
      } catch (err: any) {
        toast.error(err?.message || "Failed to assign member");
      }
    },
  });

  const isSubmitting = assignMutation.isPending;

  const toggleMode = () => {
    if (isMobileMode) {
      setMode("select");
      form.setFieldValue("mobile", "");
    } else {
      setMode("mobile");
      form.setFieldValue("userId", "");
    }
  };

  const roleOptions = roles;
  const userOptions = users;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="mt-3 flex flex-col gap-4 rounded-xl border bg-secondary/30 p-4"
    >
      {/* User / Mobile */}
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
                  onValueChange={(val) => field.handleChange(val)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="flex-1 rounded-lg bg-background">
                    <SelectValue placeholder={t('invite.selectUser')} />
                  </SelectTrigger>
                  <SelectContent>
                    {userOptions.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-muted-foreground">{t('members.noMembers')}</div>
                    ) : (
                      userOptions.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.fullName} — {u.email}
                        </SelectItem>
                      ))
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
            className="rounded-lg bg-background"
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
              {isMobileMode ? "Back to selecting an existing user" : "Add a user by mobile number"}
            </span>
          </Button>
        </div>

        {!isMobileMode && (
          <p className="text-xs text-muted-foreground">
            {t('invite.notInList')}
          </p>
        )}
      </div>

      {/* Role */}
      <div className="flex flex-col gap-2">
        <Label>{t('invite.role')}</Label>
        <form.Field
          name="roleId"
          children={(field) => (
            <Select
              value={field.state.value}
              onValueChange={(val) => field.handleChange(toRoleId(val))}
              disabled={isSubmitting}
            >
              <SelectTrigger className="rounded-lg bg-background">
                <SelectValue placeholder={t('invite.selectRole')} />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">{t('roles.noRoles')}</div>
                ) : (
                  roleOptions.map((r) => {
                    const rid = toRoleId(r.id);
                    const color = (r as any).color ?? "#64748b";
                    return (
                      <SelectItem key={rid} value={rid}>
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full" style={{ background: color }} />
                          {r.name}
                        </span>
                      </SelectItem>
                    );
                  })
                )}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {/* Position (optional) */}
      <div className="flex flex-col gap-2">
        <Label>{t('invite.position')}</Label>
        <form.Field
          name="position"
          children={(field) => (
            <Input
              value={field.state.value ?? ""}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="e.g. Sales Manager"
              className="rounded-lg bg-background"
              disabled={isSubmitting}
            />
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
              {isSubmitting ? "..." : isMobileMode ? t('invite.sendInvite') : t('invite.submit')}
            </Button>
          )}
        />
      </div>

      {assignMutation.isError && (
        <p className="text-xs text-destructive">
          {(assignMutation.error as any)?.message || "Failed to invite member"}
        </p>
      )}
    </form>
  );
}