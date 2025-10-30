"use client";
import { useState } from "react";
import { sendJson } from "@/lib/http";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPass] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await sendJson<{ user: unknown }>("/auth/login", "POST", { email, password });
      router.replace("/properties");
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <main className="max-w-sm mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Logga in</h1>
      <form className="space-y-3" onSubmit={onSubmit}>
        <input className="border rounded w-full px-3 py-2" placeholder="E-post"
               value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        <input className="border rounded w-full px-3 py-2" placeholder="Lösenord"
               value={password} onChange={(e) => setPass(e.target.value)} type="password" required />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="border rounded px-4 py-2">Logga in</button>
      </form>
    </main>
  );
}