import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const LOGO_URL = "https://ithemba-crm.vercel.app/logo.png";
const BASE_URL = "https://ithemba-crm.vercel.app";

function emailHeader() {
  return `
    <div style="background: linear-gradient(135deg, #14532d 0%, #166534 100%); padding: 32px 24px; text-align: center; border-radius: 12px 12px 0 0;">
      <img src="${LOGO_URL}" alt="Ithemba Kuluntu" width="72" height="72" style="border-radius: 50%; border: 3px solid rgba(255,255,255,0.2); margin-bottom: 16px; display: block; margin-left: auto; margin-right: auto;" />
      <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 700;">iThemba Kuluntu</h1>
      <p style="color: rgba(255,255,255,0.7); margin: 4px 0 0; font-size: 13px;">e.V. • Am Emberg 20, 57399 Kirchhundem</p>
    </div>
  `;
}

function emailFooter() {
  return `
    <div style="background: #f1f5f9; padding: 20px 32px; border-top: 1px solid #e2e8f0; text-align: center; border-radius: 0 0 12px 12px;">
      <p style="color: #94a3b8; font-size: 12px; margin: 0;">iThemba Kuluntu e.V. • <a href="mailto:info@ithembakuluntu.org" style="color: #64748b;">info@ithembakuluntu.org</a></p>
      <p style="color: #cbd5e1; font-size: 11px; margin: 6px 0 0;">Empowering communities in South Africa</p>
    </div>
  `;
}

function looptijdTekst(looptijd: string) {
  const map: Record<string, string> = {
    onbepaald: "Onbepaalde tijd (opzegtermijn: 1 maand)",
    "1jaar": "1 jaar",
    "2jaar": "2 jaar",
    "5jaar": "5 jaar",
  };
  return map[looptijd] ?? looptijd;
}

function betalingswijzeTekst(bw: string) {
  return bw === "sepa" ? "SEPA automatische incasso" : "Bankoverschrijving";
}

