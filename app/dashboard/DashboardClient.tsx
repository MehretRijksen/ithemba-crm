"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

const typeBadge: Record<string, string> = {
  partner: "bg-blue-800 text-blue-200",
  donateur: "bg-yellow-800 text-yellow-200",
  beide: "bg-purple-800 text-purple-200",
};

export default function DashboardClient({ partners }: { partners: Record<string, string>[] }) {
  const [zoekterm, setZoekterm] = useState("");
  const [filterType, setFilterType] = useState("alle");
  const router = useRouter();
  const supabase = createClient();

  async function handleUitloggen() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const gefilterd = partners.filter((p) => {
    const matchZoek =
      zoekterm === "" ||
      `${p.voornaam} ${p.achternaam} ${p.bedrijfsnaam} ${p.email}`
        .toLowerCase()
        .includes(zoekterm.toLowerCase());
    const matchType = filterType === "alle" || p.type === filterType;
    return matchZoek && matchType;
  });

  return (
    <main className="min-h-screen bg-gray-950 text-white px-4 py-10">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Ithemba Kuluntu</h1>
            <p className="text-gray-400 mt-1">{partners.length} partners & donateurs geregistreerd</p>
          </div>
          <div className="flex gap-3">
            <a href="/partner/nieuw" className="bg-green-600 hover:bg-green-500 transition px-4 py-2 rounded-lg text-sm font-semibold">
              + Nieuwe partner
            </a>
            <button
              onClick={handleUitloggen}
              className="bg-gray-800 hover:bg-gray-700 transition px-4 py-2 rounded-lg text-sm font-semibold text-gray-300"
            >
              Uitloggen
            </button>
          </div>
        </div>

        {/* Zoeken & filteren */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Zoek op naam, bedrijf of email..."
            value={zoekterm}
            onChange={(e) => setZoekterm(e.target.value)}
            className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="alle">Alle types</option>
            <option value="partner">Partner</option>
            <option value="donateur">Donateur</option>
            <option value="beide">Partner & Donateur</option>
          </select>
        </div>

        {/* Tabel */}
        {gefilterd.length === 0 ? (
          <div className="text-center text-gray-500 py-20">
            <div className="text-4xl mb-4">📭</div>
            <p>{partners.length === 0 ? "Nog geen partners geregistreerd." : "Geen resultaten gevonden."}</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-800">
            <table className="w-full text-sm">
              <thead className="bg-gray-900 text-gray-400">
                <tr>
                  <th className="text-left px-4 py-3">Naam</th>
                  <th className="text-left px-4 py-3">Bedrijf</th>
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-left px-4 py-3">Telefoon</th>
                  <th className="text-left px-4 py-3">Type</th>
                  <th className="text-left px-4 py-3">Datum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {gefilterd.map((p) => (
                  <tr key={p.id} className="bg-gray-900 hover:bg-gray-800 transition">
                    <td className="px-4 py-3 font-medium">{p.voornaam} {p.achternaam}</td>
                    <td className="px-4 py-3 text-gray-300">{p.bedrijfsnaam}</td>
                    <td className="px-4 py-3 text-gray-300">{p.email}</td>
                    <td className="px-4 py-3 text-gray-300">{p.telefoon || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeBadge[p.type] ?? "bg-gray-700 text-gray-300"}`}>
                        {p.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{new Date(p.created_at).toLocaleDateString("nl-NL")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
