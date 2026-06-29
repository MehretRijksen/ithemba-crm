"use client";
import { useState } from "react";

export default function ContractOndertekenen({ token, naam, bedrijf }: { token: string; naam: string; bedrijf: string }) {
  const [handtekening, setHandtekening] = useState("");
  const [akkoord, setAkkoord] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [fout, setFout] = useState("");

  async function handleOndertekenen(e: React.FormEvent) {
    e.preventDefault();
    if (!akkoord) {
      setFout("Vink het vakje aan om akkoord te gaan.");
      return;
    }
    if (handtekening.trim().toLowerCase() !== naam.toLowerCase()) {
      setFout(`Typ uw volledige naam exact zoals weergegeven: "${naam}"`);
      return;
    }
    setStatus("loading");
    setFout("");

    const res = await fetch(`/api/contract/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ naam: handtekening }),
    });

    if (res.ok) {
      setStatus("success");
    } else {
      const json = await res.json().catch(() => ({}));
      setFout(json.error || "Er is iets misgegaan.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="text-center py-10 bg-green-50 rounded-2xl border border-green-200">
        <div className="text-5xl mb-4">✅</div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Contract ondertekend!</h3>
        <p className="text-slate-500 text-sm">U ontvangt een bevestiging per email. Welkom als partner van iThemba Kuluntu!</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
      <h3 className="font-bold text-slate-800 mb-3">Digitale ondertekening</h3>
      <p className="text-slate-600 text-sm mb-2">
        Namens <strong>{bedrijf}</strong> verklaar ik akkoord te gaan met bovenstaande overeenkomst.
      </p>
      <p className="text-slate-500 text-sm mb-6">
        Typ uw volledige naam ter bevestiging: <strong className="text-slate-800">{naam}</strong>
      </p>

      <form onSubmit={handleOndertekenen} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Handtekening (volledige naam) *</label>
          <input
            required
            type="text"
            value={handtekening}
            onChange={(e) => setHandtekening(e.target.value)}
            placeholder={naam}
            className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-900 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
            style={{ fontFamily: "Georgia, serif" }}
          />
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={akkoord}
            onChange={(e) => setAkkoord(e.target.checked)}
            className="mt-1 accent-blue-700"
          />
          <span className="text-sm text-slate-600">
            Ik ga akkoord met de bovenstaande partnerovereenkomst en bevestig dat ik bevoegd ben namens <strong>{bedrijf}</strong> te ondertekenen.
          </span>
        </label>

        {fout && <p className="text-red-500 text-sm">{fout}</p>}

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition text-base"
        >
          {status === "loading" ? "Bezig met ondertekenen..." : "✍️ Contract ondertekenen"}
        </button>
      </form>
    </div>
  );
}
