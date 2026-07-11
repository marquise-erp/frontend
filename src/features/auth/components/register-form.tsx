"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useRegister } from "../api/auth";
import { registerRequestSchema, type RegisterRequest } from "../schemas/register/requests";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const t = useTranslations("auth.register");
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("token") ?? undefined;
  const next = searchParams.get("next");
  const mutation = useRegister();

  const form = useForm({
    defaultValues: {
      first_name: "",
      last_name: "",
      mobile: "",
      email: "",
      password: "",
      password_confirmation: "",
      invite_token: inviteToken,
    } as RegisterRequest,

    validators: {
      onChange: ({ value }) => {
        const result = registerRequestSchema.safeParse(value);
        if (result.success) return undefined;
        return result.error.issues;
      },
    },
    onSubmit: async ({ value }) => {
      mutation.mutate({
        ...value,
        invite_token: inviteToken,
      });
    },
  });

  const loginHref = next
    ? `/auth/login?next=${encodeURIComponent(next)}`
    : "/auth/login";

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      {...props}
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-sm text-balance text-muted-foreground">
            {inviteToken ? t("descriptionInvite") : t("description")}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <form.Field
            name="first_name"
            children={(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>{t("first_name")}</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          <form.Field
            name="last_name"
            children={(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>{t("last_name")}</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />
        </div>

        <form.Field
          name="mobile"
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>{t("mobile")}</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  type="tel"
                  placeholder="09121112233"
                  required
                  aria-invalid={isInvalid}
                  dir="ltr"
                  className="text-left"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

        <form.Field
          name="email"
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>{t("email")}</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value || ""}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  type="email"
                  placeholder="name@example.com"
                  aria-invalid={isInvalid}
                  dir="ltr"
                  className="text-left"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

        <form.Field
          name="password"
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>{t("password")}</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  type="password"
                  required
                  aria-invalid={isInvalid}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

        <form.Field
          name="password_confirmation"
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>{t("passwordConfirmation")}</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  type="password"
                  required
                  aria-invalid={isInvalid}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <Field>
              <Button type="submit" disabled={!canSubmit || mutation.isPending}>
                {isSubmitting || mutation.isPending ? t("submitting") : t("submit")}
              </Button>
              {mutation.isError && (
                <div className="text-sm font-medium text-destructive text-center">
                  {(mutation.error as Error)?.message || t("failed")}
                </div>
              )}
              <FieldDescription className="text-center">
                {t("hasAccount")}{" "}
                <Link href={loginHref} className="underline underline-offset-4">
                  {t("loginLink")}
                </Link>
              </FieldDescription>
            </Field>
          )}
        />
      </FieldGroup>
    </form>
  );
}
