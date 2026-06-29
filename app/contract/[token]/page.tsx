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
      <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <Image src="/logo.png" alt="iThemba Kuluntu" width={80} height={80} className="mx-auto" />
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <div className="text-4xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-slate-900">Contract ondertekend</h2>
            <p className="text-slate-500 text-sm mt-2">Dit contract is ondertekend op <strong>{ondertekendOp}</strong> door <strong>{partner.contract_naam}</strong>.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="iThemba Kuluntu" width={72} height={72} className="mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900">iThemba Kuluntu e.V.</h1>
          <p className="text-slate-500 text-sm mt-1">Am Emberg 20 · 57399 Kirchhundem · Duitsland</p>
        </div>

        {/* Contract document */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">

          {/* Blauwe balk bovenaan */}
          <div className="bg-blue-700 h-2" />

          <div className="p-8 sm:p-12">
            <h2 className="text-2xl font-bold text-center text-slate-900 mb-2">PARTNEROVEREENKOMST</h2>
            <p className="text-center text-slate-400 text-sm mb-8">iThemba Kuluntu e.V. — {datum}</p>

            <hr className="border-slate-100 mb-8" />

            <div className="space-y-8 text-sm">

              <div>
                <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">1</span>
                  Artikel 1 — Partijen
                </h3>
                <p className="text-slate-700 leading-relaxed mb-2">
                  <strong>iThemba Kuluntu e.V.</strong>, een erkende liefdadigheidsorganisatie geregistreerd in Duitsland, gevestigd te Am Emberg 20, 57399 Kirchhundem, hierna te noemen <em>&ldquo;iThemba&rdquo;</em>;
                </p>
                <p className="text-slate-700 leading-relaxed">
                  en <strong>{partner.bedrijfsnaam}</strong>, vertegenwoordigd door {partner.voornaam} {partner.achternaam}{partner.functie ? ` (${partner.functie})` : ""}, e-mail: {partner.email}, hierna te noemen <em>&ldquo;Partner&rdquo;</em>.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">2</span>
                  Artikel 2 — Doel van de samenwerking
                </h3>
                <p className="text-slate-700 leading-relaxed">
                  Partner ondersteunt de missie van iThemba Kuluntu e.V. om gemeenschappen in Zuid-Afrika te versterken door middel van educatie, gezondheidszorg en duurzame ontwikkeling. Partner treedt op als <strong>{partner.type}</strong>.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">3</span>
                  Artikel 3 — Financiële bijdrage
                </h3>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-slate-800 font-semibold">
                    Partner verplicht zich tot een bijdrage van{" "}
                    <span className="text-blue-700 text-lg">€{parseFloat(partner.bedrag).toLocaleString("nl-NL")}</span>{" "}
                    <span className="text-blue-700">{partner.frequentie}</span>.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">4</span>
                  Artikel 4 — Looptijd en opzegging
                </h3>
                <p className="text-slate-700 leading-relaxed">
                  Deze overeenkomst gaat in op <strong>{ingangsdatum}</strong> en heeft een looptijd van <strong>{looptijdTekst(partner.looptijd)}</strong>.
                  {partner.looptijd !== "onbepaald" && " Tussentijdse opzegging is niet mogelijk, tenzij schriftelijk anders overeengekomen."}
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">5</span>
                  Artikel 5 — Betalingswijze
                </h3>
                <p className="text-slate-700 leading-relaxed">
                  De betaling geschiedt via <strong>{betalingswijzeTekst(partner.betalingswijze)}</strong>.
                  {partner.betalingswijze === "sepa" && " iThemba Kuluntu zal Partner benaderen voor het instellen van de SEPA-machtiging."}
                  {partner.betalingswijze === "overboeking" && " iThemba Kuluntu zal de bankgegevens voor de overschrijving apart communiceren."}
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">6</span>
                  Artikel 6 — Fiscale aftrekbaarheid
                </h3>
                <p className="text-slate-700 leading-relaxed">
                  iThemba Kuluntu e.V. is een erkende liefdadigheidsorganisatie (gemeinnütziger Verein) in Duitsland. Bijdragen zijn fiscaal aftrekbaar conform de geldende belastingwetgeving. Partner ontvangt jaarlijks een officiële donatieverklaring (Zuwendungsbestätigung).
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">7</span>
                  Artikel 7 — Toepasselijk recht
                </h3>
                <p className="text-slate-700 leading-relaxed">
                  Op deze overeenkomst is Duits recht van toepassing (Deutsches Recht). Geschillen worden voorgelegd aan de bevoegde rechter in Duitsland.
                </p>
              </div>
            </div>

            <hr className="border-slate-100 my-8" />

            <ContractOndertekenen token={token} naam={`${partner.voornaam} ${partner.achternaam}`} bedrijf={partner.bedrijfsnaam} />
          </div>
        </div>

        <p className="text-center text-slate-400 text-xs">
          Door te ondertekenen gaat u akkoord met de bovenstaande voorwaarden. Uw handtekening wordt geregistreerd met tijdstempel en IP-adres als geldig bewijs onder EU eIDAS-verordening.
        </p>
      </div>
    </main>
  );
}
