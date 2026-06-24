"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { use } from "react";

export default function PartnerBewerken({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [form, setForm] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/partner/${id}`).then((r) => r.json()).then((d) => setForm(d));
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/partner/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      router.push(`/dashboard/partner/${id}`);
    } else {
      setStatus("error");
      setLoading(false);
    }
  }

  if (!form) return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <p className="text-gray-400">Laden...</p>
    </main>
  );

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Topbalk */}
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Ithemba Kuluntu" width={36} height={36} className="rounded-full" />
            <div>
              <div className="font-bold text-sm leading-tight">Ithemba Kuluntu</div>
              <div className="text-xs text-gray-400 leading-tight">Partner CRM</div>
            </div>
          </div>
          <Link href={`/dashboard/partner/${id}`} className="text-gray-400 hover:text-white text-sm">
            ← Terug
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Partner bewerken</h1>

        <form onSubmit={handleSubmit} className="bg-gray-900 rounded-2xl p-8 space-y-5 border border-gray-800">
          {[
            { name: "voornaam", label: "Voornaam", required: true },
            { name: "achternaam", label: "Achternaam", required: true },
            { name: "bedrijfsnaam", label: "Bedrijfsnaam", required: true },
            { name: "functie", label: "Functie" },
            { name: "email", label: "Email", type: "email", required: true },
            { name: "telefoon", label: "Telefoon" },
            { name: "website", label: "Website" },
          ].map(({ name, label, type, required }) => (
            <div key={name}>
              <label className="block text-sm text-gray-400 mb-1">{label}{required ? " *" : ""}</label>
              <input
                name={name}
                type={type ?? "text"}
                required={required}
                value={form[name] ?? ""}
                onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                className="w-full bg-gray-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-600 border border-gray-700"
              />
            </div>
          ))}

          <div>
            <label className="block text-sm text-gray-400 mb-1">Type *</label>
            <select
              value={form.type ?? ""}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              required
              className="w-full bg-gray-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-600 border border-gray-700"
            >
              <option value="partner">Partner</option>
              <option value="donateur">Donateur</option>
              <option value="beide">Partner & Donateur</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Opmerkingen</label>
            <textarea
              value={form.opmerkingen ?? ""}
              onChange={(e) => setForm({ ...form, opmerkingen: e.target.value })}
              rows={3}
              className="w-full bg-gray-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-600 border border-gray-700 resize-none"
            />
          </div>

          {status === "error" && <p className="text-red-400 text-sm">Er is iets misgegaan. Probeer opnieuw.</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 transition rounded-xl py-3 font-semibold"
          >
            {loading ? "Opslaan..." : "Opslaan"}
          </button>
        </form>
      </div>
    </main>
  );
}
