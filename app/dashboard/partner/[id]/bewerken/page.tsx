"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
    <main className="min-h-screen bg-gray-950 text-white px-4 py-10">
      <div className="max-w-xl mx-auto">
        <Link href={`/dashboard/partner/${id}`} className="text-gray-400 hover:text-white text-sm mb-6 block">
          ← Terug
        </Link>

        <h1 className="text-2xl font-bold mb-6">Partner bewerken</h1>

        <form onSubmit={handleSubmit} className="bg-gray-900 rounded-2xl p-8 space-y-5">
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
                className="w-full bg-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          ))}

          <div>
            <label className="block text-sm text-gray-400 mb-1">Type *</label>
            <select
              value={form.type ?? ""}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              required
              className="w-full bg-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
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
              className="w-full bg-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
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
