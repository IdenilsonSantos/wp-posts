"use client";
import { apiFetch } from "@/app/utils/apiFetcher";
import { useRouter } from "next/navigation";

export function useLogout() {
  const router = useRouter();

  const logout = async () => {
    try {
      await apiFetch<null, unknown>("/api/logout", { method: "POST" });
      router.push("/login");
    } catch (err) {
      console.error("Erro ao deslogar:", err);
    }
  };

  return logout;
}
