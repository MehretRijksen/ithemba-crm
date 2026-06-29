"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [vergeten, setVergeten] = useState(false);
  const [vergetenEmail, setVergetenEmail] = useState("");
  const [vergetenStatus, setVergetenStatus] = useState<"idle" | "verzonden" | "error">("idle");
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Onjuist emailadres of wachtwoord.");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  async function handleVergeten(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(vergetenEmail, {
      redirectTo: "https://ithemba-crm.vercel.app/reset-wachtwoord",
    });
    if (error) {
      setVergetenStatus("error");
    } else {
      setVergetenStatus("verzonden");
    }
    setLoading(false);
  }

  const inputKlasse = "w-full border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white";

  if (vergeten) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-sm w-full">
          <div className="text-center mb-8">
            <Image src="/logo.png" alt="iThemba Kuluntu" width={80} height={80} className="mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-900">iThemba Kuluntu</h1>
            <p className="text-slate-500 mt-1 text-sm">Wachtwoord opnieuw instellen</p>
          </div>
          {vergetenStatus === "verzonden" ? (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 text-center space-y-4">
              <div className="text-4xl">📧</div>
              <h2 className="text-lg font-semibold text-slate-900">Email verstuurd!</h2>
              <p className="text-slate-500 text-sm">Controleer je inbox op <strong>{vergetenEmail}</strong>.</p>
              <button onClick={() => { setVergeten(false); setVergetenStatus("idle"); }} className="text-blue-700 hover:text-blue-600 text-sm font-medium">
                ← Terug naar inloggen
              </button>
            </div>
          ) : (
            <form onSubmit={handleVergeten} className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 space-y-5">
              <p className="text-slate-500 text-sm">Vul je emailadres in en ontvang een resetlink.</p>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Emailadres</label>
                <input type="email" required value={vergetenEmail} onChange={(e) => setVergetenEmail(e.target.value)} className={inputKlasse} />
              </div>
              {vergetenStatus === "error" && <p className="text-red-500 text-sm">Er is iets misgegaan. Probeer opnieuw.</p>}
              <button type="submit" disabled={loading} className="w-full bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold rounded-xl py-2.5 transition">
                {loading ? "Bezig..." : "Stuur resetlink"}
              </button>
              <button type="button" onClick={() => setVergeten(false)} className="w-full text-slate-500 hover:text-slate-700 text-sm">
                ← Terug naar inloggen
              </button>
            </form>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="iThemba Kuluntu" width={80} height={80} className="mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900">iThemba Kuluntu</h1>
          <p className="text-slate-500 mt-1 text-sm">Log in om verder te gaan</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Emailadres</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputKlasse} placeholder="jouw@email.nl" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Wachtwoord</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputKlasse} placeholder="••••••••" />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold rounded-xl py-2.5 transition">
            {loading ? "Bezig..." : "Inloggen"}
          </button>
          <button type="button" onClick={() => { setVergeten(true); setVergetenEmail(email); }} className="w-full text-slate-500 hover:text-slate-700 text-sm">
            Wachtwoord vergeten?
          </button>
        </form>
      </div>
    </main>
  );
}
