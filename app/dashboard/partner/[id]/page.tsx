import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import VerwijderKnop from "./VerwijderKnop";

async function getPartner(id: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
  const { data } = await supabase.from("partners").select("*").eq("id", id).single();
  return data;
}

const typeBadge: Record<string, string> = {
  partner: "bg-blue-100 text-blue-700",
  donateur: "bg-amber-100 text-amber-700",
  beide: "bg-purple-100 text-purple-700",
};

const statusBadge: Record<string, string> = {
  prospect: "bg-slate-100 text-slate-600",
  partner: "bg-green-100 text-green-700",
};

export default async function PartnerDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const partner = await getPartner(id);
  if (!partner) notFound();

  const velden = [
    { label: "Voornaam", waarde: partner.voornaam },
    { label: "Achternaam", waarde: partner.achternaam },
    { label: "Bedrijf", waarde: partner.bedrijfsnaam },
    { label: "Functie", waarde: partner.functie },
    { label: "Email", waarde: partner.email },
    { label: "Telefoon", waarde: partner.telefoon },
    { label: "Website", waarde: partner.website },
    { label: "Opmerkingen", waarde: partner.opmerkingen },
    { label: "Geregistreerd op", waarde: new Date(partner.created_at).toLocaleDateString("nl-NL") },
  ];

  const contractVelden = partner.status === "partner" ? [
    { label: "Bijdrage", waarde: partner.bedrag ? `€${parseFloat(partner.bedrag).toLocaleString("nl-NL")} ${partner.frequentie}` : null },
    { label: "Looptijd", waarde: partner.looptijd },
    { label: "Betalingswijze", waarde: partner.betalingswijze },
    { label: "Contract ondertekend", waarde: partner.contract_ondertekend ? `Ja — ${new Date(partner.contract_ondertekend_op).toLocaleDateString("nl-NL")} door ${partner.contract_naam}` : "Nee" },
  ] : [];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Ithemba Kuluntu" width={36} height={36} className="rounded-full" />
            <div>
              <div className="font-bold text-sm leading-tight text-slate-900">Ithemba Kuluntu</div>
              <div className="text-xs text-slate-500 leading-tight">Partner CRM</div>
            </div>
          </div>
          <Link href="/dashboard" className="text-slate-500 hover:text-slate-700 text-sm">
            ← Dashboard
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex justify-end gap-3 mb-6">
          <Link
            href={`/dashboard/partner/${id}/bewerken`}
            className="border border-slate-200 bg-white hover:bg-slate-50 transition px-4 py-2 rounded-xl text-sm font-medium text-slate-700"
          >
            Bewerken
          </Link>
          <VerwijderKnop id={id} naam={`${partner.voornaam} ${partner.achternaam}`} />
        </div>

        {/* Profielkop */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-4">
          <div className="bg-blue-700 h-16" />
          <div className="px-8 pb-8">
            <div className="-mt-8 mb-4 flex items-end justify-between">
              <div className="bg-white rounded-2xl w-16 h-16 flex items-center justify-center text-xl font-bold text-blue-700 border-2 border-white shadow-sm ring-1 ring-slate-200">
                {partner.voornaam?.[0]}{partner.achternaam?.[0]}
              </div>
              <div className="flex gap-2 mt-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${typeBadge[partner.type] ?? "bg-slate-100 text-slate-600"}`}>
                  {partner.type}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge[partner.status] ?? "bg-slate-100 text-slate-600"}`}>
                  {partner.status === "partner" ? "gesloten" : partner.status ?? "prospect"}
                </span>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{partner.voornaam} {partner.achternaam}</h1>
            <p className="text-slate-500 text-sm mt-0.5">{partner.bedrijfsnaam}</p>
          </div>
        </div>

        {/* Gegevens */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 mb-4">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-5">Contactgegevens</h2>
          <div className="space-y-4">
            {velden.map(({ label, waarde }) => waarde ? (
              <div key={label} className="flex gap-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                <span className="text-slate-400 text-sm w-36 shrink-0 pt-0.5">{label}</span>
                <span className="text-slate-800 text-sm break-all">{waarde}</span>
              </div>
            ) : null)}
          </div>
        </div>

        {/* Contractgegevens */}
        {contractVelden.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-5">Contractgegevens</h2>
            <div className="space-y-4">
              {contractVelden.map(({ label, waarde }) => waarde ? (
                <div key={label} className="flex gap-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                  <span className="text-slate-400 text-sm w-36 shrink-0 pt-0.5">{label}</span>
                  <span className="text-slate-800 text-sm break-all">{waarde}</span>
                </div>
              ) : null)}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
