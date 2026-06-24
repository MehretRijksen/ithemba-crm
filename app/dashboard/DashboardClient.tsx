"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const typeBadge: Record<string, string> = {
  partner: "bg-blue-900/60 text-blue-300 border border-blue-700",
  donateur: "bg-amber-900/60 text-amber-300 border border-amber-700",
  beide: "bg-purple-900/60 text-purple-300 border border-purple-700",
};

type Partner = Record<string, string>;
type SortKey = "naam" | "bedrijfsnaam" | "type" | "created_at";

function exporteerCSV(partners: Partner[]) {
  const kolommen = ["Voornaam", "Achternaam", "Bedrijfsnaam", "Functie", "Email", "Telefoon", "Website", "Type", "Opmerkingen", "Datum"];
  const velden = ["voornaam", "achternaam", "bedrijfsnaam", "functie", "email", "telefoon", "website", "type", "opmerkingen", "created_at"];

  const csvRijen = [
    kolommen.join(";"),
    ...partners.map((p) =>
      velden.map((v) => {
        const waarde = v === "created_at"
          ? new Date(p[v]).toLocaleDateString("nl-NL")
          : (p[v] ?? "");
        return `"${String(waarde).replace(/"/g, '""')}"`;
      }).join(";")
    ),
  ];

  const blob = new Blob(["﻿" + csvRijen.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ithemba-partners-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function DashboardClient({ partners, gebruiker }: { partners: Partner[]; gebruiker: string }) {
  const [zoekterm, setZoekterm] = useState("");
  const [filterType, setFilterType] = useState("alle");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortAsc, setSortAsc] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleUitloggen() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  }

  const gefilterd = partners
    .filter((p) => {
      const matchZoek =
        zoekterm === "" ||
        `${p.voornaam} ${p.achternaam} ${p.bedrijfsnaam} ${p.email}`
          .toLowerCase()
          .includes(zoekterm.toLowerCase());
      const matchType = filterType === "alle" || p.type === filterType;
      return matchZoek && matchType;
    })
    .sort((a, b) => {
      const valA = sortKey === "naam" ? `${a.voornaam} ${a.achternaam}` : a[sortKey] ?? "";
      const valB = sortKey === "naam" ? `${b.voornaam} ${b.achternaam}` : b[sortKey] ?? "";
      return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

  const stats = {
    totaal: partners.length,
    partner: partners.filter((p) => p.type === "partner").length,
    donateur: partners.filter((p) => p.type === "donateur").length,
    beide: partners.filter((p) => p.type === "beide").length,
  };

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (sortAsc ? <span> ↑</span> : <span> ↓</span>) : <span className="opacity-30"> ↕</span>;

  return (
    <main className="min-h-screen bg-gray-950 text-white">

      {/* Topbalk */}
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Ithemba Kuluntu" width={36} height={36} className="rounded-full" />
            <div>
              <div className="font-bold text-sm leading-tight">Ithemba Kuluntu</div>
              <div className="text-xs text-gray-400 leading-tight">Partner CRM</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400 hidden sm:block">Welkom, <span className="text-white font-medium">{gebruiker}</span></span>
            <button
              onClick={handleUitloggen}
              className="bg-gray-800 hover:bg-gray-700 transition px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300"
            >
              Uitloggen
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Paginatitel + acties */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">Partners & Donateurs</h1>
            <p className="text-gray-400 text-sm mt-1">{partners.length} contacten in totaal</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => exporteerCSV(partners)}
              className="bg-gray-800 hover:bg-gray-700 transition px-4 py-2 rounded-lg text-sm font-medium text-gray-300 flex items-center gap-2"
            >
              <span>↓</span> Exporteer CSV
            </button>
            <Link
              href={`/partner/nieuw?token=${process.env.NEXT_PUBLIC_FORM_TOKEN}`}
              className="bg-green-600 hover:bg-green-500 transition px-4 py-2 rounded-lg text-sm font-semibold"
            >
              + Nieuwe partner
            </Link>
          </div>
        </div>

        {/* Statistieken */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Totaal", value: stats.totaal, kleur: "from-gray-800 to-gray-900", tekst: "text-white" },
            { label: "Partners", value: stats.partner, kleur: "from-blue-900 to-blue-950", tekst: "text-blue-300" },
            { label: "Donateurs", value: stats.donateur, kleur: "from-amber-900 to-amber-950", tekst: "text-amber-300" },
            { label: "Partner & Donateur", value: stats.beide, kleur: "from-purple-900 to-purple-950", tekst: "text-purple-300" },
          ].map((s) => (
            <div key={s.label} className={`bg-gradient-to-br ${s.kleur} rounded-2xl p-5 border border-white/5`}>
              <div className={`text-3xl font-bold ${s.tekst}`}>{s.value}</div>
              <div className="text-sm text-gray-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Zoeken & filteren */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <input
            type="text"
            placeholder="Zoek op naam, bedrijf of email..."
            value={zoekterm}
            onChange={(e) => setZoekterm(e.target.value)}
            className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-600"
          >
            <option value="alle">Alle types</option>
            <option value="partner">Partner</option>
            <option value="donateur">Donateur</option>
            <option value="beide">Partner & Donateur</option>
          </select>
        </div>

        {/* Resultaattekst */}
        {zoekterm || filterType !== "alle" ? (
          <p className="text-sm text-gray-500 mb-3">{gefilterd.length} resultaten</p>
        ) : null}

        {/* Tabel */}
        {gefilterd.length === 0 ? (
          <div className="text-center text-gray-500 py-24 border border-gray-800 rounded-2xl">
            <div className="text-4xl mb-4">📭</div>
            <p>{partners.length === 0 ? "Nog geen partners geregistreerd." : "Geen resultaten gevonden."}</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-gray-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-900 text-gray-400 border-b border-gray-800">
                  <th className="text-left px-4 py-3 cursor-pointer hover:text-white" onClick={() => handleSort("naam")}>
                    Naam <SortIcon k="naam" />
                  </th>
                  <th className="text-left px-4 py-3 cursor-pointer hover:text-white" onClick={() => handleSort("bedrijfsnaam")}>
                    Bedrijf <SortIcon k="bedrijfsnaam" />
                  </th>
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-left px-4 py-3">Telefoon</th>
                  <th className="text-left px-4 py-3 cursor-pointer hover:text-white" onClick={() => handleSort("type")}>
                    Type <SortIcon k="type" />
                  </th>
                  <th className="text-left px-4 py-3 cursor-pointer hover:text-white" onClick={() => handleSort("created_at")}>
                    Datum <SortIcon k="created_at" />
                  </th>
                  <th className="text-left px-4 py-3">Acties</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {gefilterd.map((p) => (
                  <tr key={p.id} className="bg-gray-900 hover:bg-gray-800/60 transition">
                    <td className="px-4 py-3 font-medium">{p.voornaam} {p.achternaam}</td>
                    <td className="px-4 py-3 text-gray-300">{p.bedrijfsnaam}</td>
                    <td className="px-4 py-3 text-gray-400">{p.email}</td>
                    <td className="px-4 py-3 text-gray-400">{p.telefoon || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${typeBadge[p.type] ?? "bg-gray-700 text-gray-300"}`}>
                        {p.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{new Date(p.created_at).toLocaleDateString("nl-NL")}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <Link href={`/dashboard/partner/${p.id}`} className="text-blue-400 hover:text-blue-300 text-xs font-medium">
                          Bekijk
                        </Link>
                        <Link href={`/dashboard/partner/${p.id}/bewerken`} className="text-amber-400 hover:text-amber-300 text-xs font-medium">
                          Bewerk
                        </Link>
                      </div>
                    </td>
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
