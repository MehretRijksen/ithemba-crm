import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

const VERPLICHTE_VELDEN = ["voornaam", "achternaam", "bedrijfsnaam", "email", "type"];
const TOEGESTANE_ORIGINS = [
  "https://ithemba-crm.vercel.app",
  "http://localhost:3000",
];

function getIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "onbekend"
  );
}

export async function POST(req: NextRequest) {
  // CSRF: controleer origin
  const origin = req.headers.get("origin") || "";
  if (!TOEGESTANE_ORIGINS.includes(origin)) {
    return NextResponse.json({ error: "Niet toegestaan." }, { status: 403 });
  }

  const ip = getIP(req);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  // Rate limiting: max 5 verzoeken per IP per uur
  const eenUurGeleden = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("form_submissions")
    .select("*", { count: "exact", head: true })
    .eq("ip", ip)
    .gte("created_at", eenUurGeleden);

  if ((count ?? 0) >= 5) {
    return NextResponse.json(
      { error: "Te veel verzoeken. Probeer het later opnieuw." },
      { status: 429 }
    );
  }

  // Log dit verzoek
  await supabase.from("form_submissions").insert([{ ip }]);

  // Valideer verplichte velden
  const data = await req.json();
  for (const veld of VERPLICHTE_VELDEN) {
    if (!data[veld] || String(data[veld]).trim() === "") {
      return NextResponse.json({ error: `Veld '${veld}' is verplicht.` }, { status: 400 });
    }
  }

  // Valideer email formaat
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    return NextResponse.json({ error: "Ongeldig emailadres." }, { status: 400 });
  }

  // Check op dubbele inzending
  const { data: bestaand } = await supabase
    .from("partners")
    .select("id")
    .eq("email", data.email.trim().toLowerCase())
    .single();

  if (bestaand) {
    return NextResponse.json({ error: "Dit emailadres is al geregistreerd." }, { status: 409 });
  }

  const { error } = await supabase.from("partners").insert([{
    voornaam: data.voornaam.trim(),
    achternaam: data.achternaam.trim(),
    bedrijfsnaam: data.bedrijfsnaam.trim(),
    functie: data.functie?.trim() || null,
    email: data.email.trim().toLowerCase(),
    telefoon: data.telefoon?.trim() || null,
    website: data.website?.trim() || null,
    type: data.type,
    opmerkingen: data.opmerkingen?.trim() || null,
  }]);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const resend = new Resend(process.env.RESEND_API_KEY!);

  // Bevestigingsmail naar partner
  await resend.emails.send({
    from: "Ithemba Kuluntu <onboarding@resend.dev>",
    to: data.email,
    subject: "Welkom als partner van Ithemba Kuluntu!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
        <div style="background: #166534; padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Ithemba Kuluntu</h1>
        </div>
        <div style="background: #f9fafb; padding: 32px; border-radius: 0 0 12px 12px;">
          <h2 style="color: #166534;">Bedankt, ${data.voornaam}!</h2>
          <p>Uw registratie als <strong>${data.type}</strong> van Ithemba Kuluntu is succesvol ontvangen.</p>
          <p>Wij zijn blij dat <strong>${data.bedrijfsnaam}</strong> deel uitmaakt van onze missie om gemeenschappen in Zuid-Afrika te versterken.</p>
          <p>Ons team neemt binnenkort contact met u op.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #6b7280; font-size: 13px;">Ithemba Kuluntu &bull; info@ithembakuluntu.org</p>
        </div>
      </div>
    `,
  });

  // Notificatie naar Mehret
  await resend.emails.send({
    from: "Ithemba Kuluntu CRM <onboarding@resend.dev>",
    to: "mehretrijksen@gmail.com",
    subject: `Nieuwe partner: ${data.bedrijfsnaam}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
        <div style="background: #1e3a5f; padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 20px;">Nieuwe partner geregistreerd</h1>
        </div>
        <div style="background: #f9fafb; padding: 32px; border-radius: 0 0 12px 12px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #6b7280; width: 140px;">Naam</td><td style="padding: 8px 0; font-weight: bold;">${data.voornaam} ${data.achternaam}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Bedrijf</td><td style="padding: 8px 0;">${data.bedrijfsnaam}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Functie</td><td style="padding: 8px 0;">${data.functie || "—"}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Email</td><td style="padding: 8px 0;">${data.email}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Telefoon</td><td style="padding: 8px 0;">${data.telefoon || "—"}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Website</td><td style="padding: 8px 0;">${data.website || "—"}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Type</td><td style="padding: 8px 0;">${data.type}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Opmerkingen</td><td style="padding: 8px 0;">${data.opmerkingen || "—"}</td></tr>
          </table>
          <a href="https://ithemba-crm.vercel.app/dashboard" style="display: inline-block; margin-top: 24px; background: #166534; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            Bekijk dashboard
          </a>
        </div>
      </div>
    `,
  });

  return NextResponse.json({ success: true });
}
