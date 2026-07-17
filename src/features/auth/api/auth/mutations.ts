import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "../../store/auth-store";
import { API_ROUTES } from "@/config/api-routes";
import { postToApi } from "@/lib/api";
import { PermissionCode } from "@/config/permissions";
import { getSafeRedirectPath } from "@/lib/safe-redirect";
import { LoginRequest, LoginResponse, loginResponseSchema, MeResponse, meResponseSchema, User, userSchema } from "../../schemas";
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

        const displayName = [data.user.first_name, data.user.last_name].filter(Boolean).join(" ") || "کاربر";
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
      const formData = new FormData();
      if (body.first_name) formData.append("first_name", body.first_name);
      if (body.last_name) formData.append("last_name", body.last_name);
      formData.append("mobile", body.mobile);
      if (body.email) formData.append("email", body.email);
      formData.append("password", body.password);
      formData.append("password_confirmation", body.password_confirmation);
      if (body.invite_token) formData.append("invite_token", body.invite_token);
      if (body.avatar instanceof File) {
        formData.append("avatar", body.avatar);
      }

      return postToApi(
        API_ROUTES.ADMIN.AUTH.REGISTER,
        formData,
        meResponseSchema,
        {
          headers: {
            "Content-Type": undefined,
          },
        }
      );
    },
    onSuccess: (data: MeResponse) => {
      const { user, scopes, permissions } = data;
      setAuthData(user, scopes, (permissions ?? []) as PermissionCode[]);
      queryClient.setQueryData<MeResponse>(authKeys.me, { user, scopes, permissions });
      const displayName = [user.first_name, user.last_name].filter(Boolean).join(" ") || "کاربر";
      toast.success(`${displayName} عزیز، ثبت‌نام با موفقیت انجام شد.`);
      router.push(getSafeRedirectPath(searchParams.get("next")));
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "ثبت‌نام ناموفق بود.";
      toast.error(errorMessage);
    },
  });
};

export interface UpdateProfileInput {
  id: number;
  first_name?: string | null;
  last_name?: string | null;
  mobile: string;
  email?: string | null;
  password?: string | null;
  avatar?: File | null;
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { setAuthData, user: currentUser, scopes, permissions } = useAuthStore();

  return useMutation({
    mutationFn: async (data: UpdateProfileInput) => {
      const formData = new FormData();
      formData.append("_method", "PUT");
      
      if (data.first_name !== undefined && data.first_name !== null) {
        formData.append("first_name", data.first_name);
      }
      if (data.last_name !== undefined && data.last_name !== null) {
        formData.append("last_name", data.last_name);
      }
      formData.append("mobile", data.mobile);
      if (data.email) {
        formData.append("email", data.email);
      }
      if (data.password) {
        formData.append("password", data.password);
      }
      formData.append("is_active", "1");
      
      if (data.avatar instanceof File) {
        formData.append("avatar", data.avatar);
      }

      return postToApi(
        API_ROUTES.ADMIN.USERS.update(data.id),
        formData,
        userSchema,
        {
          headers: {
            "Content-Type": undefined,
          },
        }
      );
    },
    onSuccess: (data: User) => {
      if (currentUser) {
        setAuthData(data, scopes, permissions);
        queryClient.setQueryData<MeResponse>(authKeys.me, {
          user: data,
          scopes,
          permissions,
        });
      }
      toast.success("پروفایل کاربری شما با موفقیت به‌روزرسانی شد.");
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "خطایی در به‌روزرسانی پروفایل رخ داد.";
      toast.error(errorMessage);
    },
  });
};