export async function POST(req: NextRequest) {
  // Auth check
  const supabaseAuth = await createClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

  const data = await req.json();
  const { voornaam, achternaam, bedrijfsnaam, functie, email, telefoon, website, type, opmerkingen, status, bedrag, frequentie, looptijd, betalingswijze } = data;

  if (!voornaam || !achternaam || !bedrijfsnaam || !email) {
    return NextResponse.json({ error: "Verplichte velden ontbreken." }, { status: 400 });
  }

  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  const insertData: Record<string, unknown> = {
    voornaam: voornaam.trim(),
    achternaam: achternaam.trim(),
    bedrijfsnaam: bedrijfsnaam.trim(),
    functie: functie?.trim() || null,
    email: email.trim().toLowerCase(),
    telefoon: telefoon?.trim() || null,
    website: website?.trim() || null,
    type,
    opmerkingen: opmerkingen?.trim() || null,
    status: status || "prospect",
  };

  if (status === "partner") {
    insertData.bedrag = parseFloat(bedrag);
    insertData.frequentie = frequentie;
    insertData.looptijd = looptijd;
    insertData.betalingswijze = betalingswijze;
  }

  const { data: partner, error } = await supabase
    .from("partners")
    .insert([insertData])
    .select("id, contract_token")
    .single();

  if (error) {
    console.error("Insert fout:", error.message);
    return NextResponse.json({ error: "Database fout." }, { status: 500 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY!);
  const datum = new Date().toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });

  if (status === "prospect") {
    // Bedankmail naar prospect
    await resend.emails.send({
      from: "Mehret Rijksen | iThemba Kuluntu <onboarding@resend.dev>",
      to: email,
      subject: "Bedankt voor ons gesprek / Thank you for our conversation",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
          ${emailHeader()}
          <div style="padding: 36px 32px;">
            <h2 style="color: #14532d; font-size: 20px; margin: 0 0 20px;">Beste ${voornaam},</h2>
            <p style="color: #1e293b; font-size: 15px; line-height: 1.7; margin: 0 0 16px;">
              Bedankt voor ons gesprek. Het was prettig om meer te horen over <strong>${bedrijfsnaam}</strong> en uw interesse in onze missie.
            </p>
            <p style="color: #1e293b; font-size: 15px; line-height: 1.7; margin: 0 0 16px;">
              Ik neem binnenkort contact met u op om de mogelijkheden voor een samenwerking verder te bespreken.
            </p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="color: #64748b; font-size: 14px; line-height: 1.7; margin: 0 0 16px;">
              <em>Dear ${voornaam}, thank you for our conversation. I will be in touch shortly to discuss how ${bedrijfsnaam} can be part of our mission.</em>
            </p>
            <p style="color: #475569; font-size: 14px; margin: 24px 0 0;">Met vriendelijke groet,<br/><strong>Mehret Rijksen</strong><br/>iThemba Kuluntu</p>
          </div>
          ${emailFooter()}
        </div>
      `,
    });
  } else {
    // Contract email naar partner
    const contractLink = `${BASE_URL}/contract/${partner.contract_token}`;

    await resend.emails.send({
      from: "iThemba Kuluntu e.V. <onboarding@resend.dev>",
      to: email,
      subject: "Uw partnercontract - iThemba Kuluntu e.V.",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
          ${emailHeader()}
          <div style="padding: 36px 32px;">
            <h2 style="color: #14532d; font-size: 20px; margin: 0 0 8px;">Gefeliciteerd, ${voornaam}! 🎉</h2>
            <p style="color: #475569; font-size: 14px; margin: 0 0 24px;">Welkom als officieel partner van iThemba Kuluntu e.V.</p>

            <div style="background: #f8fafc; border-left: 4px solid #166534; border-radius: 0 8px 8px 0; padding: 16px 20px; margin-bottom: 24px;">
              <p style="margin: 0; color: #1e293b; font-size: 14px; line-height: 1.6;">
                We zijn verheugd dat <strong>${bedrijfsnaam}</strong> deel uitmaakt van onze missie om gemeenschappen in Zuid-Afrika te versterken.
              </p>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
              <tr><td style="padding: 8px 0; color: #64748b; font-size: 13px; width: 140px;">Type</td><td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${type}</td></tr>
              <tr style="border-top: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b; font-size: 13px;">Bijdrage</td><td style="padding: 8px 0; font-weight: 600; font-size: 14px;">€${parseFloat(bedrag).toLocaleString("nl-NL")} ${frequentie}</td></tr>
              <tr style="border-top: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b; font-size: 13px;">Looptijd</td><td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${looptijdTekst(looptijd)}</td></tr>
              <tr style="border-top: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b; font-size: 13px;">Betaling</td><td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${betalingswijzeTekst(betalingswijze)}</td></tr>
            </table>

            <div style="text-align: center; margin: 32px 0;">
              <p style="color: #475569; font-size: 14px; margin-bottom: 16px;">Klik op de knop hieronder om uw contract te bekijken en digitaal te ondertekenen.</p>
              <a href="${contractLink}" style="display: inline-block; background: linear-gradient(135deg, #14532d, #166534); color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 15px;">
                ✍️ Contract ondertekenen
              </a>
            </div>

            <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
              Of open deze link: <a href="${contractLink}" style="color: #64748b;">${contractLink}</a>
            </p>
          </div>
          ${emailFooter()}
        </div>
      `,
    });

    // Notificatie naar Mehret + CEO
    await resend.emails.send({
      from: "iThemba Kuluntu CRM <onboarding@resend.dev>",
      to: ["mehretrijksen@gmail.com", "info@ithembakuluntu.org"],
      subject: `Nieuw contract verstuurd: ${bedrijfsnaam}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden;">
          ${emailHeader()}
          <div style="padding: 32px;">
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px 18px; margin-bottom: 24px;">
              <p style="margin: 0; color: #166534; font-size: 14px; font-weight: 600;">Contract verstuurd naar ${voornaam} ${achternaam} (${bedrijfsnaam})</p>
            </div>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #64748b; font-size: 13px; width: 140px;">Naam</td><td style="padding: 8px 0; font-weight: 600;">${voornaam} ${achternaam}</td></tr>
              <tr style="border-top: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b; font-size: 13px;">Bedrijf</td><td style="padding: 8px 0;">${bedrijfsnaam}</td></tr>
              <tr style="border-top: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b; font-size: 13px;">Email</td><td style="padding: 8px 0;">${email}</td></tr>
              <tr style="border-top: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b; font-size: 13px;">Bijdrage</td><td style="padding: 8px 0; font-weight: 600; color: #166534;">€${parseFloat(bedrag).toLocaleString("nl-NL")} ${frequentie}</td></tr>
              <tr style="border-top: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b; font-size: 13px;">Looptijd</td><td style="padding: 8px 0;">${looptijdTekst(looptijd)}</td></tr>
              <tr style="border-top: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b; font-size: 13px;">Datum</td><td style="padding: 8px 0;">${datum}</td></tr>
            </table>
            <div style="text-align: center; margin-top: 24px;">
              <a href="${BASE_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #14532d, #166534); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Bekijk dashboard →</a>
            </div>
          </div>
          ${emailFooter()}
        </div>
      `,
    });
  }

  return NextResponse.json({ success: true });
}
