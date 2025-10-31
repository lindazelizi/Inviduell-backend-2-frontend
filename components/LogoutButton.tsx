"use client";

import { sendJson } from "@/lib/http-client";
import { useRouter } from "next/navigation";
import * as React from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  const onLogout = async () => {
    try {
      setBusy(true);
      await sendJson("/auth/logout", "POST");
      router.replace("/login");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={onLogout}
      disabled={busy}
      className="border rounded px-3 py-1 text-sm"
      aria-busy={busy}
    >
      {busy ? "Loggar ut…" : "Logga ut"}
    </button>
  );
}