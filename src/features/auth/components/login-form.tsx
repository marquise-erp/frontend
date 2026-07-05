"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldError,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useForm } from "@tanstack/react-form"
import { loginRequestSchema, LoginRequest } from "../schemas/login-schema"
import { useLogin } from "../hooks/use-login"
import { useTranslations } from "next-intl"


export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"form">) {
    const t = useTranslations('auth');
    const mutation = useLogin();
    const form = useForm({
        defaultValues: {
            mobile: "",
            password: "",
            remember: false,
        } as LoginRequest,

        validators: {
            onChange: ({ value }) => {
                const result = loginRequestSchema.safeParse(value)
                if (result.success) {
                    return undefined
                }

                return result.error.issues
            },
        },
        onSubmit: async ({ value }) => {
            console.log("Submitting:", value)
            mutation.mutate(value);
        },
    })

    return (
        <form className={cn("flex flex-col gap-6", className)} {...props}
            onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                form.handleSubmit()
            }}>
            <FieldGroup>
                <div className="flex flex-col items-center gap-1 text-center">
                    <h1 className="text-2xl font-bold">{t("login.title")}</h1>
                    <p className="text-sm text-balance text-muted-foreground">
                        {t("login.description")}
                    </p>
                </div>
                <form.Field
                    name="mobile"
                    children={(field) => {
                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                        return (
                            <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor={field.name}>{t("login.mobile")}</FieldLabel>
                                <Input
                                    id={field.name}
                                    name={field.name}
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    type="text"
                                    placeholder="+989121112233"
                                    required
                                    aria-invalid={isInvalid}
                                />
                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                            </Field>
                        )
                    }}
                />

                {/* PASSWORD FIELD */}
                <form.Field
                    name="password"
                    children={(field) => {
                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                        return (
                            <Field data-invalid={isInvalid}>
                                <div className="flex items-center">
                                    <FieldLabel htmlFor={field.name}>{t("login.password")}</FieldLabel>
                                    <a
                                        href="#"
                                        className="mr-auto inline-block text-sm underline-offset-4 hover:underline"
                                    >
                                        {t("login.forget password")}
                                    </a>
                                </div>
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
                        )
                    }}
                />

                {/* REMEMBER ME */}
                <form.Field
                    name="remember"
                    children={(field) => (
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id={field.name}
                                checked={!!field.state.value}
                                onCheckedChange={(checked) => field.handleChange(checked === true)}
                                onBlur={field.handleBlur}
                            />
                            <label
                                htmlFor={field.name}
                                className="text-sm text-muted-foreground cursor-pointer select-none"
                            >
                                {t("login.remember")}
                            </label>
                        </div>
                    )}
                />

                {/* ACTION BUTTONS */}
                <form.Subscribe
                    selector={(state) => [state.canSubmit, state.isSubmitting]}
                    children={([canSubmit, isSubmitting]) => (
                        <Field>
                            <Button type="submit" disabled={!canSubmit}>
                                {isSubmitting ? "ورود در حال انجام است..." : "ورود"}
                            </Button>
                            {mutation.isError && (
                                <div className="text-sm font-medium text-destructive text-center">
                                    {(mutation.error as any)?.response?.data?.message || (mutation.error as any)?.message || "ورود ناموفق بود"}
                                </div>
                            )}
                            <FieldDescription className="text-center">
                                حسابی ندارید؟ <a href="#">ثبت نام</a>
                            </FieldDescription>
                        </Field>
                    )}
                />

            </FieldGroup>
        </form>
    )
}