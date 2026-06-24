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

  if (vergeten) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
        <div className="max-w-sm w-full">
          <div className="text-center mb-8">
            <Image src="/logo.png" alt="Ithemba Kuluntu" width={100} height={100} className="mx-auto mb-4" />
            <h1 className="text-3xl font-bold">Ithemba Kuluntu</h1>
            <p className="text-gray-400 mt-2">Wachtwoord opnieuw instellen</p>
          </div>

          {vergetenStatus === "verzonden" ? (
            <div className="bg-gray-900 rounded-2xl p-8 text-center space-y-4">
              <div className="text-4xl">📧</div>
              <h2 className="text-lg font-semibold">Email verstuurd!</h2>
              <p className="text-gray-400 text-sm">Controleer je inbox op <strong>{vergetenEmail}</strong> voor een link om je wachtwoord opnieuw in te stellen.</p>
              <button
                onClick={() => { setVergeten(false); setVergetenStatus("idle"); }}
                className="text-green-400 hover:text-green-300 text-sm"
              >
                ← Terug naar inloggen
              </button>
            </div>
          ) : (
            <form onSubmit={handleVergeten} className="bg-gray-900 rounded-2xl p-8 space-y-5">
              <p className="text-gray-400 text-sm">Vul je emailadres in en je ontvangt een link om je wachtwoord opnieuw in te stellen.</p>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Emailadres</label>
                <input
                  type="email"
                  required
                  value={vergetenEmail}
                  onChange={(e) => setVergetenEmail(e.target.value)}
                  className="w-full bg-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {vergetenStatus === "error" && (
                <p className="text-red-400 text-sm">Er is iets misgegaan. Probeer opnieuw.</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 transition rounded-xl py-3 font-semibold"
              >
                {loading ? "Bezig..." : "Stuur resetlink"}
              </button>

              <button
                type="button"
                onClick={() => setVergeten(false)}
                className="w-full text-gray-400 hover:text-white text-sm"
              >
                ← Terug naar inloggen
              </button>
            </form>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="Ithemba Kuluntu" width={100} height={100} className="mx-auto mb-4" />
          <h1 className="text-3xl font-bold">Ithemba Kuluntu</h1>
          <p className="text-gray-400 mt-2">Log in om verder te gaan</p>
        </div>

        <form onSubmit={handleLogin} className="bg-gray-900 rounded-2xl p-8 space-y-5">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Emailadres</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Wachtwoord</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 transition rounded-xl py-3 font-semibold"
          >
            {loading ? "Bezig..." : "Inloggen"}
          </button>

          <button
            type="button"
            onClick={() => { setVergeten(true); setVergetenEmail(email); }}
            className="w-full text-gray-400 hover:text-white text-sm text-center"
          >
            Wachtwoord vergeten?
          </button>
        </form>
      </div>
    </main>
  );
}
