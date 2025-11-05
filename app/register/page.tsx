"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { sendJson } from "@/lib/http-client";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"guest"|"host">("guest");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await sendJson("/auth/register", "POST", { email, password, name, role });
      // Efter register försöker backend logga in; oavsett, hoppa vidare:
      router.replace(next || "/?welcome=1");
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-sm mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Skapa konto</h1>
      {err && <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">{err}</div>}
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="border rounded px-3 py-2 w-full" placeholder="Namn (valfritt)" value={name} onChange={e=>setName(e.target.value)} />
        <input className="border rounded px-3 py-2 w-full" type="email" placeholder="E-post" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input className="border rounded px-3 py-2 w-full" type="password" placeholder="Lösenord" value={password} onChange={e=>setPassword(e.target.value)} required />

        <div className="flex gap-4 items-center">
          <label className="flex items-center gap-2">
            <input type="radio" name="role" value="guest" checked={role==="guest"} onChange={()=>setRole("guest")} />
            Jag vill hyra (gäst)
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="role" value="host" checked={role==="host"} onChange={()=>setRole("host")} />
            Jag hyr ut (värd)
          </label>
        </div>

        <button disabled={loading} className="rounded bg-black px-4 py-2 text-white disabled:opacity-50">
          {loading ? "Skapar…" : "Skapa konto"}
        </button>
      </form>
    </main>
  );
}