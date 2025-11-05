"use client";

import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/user";

export default function LogoutButton() {
  const { logout } = useUser();
  const router = useRouter();

  async function onClick() {
    await logout();
    router.replace("/?loggedout=1");
  }

  return (
    <button onClick={onClick} className="rounded border px-2 py-1 text-sm">
      Logga ut
    </button>
  );
}