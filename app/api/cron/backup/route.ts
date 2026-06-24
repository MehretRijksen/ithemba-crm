import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

function genereerCSV(partners: Record<string, string>[]): string {
  const kolommen = ["Voornaam", "Achternaam", "Bedrijfsnaam", "Functie", "Email", "Telefoon", "Website", "Type", "Opmerkingen", "Datum"];
  const velden = ["voornaam", "achternaam", "bedrijfsnaam", "functie", "email", "telefoon", "website", "type", "opmerkingen", "created_at"];

  const rijen = [
    kolommen.join(";"),
    ...partners.map((p) =>
      velden.map((v) => {
        const waarde = v === "created_at"
          ? new Date(p[v]).toLocaleDateString("nl-NL")
          : (p[v] ?? "");
        return `"${String(waarde).replace(/"/g, '""')}"`;
      }).join(";")
    ),
  ];

  return "﻿" + rijen.join("\n");
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  const { data: partners, error } = await supabase
    .from("partners")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const csv = genereerCSV(partners ?? []);
  const datum = new Date().toLocaleDateString("nl-NL");
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: "Ithemba Kuluntu CRM <onboarding@resend.dev>",
    to: "mehretrijksen@gmail.com",
    subject: `Ithemba CRM — Wekelijkse backup (${datum})`,
    html: `
      <p>Beste Mehret,</p>
      <p>Hierbij de wekelijkse backup van alle partners en donateurs in het Ithemba Kuluntu CRM systeem.</p>
      <p><strong>${partners?.length ?? 0} contacten</strong> opgenomen in de bijlage.</p>
      <p>Open het CSV bestand in Excel voor een overzicht.</p>
      <br/>
      <p>Met vriendelijke groet,<br/>Ithemba Kuluntu CRM</p>
    `,
    attachments: [
      {
        filename: `ithemba-backup-${new Date().toISOString().slice(0, 10)}.csv`,
        content: Buffer.from(csv, "utf-8").toString("base64"),
      },
    ],
  });

  return NextResponse.json({ success: true, aantalPartners: partners?.length ?? 0 });
}
