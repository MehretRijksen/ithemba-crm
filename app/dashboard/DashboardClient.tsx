"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const typeBadge: Record<string, string> = {
  partner: "bg-blue-100 text-blue-700",
  donateur: "bg-amber-100 text-amber-700",
  beide: "bg-purple-100 text-purple-700",
};

const statusBadge: Record<string, string> = {
  prospect: "bg-slate-100 text-slate-600",
  partner: "bg-green-100 text-green-700",
};

type Partner = Record<string, string>;
type SortKey = "naam" | "bedrijfsnaam" | "type" | "created_at";

function exporteerCSV(partners: Partner[]) {
  const kolommen = ["Voornaam", "Achternaam", "Bedrijfsnaam", "Functie", "Email", "Telefoon", "Website", "Type", "Status", "Opmerkingen", "Datum"];
  const velden = ["voornaam", "achternaam", "bedrijfsnaam", "functie", "email", "telefoon", "website", "type", "status", "opmerkingen", "created_at"];

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
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* Topbalk */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Ithemba Kuluntu" width={36} height={36} className="rounded-full" />
            <div>
              <div className="font-bold text-sm leading-tight text-slate-900">Ithemba Kuluntu</div>
              <div className="text-xs text-slate-500 leading-tight">Partner CRM</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 hidden sm:block">Welkom, <span className="text-slate-800 font-medium">{gebruiker}</span></span>
            <button
              onClick={handleUitloggen}
              className="border border-slate-200 hover:bg-slate-50 transition px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600"
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
            <h1 className="text-2xl font-bold text-slate-900">Partners & Donateurs</h1>
            <p className="text-slate-500 text-sm mt-1">{partners.length} contacten in totaal</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => exporteerCSV(partners)}
              className="border border-slate-200 bg-white hover:bg-slate-50 transition px-4 py-2 rounded-xl text-sm font-medium text-slate-600 flex items-center gap-2"
            >
              <span>↓</span> Exporteer CSV
            </button>
            <Link
              href="/dashboard/partner/nieuw"
              className="bg-blue-700 hover:bg-blue-600 transition px-4 py-2 rounded-xl text-sm font-semibold text-white"
            >
              + Nieuwe partner
            </Link>
          </div>
        </div>

        {/* Statistieken */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Totaal", value: stats.totaal, kleur: "bg-slate-900", tekst: "text-white", sub: "text-slate-400" },
            { label: "Partners", value: stats.partner, kleur: "bg-blue-700", tekst: "text-white", sub: "text-blue-200" },
            { label: "Donateurs", value: stats.donateur, kleur: "bg-white border border-slate-200", tekst: "text-amber-600", sub: "text-slate-500" },
            { label: "Partner & Donateur", value: stats.beide, kleur: "bg-white border border-slate-200", tekst: "text-purple-600", sub: "text-slate-500" },
          ].map((s) => (
            <div key={s.label} className={`${s.kleur} rounded-2xl p-5 shadow-sm`}>
              <div className={`text-3xl font-bold ${s.tekst}`}>{s.value}</div>
              <div className={`text-sm mt-1 ${s.sub}`}>{s.label}</div>
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
            className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="alle">Alle types</option>
            <option value="partner">Partner</option>
            <option value="donateur">Donateur</option>
            <option value="beide">Partner & Donateur</option>
          </select>
        </div>

        {/* Resultaattekst */}
        {(zoekterm || filterType !== "alle") ? (
          <p className="text-sm text-slate-400 mb-3">{gefilterd.length} resultaten</p>
        ) : null}

        {/* Tabel */}
        {gefilterd.length === 0 ? (
          <div className="text-center text-slate-400 py-24 bg-white border border-slate-200 rounded-2xl">
            <div className="text-4xl mb-4">📭</div>
            <p>{partners.length === 0 ? "Nog geen partners geregistreerd." : "Geen resultaten gevonden."}</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <th className="text-left px-4 py-3 cursor-pointer hover:text-slate-900 font-medium" onClick={() => handleSort("naam")}>
                    Naam <SortIcon k="naam" />
                  </th>
                  <th className="text-left px-4 py-3 cursor-pointer hover:text-slate-900 font-medium" onClick={() => handleSort("bedrijfsnaam")}>
                    Bedrijf <SortIcon k="bedrijfsnaam" />
                  </th>
                  <th className="text-left px-4 py-3 font-medium">Email</th>
                  <th className="text-left px-4 py-3 font-medium">Telefoon</th>
                  <th className="text-left px-4 py-3 cursor-pointer hover:text-slate-900 font-medium" onClick={() => handleSort("type")}>
                    Type <SortIcon k="type" />
                  </th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 cursor-pointer hover:text-slate-900 font-medium" onClick={() => handleSort("created_at")}>
                    Datum <SortIcon k="created_at" />
                  </th>
                  <th className="text-left px-4 py-3 font-medium">Acties</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {gefilterd.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-medium text-slate-900">{p.voornaam} {p.achternaam}</td>
                    <td className="px-4 py-3 text-slate-600">{p.bedrijfsnaam}</td>
                    <td className="px-4 py-3 text-slate-500">{p.email}</td>
                    <td className="px-4 py-3 text-slate-500">{p.telefoon || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${typeBadge[p.type] ?? "bg-slate-100 text-slate-600"}`}>
                        {p.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge[p.status] ?? "bg-slate-100 text-slate-600"}`}>
                        {p.status === "partner" ? "gesloten" : p.status ?? "prospect"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{new Date(p.created_at).toLocaleDateString("nl-NL")}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <Link href={`/dashboard/partner/${p.id}`} className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                          Bekijk
                        </Link>
                        <Link href={`/dashboard/partner/${p.id}/bewerken`} className="text-slate-500 hover:text-slate-700 text-xs font-medium">
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
