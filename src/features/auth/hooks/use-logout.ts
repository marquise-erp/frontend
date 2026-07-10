import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/auth-store";
import { authKeys } from "../api/auth/queries";

export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);

  return async () => {
    await logout();

    // Clear cached auth data so it doesn't leak into next login session
    queryClient.removeQueries({ queryKey: authKeys.me });

    toast.success("خروج با موفقیت انجام شد.");
    router.push("/auth/login");
  };
};