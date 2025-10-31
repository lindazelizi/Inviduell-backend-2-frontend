"use client";
import { useState } from "react";
import { sendJson } from "@/lib/http-client";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    try {
      await sendJson("/auth/register", "POST", { email, password });
      router.push("/login?registered=1");
    } catch (e) {
      setErr((e as Error).message);
    }
  };

  return (
    <div className="max-w-sm mx-auto">
      <h1 className="text-xl font-semibold mb-4">Skapa konto</h1>
      {err && <div className="mb-2 text-red-700 text-sm">{err}</div>}
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="border rounded px-3 py-2 w-full" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="E-post" required />
        <input className="border rounded px-3 py-2 w-full" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Lösenord" required />
        <button className="border rounded px-3 py-2">Registrera</button>
      </form>
    </div>
  );
}