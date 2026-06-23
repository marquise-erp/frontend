import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "../store/auth-store";

export const useLogout = () => {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  return async () => {
    await logout();

    toast.success("خروج با موفقیت انجام شد.");
    router.push("/auth/login");
  };
};