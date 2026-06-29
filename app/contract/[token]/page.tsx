import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import Image from "next/image";
import ContractOndertekenen from "./ContractOndertekenen";

async function getPartner(token: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
  const { data } = await supabase
    .from("partners")
    .select("*")
    .eq("contract_token", token)
    .eq("status", "partner")
    .single();
  return data;
}

function looptijdTekst(looptijd: string) {
  const map: Record<string, string> = {
    onbepaald: "Onbepaalde tijd, met een opzegtermijn van 1 maand",
    "1jaar": "1 jaar",
    "2jaar": "2 jaar",
    "5jaar": "5 jaar",
  };
  return map[looptijd] ?? looptijd;
}

function betalingswijzeTekst(bw: string) {
  return bw === "sepa" ? "SEPA automatische incasso" : "Bankoverschrijving";
}

export default async function ContractPagina({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const partner = await getPartner(token);
  if (!partner) notFound();

  const datum = new Date().toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
  const ingangsdatum = new Date(partner.created_at).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });

  if (partner.contract_ondertekend) {
    const ondertekendOp = new Date(partner.contract_ondertekend_op).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <Image src="/logo.png" alt="iThemba Kuluntu" width={80} height={80} className="mx-auto" />
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
            <div className="text-4xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-gray-900">Contract ondertekend</h2>
            <p className="text-gray-500 text-sm mt-2">Dit contract is ondertekend op <strong>{ondertekendOp}</strong> door <strong>{partner.contract_naam}</strong>.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="iThemba Kuluntu" width={80} height={80} className="mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">iThemba Kuluntu e.V.</h1>
          <p className="text-gray-500 text-sm">Am Emberg 20 · 57399 Kirchhundem · Duitsland</p>
        </div>

        {/* Contract */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 sm:p-12 mb-6">

          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">PARTNEROVEREENKOMST</h2>
          <p className="text-center text-gray-500 text-sm mb-8">iThemba Kuluntu e.V. — {datum}</p>

          <hr className="border-gray-200 mb-8" />

          <h3 className="font-bold text-gray-800 mb-4">Artikel 1 — Partijen</h3>
          <p className="text-gray-700 text-sm leading-relaxed mb-2">
            <strong>iThemba Kuluntu e.V.</strong>, een erkende liefdadigheidsorganisatie geregistreerd in Duitsland, gevestigd te Am Emberg 20, 57399 Kirchhundem, hierna te noemen <em>"iThemba"</em>;
          </p>
          <p className="text-gray-700 text-sm leading-relaxed mb-6">
            en <strong>{partner.bedrijfsnaam}</strong>, vertegenwoordigd door {partner.voornaam} {partner.achternaam}{partner.functie ? ` (${partner.functie})` : ""}, e-mail: {partner.email}, hierna te noemen <em>"Partner"</em>.
          </p>

          <h3 className="font-bold text-gray-800 mb-4">Artikel 2 — Doel van de samenwerking</h3>
          <p className="text-gray-700 text-sm leading-relaxed mb-6">
            Partner ondersteunt de missie van iThemba Kuluntu e.V. om gemeenschappen in Zuid-Afrika te versterken door middel van educatie, gezondheidszorg en duurzame ontwikkeling. Partner treedt op als <strong>{partner.type}</strong>.
          </p>

          <h3 className="font-bold text-gray-800 mb-4">Artikel 3 — Financiële bijdrage</h3>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <p className="text-gray-800 text-sm font-semibold">
              Partner verplicht zich tot een bijdrage van <span className="text-green-700 text-lg">€{parseFloat(partner.bedrag).toLocaleString("nl-NL")}</span> <span className="text-green-700">{partner.frequentie}</span>.
            </p>
          </div>

          <h3 className="font-bold text-gray-800 mb-4">Artikel 4 — Looptijd en opzegging</h3>
          <p className="text-gray-700 text-sm leading-relaxed mb-6">
            Deze overeenkomst gaat in op <strong>{ingangsdatum}</strong> en heeft een looptijd van <strong>{looptijdTekst(partner.looptijd)}</strong>.
            {partner.looptijd !== "onbepaald" && " Tussentijdse opzegging is niet mogelijk, tenzij schriftelijk anders overeengekomen."}
          </p>

          <h3 className="font-bold text-gray-800 mb-4">Artikel 5 — Betalingswijze</h3>
          <p className="text-gray-700 text-sm leading-relaxed mb-6">
            De betaling geschiedt via <strong>{betalingswijzeTekst(partner.betalingswijze)}</strong>.
            {partner.betalingswijze === "sepa" && " iThemba Kuluntu zal Partner benaderen voor het instellen van de SEPA-machtiging."}
            {partner.betalingswijze === "overboeking" && " iThemba Kuluntu zal de bankgegevens voor de overschrijving apart communiceren."}
          </p>

          <h3 className="font-bold text-gray-800 mb-4">Artikel 6 — Fiscale aftrekbaarheid</h3>
          <p className="text-gray-700 text-sm leading-relaxed mb-6">
            iThemba Kuluntu e.V. is een erkende liefdadigheidsorganisatie (gemeinnütziger Verein) in Duitsland. Bijdragen zijn fiscaal aftrekbaar conform de geldende belastingwetgeving. Partner ontvangt jaarlijks een officiële donatieverklaring (Zuwendungsbestätigung).
          </p>

          <h3 className="font-bold text-gray-800 mb-4">Artikel 7 — Toepasselijk recht</h3>
          <p className="text-gray-700 text-sm leading-relaxed mb-8">
            Op deze overeenkomst is Duits recht van toepassing (Deutsches Recht). Geschillen worden voorgelegd aan de bevoegde rechter in Duitsland.
          </p>

          <hr className="border-gray-200 mb-8" />

          {/* Handtekening sectie */}
          <ContractOndertekenen token={token} naam={`${partner.voornaam} ${partner.achternaam}`} bedrijf={partner.bedrijfsnaam} />
        </div>

        <p className="text-center text-gray-400 text-xs">
          Door te ondertekenen gaat u akkoord met de bovenstaande voorwaarden. Uw handtekening wordt geregistreerd met tijdstempel en IP-adres als geldig bewijs onder EU eIDAS-verordening.
        </p>
      </div>
    </main>
  );
}
