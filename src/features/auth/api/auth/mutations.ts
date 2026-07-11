import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "../../store/auth-store";
import { API_ROUTES } from "@/config/api-routes";
import { postToApi } from "@/lib/api";
import { PermissionCode } from "@/config/permissions";
import { getSafeRedirectPath } from "@/lib/safe-redirect";
import { LoginRequest, LoginResponse, loginResponseSchema, MeResponse, meResponseSchema } from "../../schemas";
import { RegisterRequest, registerRequestSchema } from "../../schemas/register/requests";
import { authKeys } from "./queries";

export { getSafeRedirectPath };

export const useLogin = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { setAuthData } = useAuthStore();

  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      try {
        await api.get("/sanctum/csrf-cookie", { baseURL: "" });
      } catch {
        console.warn("CSRF handshake failed, attempting login anyway...");
      }

      return postToApi(
        API_ROUTES.ADMIN.AUTH.LOGIN,
        data,
        loginResponseSchema,
      );
    },
    onSuccess: (data: LoginResponse) => {
      if (data.requires_otp) {
        toast.info(data.message || "لطفاً کد تایید ارسال شده را وارد کنید.");
        router.push(`/auth/verify?mobile=${encodeURIComponent(data.mobile)}`);
        return;
      }

      if (data.user) {
        const { user, scopes, permissions } = data;

        setAuthData(user, scopes, (permissions ?? []) as PermissionCode[]);

        queryClient.setQueryData<MeResponse>(authKeys.me, { user, scopes, permissions });

        const displayName = [data.user.first_name, data.user.last_name].filter(Boolean).join(" ") || data.user.name || "کاربر";
        toast.success(`${displayName} عزیز، ورود با موفقیت انجام شد.`);
        router.push(getSafeRedirectPath(searchParams.get("next")));
      }
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || "خطایی در برقراری ارتباط با سرور رخ داده است.";
      toast.error(errorMessage);
    },
  });
};

export const useRegister = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { setAuthData } = useAuthStore();

  return useMutation({
    mutationFn: async (data: RegisterRequest) => {
      try {
        await api.get("/sanctum/csrf-cookie", { baseURL: "" });
      } catch {
        console.warn("CSRF handshake failed, attempting register anyway...");
      }

      const body = registerRequestSchema.parse(data);
      return postToApi(
        API_ROUTES.ADMIN.AUTH.REGISTER,
        body,
        meResponseSchema,
      );
    },
    onSuccess: (data: MeResponse) => {
      const { user, scopes, permissions } = data;
      setAuthData(user, scopes, (permissions ?? []) as PermissionCode[]);
      queryClient.setQueryData<MeResponse>(authKeys.me, { user, scopes, permissions });
      const displayName = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.name || "کاربر";
      toast.success(`${displayName} عزیز، ثبت‌نام با موفقیت انجام شد.`);
      router.push(getSafeRedirectPath(searchParams.get("next")));
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "ثبت‌نام ناموفق بود.";
      toast.error(errorMessage);
    },
  });
};
