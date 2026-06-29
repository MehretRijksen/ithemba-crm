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
      <div className="text-center py-8">
        <div className="text-5xl mb-4">✅</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Contract ondertekend!</h3>
        <p className="text-gray-500 text-sm">U ontvangt een bevestiging per email. Welkom als partner van iThemba Kuluntu!</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-bold text-gray-800 mb-4">Ondertekening</h3>
      <p className="text-gray-600 text-sm mb-2">
        Namens <strong>{bedrijf}</strong> verklaar ik akkoord te gaan met bovenstaande overeenkomst.
      </p>
      <p className="text-gray-500 text-sm mb-6">
        Typ uw volledige naam ter bevestiging: <strong className="text-gray-800">{naam}</strong>
      </p>

      <form onSubmit={handleOndertekenen} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Handtekening (volledige naam) *</label>
          <input
            required
            type="text"
            value={handtekening}
            onChange={(e) => setHandtekening(e.target.value)}
            placeholder={naam}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-green-500"
            style={{ fontFamily: "Georgia, serif" }}
          />
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={akkoord}
            onChange={(e) => setAkkoord(e.target.checked)}
            className="mt-1"
          />
          <span className="text-sm text-gray-600">
            Ik ga akkoord met de bovenstaande partnerovereenkomst en bevestig dat ik bevoegd ben namens <strong>{bedrijf}</strong> te ondertekenen.
          </span>
        </label>

        {fout && <p className="text-red-500 text-sm">{fout}</p>}

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition text-base"
        >
          {status === "loading" ? "Bezig met ondertekenen..." : "✍️ Contract ondertekenen"}
        </button>
      </form>
    </div>
  );
}
