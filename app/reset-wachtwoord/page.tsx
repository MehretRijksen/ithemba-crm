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
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        // Supabase heeft de sessie hersteld via de resetlink
      }
    });
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

  return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="Ithemba Kuluntu" width={100} height={100} className="mx-auto mb-4" />
          <h1 className="text-3xl font-bold">Ithemba Kuluntu</h1>
          <p className="text-gray-400 mt-2">Nieuw wachtwoord instellen</p>
        </div>

        {status === "success" ? (
          <div className="bg-gray-900 rounded-2xl p-8 text-center space-y-4">
            <div className="text-4xl">✅</div>
            <h2 className="text-lg font-semibold">Wachtwoord gewijzigd!</h2>
            <p className="text-gray-400 text-sm">Je wordt doorgestuurd naar het dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleReset} className="bg-gray-900 rounded-2xl p-8 space-y-5">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nieuw wachtwoord</label>
              <input
                type="password"
                required
                value={wachtwoord}
                onChange={(e) => setWachtwoord(e.target.value)}
                className="w-full bg-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Herhaal wachtwoord</label>
              <input
                type="password"
                required
                value={herhaal}
                onChange={(e) => setHerhaal(e.target.value)}
                className="w-full bg-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {fout && <p className="text-red-400 text-sm">{fout}</p>}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 transition rounded-xl py-3 font-semibold"
            >
              {status === "loading" ? "Bezig..." : "Wachtwoord opslaan"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
