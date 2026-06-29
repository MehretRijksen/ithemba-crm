"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function NieuwePartner() {
  const router = useRouter();
  const [fase, setFase] = useState<1 | 2>(1);
  const [status, setStatus] = useState<"prospect" | "partner">("prospect");
  const [loading, setLoading] = useState(false);
  const [fout, setFout] = useState("");

  const [form, setForm] = useState({
    voornaam: "", achternaam: "", bedrijfsnaam: "", functie: "",
    email: "", telefoon: "", website: "", type: "partner", opmerkingen: "",
    bedrag: "", frequentie: "maandelijks", looptijd: "onbepaald", betalingswijze: "sepa",
  });

  function update(veld: string, waarde: string) {
    setForm((f) => ({ ...f, [veld]: waarde }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setFout("");

    const res = await fetch("/api/partner/intern", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, status }),
    });

    if (res.ok) {
      router.push("/dashboard");
    } else {
      const json = await res.json().catch(() => ({}));
      setFout(json.error || "Er is iets misgegaan.");
      setLoading(false);
    }
  }

  const inputKlasse = "w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-600";

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Ithemba Kuluntu" width={36} height={36} className="rounded-full" />
            <div>
              <div className="font-bold text-sm leading-tight">Ithemba Kuluntu</div>
              <div className="text-xs text-gray-400 leading-tight">Partner CRM</div>
            </div>
          </div>
          <Link href="/dashboard" className="text-gray-400 hover:text-white text-sm">← Dashboard</Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">Nieuwe partner toevoegen</h1>
        <p className="text-gray-400 text-sm mb-8">Vul de gegevens in van de persoon waarmee je gesproken hebt.</p>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Fase 1: Basisgegevens */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 space-y-5">
            <h2 className="font-semibold text-gray-300 text-sm uppercase tracking-wide">Contactgegevens</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Voornaam *</label>
                <input required value={form.voornaam} onChange={(e) => update("voornaam", e.target.value)} className={inputKlasse} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Achternaam *</label>
                <input required value={form.achternaam} onChange={(e) => update("achternaam", e.target.value)} className={inputKlasse} />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Bedrijfsnaam *</label>
              <input required value={form.bedrijfsnaam} onChange={(e) => update("bedrijfsnaam", e.target.value)} className={inputKlasse} />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Functie</label>
              <input value={form.functie} onChange={(e) => update("functie", e.target.value)} className={inputKlasse} />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">E-mailadres *</label>
              <input required type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className={inputKlasse} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Telefoon</label>
                <input value={form.telefoon} onChange={(e) => update("telefoon", e.target.value)} className={inputKlasse} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Website</label>
                <input value={form.website} onChange={(e) => update("website", e.target.value)} className={inputKlasse} />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Type samenwerking *</label>
              <select value={form.type} onChange={(e) => update("type", e.target.value)} className={inputKlasse}>
                <option value="partner">Partner</option>
                <option value="donateur">Donateur</option>
                <option value="beide">Partner & Donateur</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Opmerkingen</label>
              <textarea value={form.opmerkingen} onChange={(e) => update("opmerkingen", e.target.value)} rows={3} className={`${inputKlasse} resize-none`} />
            </div>
          </div>

          {/* Status keuze */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <h2 className="font-semibold text-gray-300 text-sm uppercase tracking-wide mb-4">Status</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStatus("prospect")}
                className={`rounded-xl p-4 border-2 text-left transition ${status === "prospect" ? "border-blue-500 bg-blue-950/40" : "border-gray-700 hover:border-gray-500"}`}
              >
                <div className="font-semibold text-sm mb-1">📋 Prospect</div>
                <div className="text-xs text-gray-400">Nog niet gesloten — stuur een bedankmail</div>
              </button>
              <button
                type="button"
                onClick={() => setStatus("partner")}
                className={`rounded-xl p-4 border-2 text-left transition ${status === "partner" ? "border-green-500 bg-green-950/40" : "border-gray-700 hover:border-gray-500"}`}
              >
                <div className="font-semibold text-sm mb-1">✅ Gesloten</div>
                <div className="text-xs text-gray-400">Deal gesloten — genereer contract</div>
              </button>
            </div>
          </div>

          {/* Fase 2: Contract details (alleen als gesloten) */}
          {status === "partner" && (
            <div className="bg-gray-900 rounded-2xl p-6 border border-green-900/50 space-y-5">
              <h2 className="font-semibold text-green-400 text-sm uppercase tracking-wide">Contractgegevens</h2>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Bedrag (€) *</label>
                <input
                  required={status === "partner"}
                  type="number"
                  min="1"
                  value={form.bedrag}
                  onChange={(e) => update("bedrag", e.target.value)}
                  placeholder="500"
                  className={inputKlasse}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Frequentie *</label>
                <select value={form.frequentie} onChange={(e) => update("frequentie", e.target.value)} className={inputKlasse}>
                  <option value="maandelijks">Maandelijks</option>
                  <option value="jaarlijks">Jaarlijks</option>
                  <option value="eenmalig">Eenmalig</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Looptijd *</label>
                <select value={form.looptijd} onChange={(e) => update("looptijd", e.target.value)} className={inputKlasse}>
                  <option value="onbepaald">Onbepaalde tijd</option>
                  <option value="1jaar">1 jaar</option>
                  <option value="2jaar">2 jaar</option>
                  <option value="5jaar">5 jaar</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Betalingswijze *</label>
                <select value={form.betalingswijze} onChange={(e) => update("betalingswijze", e.target.value)} className={inputKlasse}>
                  <option value="sepa">SEPA automatische incasso</option>
                  <option value="overboeking">Bankoverschrijving</option>
                </select>
              </div>

              <div className="bg-green-950/30 border border-green-900/50 rounded-xl p-4 text-sm text-green-300">
                Partner ontvangt een email met een link om het contract digitaal te ondertekenen.
              </div>
            </div>
          )}

          {fout && <p className="text-red-400 text-sm">{fout}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 transition rounded-xl py-3 font-semibold"
          >
            {loading ? "Bezig..." : status === "partner" ? "Opslaan & contract versturen" : "Opslaan & bedankmail versturen"}
          </button>
        </form>
      </div>
    </main>
  );
}
