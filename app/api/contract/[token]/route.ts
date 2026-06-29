import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const LOGO_URL = "https://ithemba-crm.vercel.app/logo.png";

function emailHeader() {
  return `
    <div style="background: linear-gradient(135deg, #14532d 0%, #166534 100%); padding: 32px 24px; text-align: center; border-radius: 12px 12px 0 0;">
      <img src="${LOGO_URL}" alt="iThemba Kuluntu" width="72" height="72" style="border-radius: 50%; border: 3px solid rgba(255,255,255,0.2); margin-bottom: 16px; display: block; margin-left: auto; margin-right: auto;" />
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

function looptijdTekst(l: string) {
  const map: Record<string, string> = { onbepaald: "Onbepaalde tijd", "1jaar": "1 jaar", "2jaar": "2 jaar", "5jaar": "5 jaar" };
  return map[l] ?? l;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { naam } = await req.json();

  if (!naam?.trim()) {
    return NextResponse.json({ error: "Naam is verplicht." }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "onbekend";

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  // Haal partner op
  const { data: partner, error: fetchError } = await supabase
    .from("partners")
    .select("*")
    .eq("contract_token", token)
    .eq("status", "partner")
    .single();

  if (fetchError || !partner) {
    return NextResponse.json({ error: "Contract niet gevonden." }, { status: 404 });
  }

  if (partner.contract_ondertekend) {
    return NextResponse.json({ error: "Contract is al ondertekend." }, { status: 409 });
  }

  // Markeer als ondertekend
  const { error: updateError } = await supabase
    .from("partners")
    .update({
      contract_ondertekend: true,
      contract_ondertekend_op: new Date().toISOString(),
      contract_ip: ip,
      contract_naam: naam.trim(),
    })
    .eq("contract_token", token);

  if (updateError) {
    return NextResponse.json({ error: "Fout bij opslaan." }, { status: 500 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY!);
  const datum = new Date().toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });

  // Bevestiging naar partner
  await resend.emails.send({
    from: "iThemba Kuluntu e.V. <onboarding@resend.dev>",
    to: partner.email,
    subject: "Bevestiging ondertekening - iThemba Kuluntu e.V.",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
        ${emailHeader()}
        <div style="padding: 36px 32px;">
          <h2 style="color: #14532d; font-size: 20px; margin: 0 0 16px;">Bedankt voor uw ondertekening, ${partner.voornaam}!</h2>
          <p style="color: #475569; font-size: 14px; line-height: 1.7; margin: 0 0 24px;">
            Uw partnerovereenkomst met iThemba Kuluntu e.V. is officieel ondertekend op <strong>${datum}</strong>. Hieronder vindt u een samenvatting van uw overeenkomst.
          </p>

          <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <h3 style="color: #1e293b; font-size: 14px; margin: 0 0 12px; font-weight: 700;">Samenvatting overeenkomst</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 6px 0; color: #64748b; font-size: 13px; width: 140px;">Naam</td><td style="padding: 6px 0; font-size: 13px; font-weight: 600;">${partner.voornaam} ${partner.achternaam}</td></tr>
              <tr><td style="padding: 6px 0; color: #64748b; font-size: 13px;">Bedrijf</td><td style="padding: 6px 0; font-size: 13px;">${partner.bedrijfsnaam}</td></tr>
              <tr><td style="padding: 6px 0; color: #64748b; font-size: 13px;">Type</td><td style="padding: 6px 0; font-size: 13px;">${partner.type}</td></tr>
              <tr><td style="padding: 6px 0; color: #64748b; font-size: 13px;">Bijdrage</td><td style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #166534;">€${parseFloat(partner.bedrag).toLocaleString("nl-NL")} ${partner.frequentie}</td></tr>
              <tr><td style="padding: 6px 0; color: #64748b; font-size: 13px;">Looptijd</td><td style="padding: 6px 0; font-size: 13px;">${looptijdTekst(partner.looptijd)}</td></tr>
              <tr><td style="padding: 6px 0; color: #64748b; font-size: 13px;">Ondertekend op</td><td style="padding: 6px 0; font-size: 13px;">${datum}</td></tr>
            </table>
          </div>

          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px 18px;">
            <p style="margin: 0; color: #166534; font-size: 13px;">
              U ontvangt jaarlijks een officiële donatieverklaring (Zuwendungsbestätigung) voor uw belastingaangifte. Vragen? <a href="mailto:info@ithembakuluntu.org" style="color: #166534; font-weight: 600;">info@ithembakuluntu.org</a>
            </p>
          </div>
        </div>
        ${emailFooter()}
      </div>
    `,
  });

  // Notificatie naar Mehret + CEO
  await resend.emails.send({
    from: "iThemba Kuluntu CRM <onboarding@resend.dev>",
    to: ["mehretrijksen@gmail.com", "info@ithembakuluntu.org"],
    subject: `✅ Contract ondertekend: ${partner.bedrijfsnaam}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden;">
        ${emailHeader()}
        <div style="padding: 32px;">
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px 18px; margin-bottom: 24px;">
            <p style="margin: 0; color: #166534; font-size: 15px; font-weight: 700;">🎉 ${partner.voornaam} ${partner.achternaam} heeft het contract ondertekend!</p>
          </div>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #64748b; font-size: 13px; width: 140px;">Naam</td><td style="padding: 8px 0; font-weight: 600;">${partner.voornaam} ${partner.achternaam}</td></tr>
            <tr style="border-top: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b; font-size: 13px;">Bedrijf</td><td style="padding: 8px 0;">${partner.bedrijfsnaam}</td></tr>
            <tr style="border-top: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b; font-size: 13px;">Bijdrage</td><td style="padding: 8px 0; font-weight: 700; color: #166534;">€${parseFloat(partner.bedrag).toLocaleString("nl-NL")} ${partner.frequentie}</td></tr>
            <tr style="border-top: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b; font-size: 13px;">Looptijd</td><td style="padding: 8px 0;">${looptijdTekst(partner.looptijd)}</td></tr>
            <tr style="border-top: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b; font-size: 13px;">Ondertekend op</td><td style="padding: 8px 0;">${datum}</td></tr>
            <tr style="border-top: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b; font-size: 13px;">IP-adres</td><td style="padding: 8px 0; color: #94a3b8; font-size: 12px;">${ip}</td></tr>
          </table>
          <div style="text-align: center; margin-top: 24px;">
            <a href="https://ithemba-crm.vercel.app/dashboard" style="display: inline-block; background: linear-gradient(135deg, #14532d, #166534); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Bekijk dashboard →</a>
          </div>
        </div>
        ${emailFooter()}
      </div>
    `,
  });

  return NextResponse.json({ success: true });
}
