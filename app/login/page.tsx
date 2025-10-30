"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { sendJson } from "@/lib/http"; // ✅ rätt export

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await sendJson("/auth/login", "POST", { email, password });
      router.replace("/properties");
    } catch (err: any) {
      setError(err?.message ?? "Något gick fel");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Logga in</h1>
      <form onSubmit={onSubmit} className="space-y-3 max-w-sm">
        <input
          type="email"
          placeholder="E-post"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border rounded p-2 w-full"
        />
        <input
          type="password"
          placeholder="Lösenord"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border rounded p-2 w-full"
        />
        {error ? <p className="text-red-600 text-sm">{error}</p> : null}
        <button disabled={loading} className="border rounded px-3 py-1">
          {loading ? "Loggar in…" : "Logga in"}
        </button>
      </form>
    </main>
  );
}