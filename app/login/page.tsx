"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/contexts/user";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/properties";
  const { login } = useUser();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.replace(next);
    } catch (err: any) {
      setError(err?.message ?? "Något gick fel");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1 className="text-2xl font-bold mb-4">Logga in</h1>
      <form onSubmit={onSubmit} className="space-y-3 max-w-sm">
        <input
          type="email"
          placeholder="E-post"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border rounded p-2 w-full"
          required
        />
        <input
          type="password"
          placeholder="Lösenord"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border rounded p-2 w-full"
          required
        />
        {error ? <p className="text-red-600 text-sm">{error}</p> : null}
        <button disabled={loading} className="rounded bg-black px-3 py-2 text-white disabled:opacity-50">
          {loading ? "Loggar in…" : "Logga in"}
        </button>
      </form>

      <p className="mt-4 text-sm">
        Har du inget konto?{" "}
        <Link href={`/register?next=${encodeURIComponent(next)}`} className="underline">
          Skapa konto
        </Link>
      </p>
    </main>
  );
}