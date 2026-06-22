"use client";
import { useState } from "react";
import Image from "next/image";

export default function PartnerFormulier() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const res = await fetch("/api/partner", { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } });
    setStatus(res.ok ? "success" : "error");
  }

  if (status === "success") {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <div className="text-5xl">✅</div>
          <h2 className="text-2xl font-bold">Bedankt voor uw registratie!</h2>
          <p className="text-gray-400">U ontvangt binnen enkele minuten een bevestigingsmail.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full">
        <div className="mb-8 text-center">
          <Image src="/logo.png" alt="Ithemba Kuluntu" width={100} height={100} className="mx-auto mb-4" />
          <h1 className="text-3xl font-bold">Ithemba Kuluntu</h1>
          <p className="text-gray-400 mt-2">Partnerregistratie formulier</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 bg-gray-900 rounded-2xl p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Voornaam *</label>
              <input name="voornaam" required className="w-full bg-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Achternaam *</label>
              <input name="achternaam" required className="w-full bg-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Bedrijfsnaam *</label>
            <input name="bedrijfsnaam" required className="w-full bg-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Functietitel</label>
            <input name="functie" className="w-full bg-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">E-mailadres *</label>
            <input name="email" type="email" required className="w-full bg-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Telefoonnummer</label>
            <input name="telefoon" type="tel" className="w-full bg-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Website</label>
            <input name="website" type="url" placeholder="https://" className="w-full bg-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Type samenwerking *</label>
            <select name="type" required className="w-full bg-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="">Selecteer...</option>
              <option value="partner">Partner</option>
              <option value="donateur">Donateur</option>
              <option value="beide">Partner & Donateur</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Opmerkingen</label>
            <textarea name="opmerkingen" rows={3} className="w-full bg-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 transition rounded-xl py-3 font-semibold text-white"
          >
            {status === "loading" ? "Bezig met verzenden..." : "Registratie indienen"}
          </button>

          {status === "error" && <p className="text-red-400 text-sm text-center">Er is iets misgegaan. Probeer het opnieuw.</p>}
        </form>
      </div>
    </main>
  );
}
