import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
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
  partner: "bg-blue-800 text-blue-200",
  donateur: "bg-yellow-800 text-yellow-200",
  beide: "bg-purple-800 text-purple-200",
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
    { label: "Type", waarde: partner.type },
    { label: "Opmerkingen", waarde: partner.opmerkingen },
    { label: "Geregistreerd op", waarde: new Date(partner.created_at).toLocaleDateString("nl-NL") },
  ];

  return (
    <main className="min-h-screen bg-gray-950 text-white px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link href="/dashboard" className="text-gray-400 hover:text-white text-sm">
            ← Terug naar dashboard
          </Link>
          <div className="flex gap-3">
            <Link
              href={`/dashboard/partner/${id}/bewerken`}
              className="bg-yellow-600 hover:bg-yellow-500 transition px-4 py-2 rounded-lg text-sm font-semibold"
            >
              Bewerken
            </Link>
            <VerwijderKnop id={id} naam={`${partner.voornaam} ${partner.achternaam}`} />
          </div>
        </div>

        <div className="bg-gray-900 rounded-2xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-green-800 rounded-full w-14 h-14 flex items-center justify-center text-xl font-bold">
              {partner.voornaam[0]}{partner.achternaam[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{partner.voornaam} {partner.achternaam}</h1>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeBadge[partner.type] ?? "bg-gray-700 text-gray-300"}`}>
                {partner.type}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {velden.map(({ label, waarde }) => waarde ? (
              <div key={label} className="flex gap-4 border-b border-gray-800 pb-4">
                <span className="text-gray-400 w-36 shrink-0">{label}</span>
                <span className="text-white break-all">{waarde}</span>
              </div>
            ) : null)}
          </div>
        </div>
      </div>
    </main>
  );
}
