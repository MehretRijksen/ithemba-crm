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

const notificatieHTML = (data: Record<string, string>) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
    <div style="background: #1e3a5f; padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 20px;">New partner registered / Nieuwe partner geregistreerd</h1>
    </div>
    <div style="background: #f9fafb; padding: 32px; border-radius: 0 0 12px 12px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px 0; color: #6b7280; width: 140px;">Name / Naam</td><td style="padding: 8px 0; font-weight: bold;">${data.voornaam} ${data.achternaam}</td></tr>
        <tr><td style="padding: 8px 0; color: #6b7280;">Company / Bedrijf</td><td style="padding: 8px 0;">${data.bedrijfsnaam}</td></tr>
        <tr><td style="padding: 8px 0; color: #6b7280;">Function / Functie</td><td style="padding: 8px 0;">${data.functie || "—"}</td></tr>
        <tr><td style="padding: 8px 0; color: #6b7280;">Email</td><td style="padding: 8px 0;">${data.email}</td></tr>
        <tr><td style="padding: 8px 0; color: #6b7280;">Phone / Telefoon</td><td style="padding: 8px 0;">${data.telefoon || "—"}</td></tr>
        <tr><td style="padding: 8px 0; color: #6b7280;">Website</td><td style="padding: 8px 0;">${data.website || "—"}</td></tr>
        <tr><td style="padding: 8px 0; color: #6b7280;">Type</td><td style="padding: 8px 0;">${data.type}</td></tr>
        <tr><td style="padding: 8px 0; color: #6b7280;">Notes / Opmerkingen</td><td style="padding: 8px 0;">${data.opmerkingen || "—"}</td></tr>
      </table>
      <a href="https://ithemba-crm.vercel.app/dashboard" style="display: inline-block; margin-top: 24px; background: #166534; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
        View dashboard
      </a>
    </div>
  </div>
`;

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

  await supabase.from("form_submissions").insert([{ ip }]);

  const data = await req.json();

  // Valideer verplichte velden
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

  const { error: insertError } = await supabase.from("partners").insert([{
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

  if (insertError) {
    console.error("Database fout:", insertError.message);
    return NextResponse.json({ error: "Er is een fout opgetreden. Probeer het later opnieuw." }, { status: 500 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY!);

  // Bevestigingsmail naar partner (NL + EN)
  const emailStuurFout = await resend.emails.send({
    from: "Ithemba Kuluntu <onboarding@resend.dev>",
    to: data.email,
    subject: "Welcome to Ithemba Kuluntu / Welkom als partner!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
        <div style="background: #166534; padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Ithemba Kuluntu</h1>
        </div>
        <div style="background: #f9fafb; padding: 32px; border-radius: 0 0 12px 12px;">
          <h2 style="color: #166534;">Thank you, ${data.voornaam}! / Bedankt, ${data.voornaam}!</h2>
          <p><strong>English:</strong> Your registration as a <strong>${data.type}</strong> of Ithemba Kuluntu has been successfully received. We are happy that <strong>${data.bedrijfsnaam}</strong> is part of our mission to strengthen communities in South Africa. Our team will contact you shortly.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
          <p><strong>Nederlands:</strong> Uw registratie als <strong>${data.type}</strong> van Ithemba Kuluntu is succesvol ontvangen. Wij zijn blij dat <strong>${data.bedrijfsnaam}</strong> deel uitmaakt van onze missie. Ons team neemt binnenkort contact met u op.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #6b7280; font-size: 13px;">Ithemba Kuluntu &bull; info@ithembakuluntu.org</p>
        </div>
      </div>
    `,
  });

  if (emailStuurFout.error) {
    console.error("Email fout (partner):", emailStuurFout.error);
  }

  // Notificatie naar Mehret én CEO
  const notificatieFout = await resend.emails.send({
    from: "Ithemba Kuluntu CRM <onboarding@resend.dev>",
    to: ["mehretrijksen@gmail.com", "info@ithembakuluntu.org"],
    subject: `New partner: ${data.bedrijfsnaam}`,
    html: notificatieHTML(data),
  });

  if (notificatieFout.error) {
    console.error("Email fout (notificatie):", notificatieFout.error);
  }

  return NextResponse.json({ success: true });
}
