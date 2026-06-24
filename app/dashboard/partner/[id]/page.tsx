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
  partner: "bg-blue-900/60 text-blue-300 border border-blue-700",
  donateur: "bg-amber-900/60 text-amber-300 border border-amber-700",
  beide: "bg-purple-900/60 text-purple-300 border border-purple-700",
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

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Topbalk */}
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Ithemba Kuluntu" width={36} height={36} className="rounded-full" />
            <div>
              <div className="font-bold text-sm leading-tight">Ithemba Kuluntu</div>
              <div className="text-xs text-gray-400 leading-tight">Partner CRM</div>
            </div>
          </div>
          <Link href="/dashboard" className="text-gray-400 hover:text-white text-sm">
            ← Dashboard
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Acties */}
        <div className="flex justify-end gap-3 mb-6">
          <Link
            href={`/dashboard/partner/${id}/bewerken`}
            className="bg-amber-600 hover:bg-amber-500 transition px-4 py-2 rounded-lg text-sm font-semibold"
          >
            Bewerken
          </Link>
          <VerwijderKnop id={id} naam={`${partner.voornaam} ${partner.achternaam}`} />
        </div>

        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
          {/* Profielkop */}
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-800">
            <div className="bg-gradient-to-br from-green-700 to-green-900 rounded-full w-16 h-16 flex items-center justify-center text-xl font-bold shrink-0">
              {partner.voornaam[0]}{partner.achternaam[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{partner.voornaam} {partner.achternaam}</h1>
              <p className="text-gray-400 text-sm mt-0.5">{partner.bedrijfsnaam}</p>
              <span className={`inline-block mt-2 px-2.5 py-1 rounded-full text-xs font-medium ${typeBadge[partner.type] ?? "bg-gray-700 text-gray-300"}`}>
                {partner.type}
              </span>
            </div>
          </div>

          {/* Velden */}
          <div className="space-y-4">
            {velden.map(({ label, waarde }) => waarde ? (
              <div key={label} className="flex gap-4 pb-4 border-b border-gray-800/60 last:border-0 last:pb-0">
                <span className="text-gray-400 text-sm w-36 shrink-0 pt-0.5">{label}</span>
                <span className="text-white text-sm break-all">{waarde}</span>
              </div>
            ) : null)}
          </div>
        </div>
      </div>
    </main>
  );
}
