"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ResetWachtwoord() {
  const [wachtwoord, setWachtwoord] = useState("");
  const [herhaal, setHerhaal] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [fout, setFout] = useState("");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {});
    return () => subscription.unsubscribe();
  }, [supabase]);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (wachtwoord !== herhaal) {
      setFout("Wachtwoorden komen niet overeen.");
      return;
    }
    if (wachtwoord.length < 8) {
      setFout("Wachtwoord moet minimaal 8 tekens zijn.");
      return;
    }
    setStatus("loading");
    setFout("");
    const { error } = await supabase.auth.updateUser({ password: wachtwoord });
    if (error) {
      setFout("Er is iets misgegaan. Probeer de resetlink opnieuw.");
      setStatus("error");
    } else {
      setStatus("success");
      setTimeout(() => router.push("/dashboard"), 2000);
    }
  }

  const inputKlasse = "w-full border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent";

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="Ithemba Kuluntu" width={80} height={80} className="mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900">Ithemba Kuluntu</h1>
          <p className="text-slate-500 mt-1 text-sm">Nieuw wachtwoord instellen</p>
        </div>

        {status === "success" ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center space-y-4">
            <div className="text-4xl">✅</div>
            <h2 className="text-lg font-semibold text-slate-900">Wachtwoord gewijzigd!</h2>
            <p className="text-slate-500 text-sm">Je wordt doorgestuurd naar het dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleReset} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Nieuw wachtwoord</label>
              <input
                type="password"
                required
                value={wachtwoord}
                onChange={(e) => setWachtwoord(e.target.value)}
                className={inputKlasse}
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Herhaal wachtwoord</label>
              <input
                type="password"
                required
                value={herhaal}
                onChange={(e) => setHerhaal(e.target.value)}
                className={inputKlasse}
                placeholder="••••••••"
              />
            </div>

            {fout && <p className="text-red-500 text-sm">{fout}</p>}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-blue-700 hover:bg-blue-600 disabled:opacity-50 transition rounded-xl py-3 font-semibold text-white"
            >
              {status === "loading" ? "Bezig..." : "Wachtwoord opslaan"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
