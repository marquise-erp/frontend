import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "../../store/auth-store";
import { API_ROUTES } from "@/config/api-routes";
import { postToApi } from "@/lib/api";
import { LoginRequest, LoginResponse, loginResponseSchema, MeResponse } from "../../schemas";
import { authKeys } from "./queries";

function getSafeRedirectPath(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/app/dashboard";
  }
  return next;
}

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

        setAuthData(user, scopes, permissions);

        queryClient.setQueryData<MeResponse>(authKeys.me, { user, scopes, permissions });

        toast.success(`${data.user.name} عزیز، ورود با موفقیت انجام شد.`);
        router.push(getSafeRedirectPath(searchParams.get("next")));
      }
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || "خطایی در برقراری ارتباط با سرور رخ داده است.";
      toast.error(errorMessage);
    },
  });
};
