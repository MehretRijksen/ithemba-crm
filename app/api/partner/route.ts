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

const LOGO_URL = "https://ithemba-crm.vercel.app/logo.png";

const emailHeader = () => `
  <div style="background: linear-gradient(135deg, #14532d 0%, #166534 100%); padding: 32px 24px; text-align: center; border-radius: 12px 12px 0 0;">
    <img src="${LOGO_URL}" alt="Ithemba Kuluntu" width="72" height="72" style="border-radius: 50%; border: 3px solid rgba(255,255,255,0.2); margin-bottom: 16px; display: block; margin-left: auto; margin-right: auto;" />
    <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">Ithemba Kuluntu</h1>
    <p style="color: rgba(255,255,255,0.7); margin: 4px 0 0; font-size: 13px;">Partner & Donor CRM</p>
  </div>
`;

const emailFooter = () => `
  <div style="background: #f1f5f9; padding: 20px 32px; border-top: 1px solid #e2e8f0; text-align: center; border-radius: 0 0 12px 12px;">
    <p style="color: #94a3b8; font-size: 12px; margin: 0;">Ithemba Kuluntu &bull; <a href="mailto:info@ithembakuluntu.org" style="color: #64748b;">info@ithembakuluntu.org</a></p>
    <p style="color: #cbd5e1; font-size: 11px; margin: 6px 0 0;">Empowering communities in South Africa</p>
  </div>
`;

const rij = (label: string, waarde: string) => `
  <tr>
    <td style="padding: 10px 0; color: #64748b; font-size: 13px; width: 140px; vertical-align: top;">${label}</td>
    <td style="padding: 10px 0; color: #1e293b; font-size: 14px; font-weight: 500;">${waarde || "—"}</td>
  </tr>
  <tr><td colspan="2" style="border-bottom: 1px solid #f1f5f9; padding: 0;"></td></tr>
`;

const notificatieHTML = (data: Record<string, string>) => `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
    ${emailHeader()}
    <div style="padding: 32px;">
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px 18px; margin-bottom: 24px;">
        <p style="margin: 0; color: #166534; font-size: 14px; font-weight: 600;">Nieuwe partner geregistreerd / New partner registered</p>
      </div>
      <table style="width: 100%; border-collapse: collapse;">
        ${rij("Naam / Name", `${data.voornaam} ${data.achternaam}`)}
        ${rij("Bedrijf / Company", data.bedrijfsnaam)}
        ${rij("Functie / Role", data.functie)}
        ${rij("Email", data.email)}
        ${rij("Telefoon / Phone", data.telefoon)}
        ${rij("Website", data.website)}
        ${rij("Type", data.type)}
        ${rij("Opmerkingen / Notes", data.opmerkingen)}
      </table>
      <div style="text-align: center; margin-top: 28px;">
        <a href="https://ithemba-crm.vercel.app/dashboard" style="display: inline-block; background: linear-gradient(135deg, #14532d, #166534); color: white; padding: 13px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
          Bekijk dashboard &rarr;
        </a>
      </div>
    </div>
    ${emailFooter()}
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
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
        ${emailHeader()}
        <div style="padding: 36px 32px;">
          <h2 style="color: #14532d; font-size: 20px; margin: 0 0 8px;">Welcome, ${data.voornaam}! 🎉</h2>
          <p style="color: #475569; font-size: 14px; margin: 0 0 24px;">Welkom bij Ithemba Kuluntu</p>

          <div style="background: #f8fafc; border-left: 4px solid #166534; border-radius: 0 8px 8px 0; padding: 16px 20px; margin-bottom: 24px;">
            <p style="margin: 0; color: #1e293b; font-size: 14px; line-height: 1.6;">
              <strong>English:</strong> Your registration as a <strong>${data.type}</strong> of Ithemba Kuluntu has been received. We are thrilled to have <strong>${data.bedrijfsnaam}</strong> as part of our mission to strengthen and empower communities in South Africa. Our team will be in touch with you shortly.
            </p>
          </div>

          <div style="background: #f8fafc; border-left: 4px solid #166534; border-radius: 0 8px 8px 0; padding: 16px 20px; margin-bottom: 32px;">
            <p style="margin: 0; color: #1e293b; font-size: 14px; line-height: 1.6;">
              <strong>Nederlands:</strong> Uw registratie als <strong>${data.type}</strong> van Ithemba Kuluntu is succesvol ontvangen. Wij zijn verheugd dat <strong>${data.bedrijfsnaam}</strong> deel uitmaakt van onze missie om gemeenschappen in Zuid-Afrika te versterken. Ons team neemt binnenkort contact met u op.
            </p>
          </div>

          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px 18px;">
            <p style="margin: 0; color: #166534; font-size: 13px;">
              Vragen? / Questions? &nbsp;&bull;&nbsp;
              <a href="mailto:info@ithembakuluntu.org" style="color: #166534; font-weight: 600;">info@ithembakuluntu.org</a>
            </p>
          </div>
        </div>
        ${emailFooter()}
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
