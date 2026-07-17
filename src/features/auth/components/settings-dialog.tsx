"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { User as UserIcon, Paintbrush, Lock, UserCheck, Layers, Check, Building2, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { useAuthStore } from "@/features/auth/store/auth-store";
import { useUpdateProfile } from "@/features/auth/api/auth/mutations";
import { useSetDefaultScope, useRemoveScope } from "@/features/auth/api/scope/mutations";
import { AvatarUpload } from "./avatar-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Scope } from "@/features/auth/schemas";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type TabType = "profile" | "appearance" | "scopes";

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const t = useTranslations("userSettings");
  const tOrgType = useTranslations("organization.type");
  const { user, scopes } = useAuthStore();
  const updateProfileMutation = useUpdateProfile();
  const setDefaultScopeMutation = useSetDefaultScope();
  const removeScopeMutation = useRemoveScope();
  const { theme, setTheme } = useTheme();

  const [activeTab, setActiveTab] = React.useState<TabType>("profile");
  const [scopeToDelete, setScopeToDelete] = React.useState<Scope | null>(null);

  // Form State
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [mobile, setMobile] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [avatar, setAvatar] = React.useState<File | null>(null);

  // Initialize form state when user changes or dialog opens
  React.useEffect(() => {
    if (user && open) {
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
      setEmail(user.email || "");
      setMobile(user.mobile || "");
      setPassword("");
      setAvatar(null);
    }
  }, [user, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    updateProfileMutation.mutate(
      {
        id: user.id,
        first_name: firstName,
        last_name: lastName,
        email: email,
        mobile: mobile,
        password: password || null,
        avatar: avatar,
      },
      {
        onSuccess: () => {
          setPassword("");
          setAvatar(null);
        },
      }
    );
  };

  const navItems = [
    { id: "profile" as TabType, name: t("profile"), icon: UserIcon },
    { id: "scopes" as TabType, name: t("scopes"), icon: Layers },
    { id: "appearance" as TabType, name: t("appearance"), icon: Paintbrush },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 max-w-[95vw] md:max-h-[580px] md:max-w-[750px] lg:max-w-[850px] rounded-xl border border-border/80 shadow-2xl transition-all duration-300">
        <DialogTitle className="sr-only">{t("title")}</DialogTitle>
        <DialogDescription className="sr-only">
          {t("description")}
        </DialogDescription>
        <SidebarProvider className="items-start min-h-[450px] md:min-h-[500px]">
          <Sidebar
            collapsible="none"
            side="right"
            className="hidden md:flex w-52 border-l border-border/50 bg-muted/20 overflow-hidden"
          >
            <SidebarContent className="p-2 overflow-hidden">
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu className="gap-1">
                    {navItems.map((item) => (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          asChild
                          isActive={activeTab === item.id}
                          onClick={() => setActiveTab(item.id)}
                          className={cn(
                            "cursor-pointer w-full justify-start gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                            activeTab === item.id
                              ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                              : "hover:bg-muted text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <button type="button">
                            <item.icon className="size-4 shrink-0" />
                            <span>{item.name}</span>
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>

          <main className="flex h-[520px] flex-1 flex-col overflow-hidden bg-background">
            {/* Header (Tab selector for mobile) */}
            <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/50 px-4 md:px-6">
              <div className="text-sm font-semibold text-foreground">
                {activeTab === "profile"
                  ? t("profile")
                  : activeTab === "scopes"
                  ? t("scopes")
                  : t("appearance")}
              </div>
              <div className="flex md:hidden gap-2">
                {navItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "default" : "ghost"}
                    size="sm"
                    className="h-8 text-xs gap-1 rounded-md"
                    onClick={() => setActiveTab(item.id)}
                  >
                    <item.icon className="size-3.5" />
                    <span>{item.name}</span>
                  </Button>
                ))}
              </div>
            </header>

            {/* Content Area */}
            <ScrollArea type="hover" className="flex-1 min-h-0">
              <div className="p-4 md:p-6">
                {activeTab === "profile" && (
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                  {/* Avatar Upload circle */}
                  <div className="flex flex-col items-center justify-center border-b border-border/30 pb-5">
                    <AvatarUpload
                      value={avatar}
                      onChange={setAvatar}
                      initialPreviewUrl={user?.avatar_url}
                    />
                  </div>

                  {/* Name fields in grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel htmlFor="settings-first-name">{t("firstName")}</FieldLabel>
                      <Input
                        id="settings-first-name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder={t("firstName")}
                        className="rounded-lg"
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="settings-last-name">{t("lastName")}</FieldLabel>
                      <Input
                        id="settings-last-name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder={t("lastName")}
                        className="rounded-lg"
                      />
                    </Field>
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel htmlFor="settings-mobile">{t("mobile")}</FieldLabel>
                      <Input
                        id="settings-mobile"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="09121112233"
                        required
                        dir="ltr"
                        className="text-left rounded-lg"
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="settings-email">{t("email")}</FieldLabel>
                      <Input
                        id="settings-email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        type="email"
                        dir="ltr"
                        className="text-left rounded-lg"
                      />
                    </Field>
                  </div>

                  {/* Change Password */}
                  <div className="border-t border-border/30 pt-5">
                    <Field>
                      <FieldLabel htmlFor="settings-password">{t("changePassword")}</FieldLabel>
                      <Input
                        id="settings-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        type="password"
                        className="rounded-lg"
                      />
                    </Field>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end gap-3 mt-2">
                    <Button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                      className="min-w-28 rounded-lg shadow-sm font-semibold"
                    >
                      {updateProfileMutation.isPending ? t("saving") : t("save")}
                    </Button>
                  </div>
                </form>
              )}

              {activeTab === "appearance" && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-1">
                      {t("theme")}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {t("description")}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {/* Light theme */}
                    <button
                      onClick={() => setTheme("light")}
                      className={cn(
                        "flex flex-col items-center gap-3 p-4 rounded-xl border bg-card transition-all duration-200 hover:scale-102 hover:shadow-md cursor-pointer",
                        theme === "light"
                          ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                          : "border-border/60 hover:border-border"
                      )}
                    >
                      <div className="flex size-10 items-center justify-center rounded-lg bg-yellow-500/10 text-yellow-600 dark:text-yellow-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="size-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                          />
                        </svg>
                      </div>
                      <span className="text-xs font-semibold">{t("themeLight")}</span>
                    </button>

                    {/* Dark theme */}
                    <button
                      onClick={() => setTheme("dark")}
                      className={cn(
                        "flex flex-col items-center gap-3 p-4 rounded-xl border bg-card transition-all duration-200 hover:scale-102 hover:shadow-md cursor-pointer",
                        theme === "dark"
                          ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                          : "border-border/60 hover:border-border"
                      )}
                    >
                      <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="size-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
                          />
                        </svg>
                      </div>
                      <span className="text-xs font-semibold">{t("themeDark")}</span>
                    </button>

                    {/* System theme */}
                    <button
                      onClick={() => setTheme("system")}
                      className={cn(
                        "flex flex-col items-center gap-3 p-4 rounded-xl border bg-card transition-all duration-200 hover:scale-102 hover:shadow-md cursor-pointer",
                        theme === "system"
                          ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                          : "border-border/60 hover:border-border"
                      )}
                    >
                      <div className="flex size-10 items-center justify-center rounded-lg bg-slate-500/10 text-slate-600 dark:text-slate-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="size-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25"
                          />
                        </svg>
                      </div>
                      <span className="text-xs font-semibold">{t("themeSystem")}</span>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "scopes" && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-1">
                      {t("scopes")}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {t("scopesDescription")}
                    </p>
                  </div>

                  <RadioGroup
                    value={scopes.find((s) => s.is_default)?.id.toString() ?? ""}
                    onValueChange={(val) => {
                      if (val) {
                        setDefaultScopeMutation.mutate(Number(val));
                      }
                    }}
                    className="flex flex-col gap-3"
                  >
                    {scopes.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">{t("noScopes")}</p>
                    ) : (
                      scopes.map((scope) => {
                        const isDefault = scope.is_default;
                        const isCurrentContext = scope.is_current_context;
                        const orgTypeLabel = scope.organization.type ? tOrgType(scope.organization.type) : "";
                        
                        const hierarchy = [
                          scope.organization.holding?.name,
                          scope.organization.brand?.name,
                          scope.organization.type === "branch" ? scope.organization.name : null
                        ].filter(Boolean).join(" ➔ ");

                        const isPending =
                          (setDefaultScopeMutation.isPending && setDefaultScopeMutation.variables === scope.id) ||
                          (removeScopeMutation.isPending && removeScopeMutation.variables === scope.id);

                        return (
                          <FieldLabel
                            key={scope.id}
                            htmlFor={`scope-${scope.id}`}
                            className={cn(
                              "w-full transition-all duration-200 hover:shadow-sm border rounded-xl p-0 block overflow-hidden relative",
                              isDefault
                                ? "border-amber-500/50 bg-amber-500/5 ring-1 ring-amber-500/10"
                                : "border-border/60 hover:border-border",
                              isPending && "opacity-60 pointer-events-none"
                            )}
                          >
                            <Field orientation="horizontal" className="p-4 flex items-center gap-4">
                              <div className={cn(
                                "flex size-10 items-center justify-center rounded-lg border shrink-0",
                                isDefault
                                  ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                                  : "bg-muted/40 border-border/50 text-muted-foreground"
                              )}>
                                <Building2 className="size-5" />
                              </div>

                              <FieldContent className="flex-1 flex flex-col gap-1 leading-snug">
                                <FieldTitle className="flex items-center gap-2">
                                  <span className="text-sm font-semibold text-foreground font-medium">
                                    {scope.organization.name}
                                  </span>
                                  <span className={cn(
                                    "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                                    scope.organization.type === "holding"
                                      ? "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400"
                                      : scope.organization.type === "brand"
                                      ? "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400"
                                      : "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400"
                                  )}>
                                    {orgTypeLabel}
                                  </span>
                                </FieldTitle>
                                {hierarchy && (
                                  <FieldDescription className="text-xs text-muted-foreground">
                                    {hierarchy}
                                  </FieldDescription>
                                )}
                                <FieldDescription className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground/80">
                                  {scope.role && (
                                    <span>
                                      <strong>نقش: </strong>
                                      {scope.role.name}
                                    </span>
                                  )}
                                  {scope.position && (
                                    <span>
                                      <strong>سمت: </strong>
                                      {scope.position.name}
                                    </span>
                                  )}
                                </FieldDescription>
                              </FieldContent>

                              <div className="flex items-center gap-3 shrink-0">
                                <div onClick={(e) => e.stopPropagation()}>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    disabled={isCurrentContext || scopes.length <= 1 || isPending}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setScopeToDelete(scope);
                                    }}
                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent"
                                    title={
                                      isCurrentContext
                                        ? "حوزه کاری فعال فعلی قابل حذف نیست"
                                        : scopes.length <= 1
                                        ? "شما باید حداقل یک حوزه کاری داشته باشید"
                                        : "حذف حوزه کاری"
                                    }
                                  >
                                    <Trash2 className="size-4" />
                                  </Button>
                                </div>

                                <RadioGroupItem
                                  value={scope.id.toString()}
                                  id={`scope-${scope.id}`}
                                  disabled={isPending}
                                />
                              </div>
                            </Field>
                          </FieldLabel>
                        );
                      })
                    )}
                  </RadioGroup>
                </div>
              )}
              </div>
            </ScrollArea>
          </main>
        </SidebarProvider>
      </DialogContent>
      {/* Scope Delete Confirmation Dialog */}
      <AlertDialog open={scopeToDelete !== null} onOpenChange={(open) => !open && setScopeToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteWorkspaceTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteWorkspaceDescription", { name: scopeToDelete?.organization.name ?? "" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removeScopeMutation.isPending}>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={removeScopeMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                if (scopeToDelete) {
                  removeScopeMutation.mutate(scopeToDelete.id, {
                    onSuccess: () => {
                      setScopeToDelete(null);
                    },
                  });
                }
              }}
            >
              {removeScopeMutation.isPending ? "در حال حذف..." : t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
