import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data, error } = await supabase().from("partners").select("*").eq("id", id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await req.json();

  const { error } = await supabase().from("partners").update({
    voornaam: data.voornaam?.trim(),
    achternaam: data.achternaam?.trim(),
    bedrijfsnaam: data.bedrijfsnaam?.trim(),
    functie: data.functie?.trim() || null,
    email: data.email?.trim().toLowerCase(),
    telefoon: data.telefoon?.trim() || null,
    website: data.website?.trim() || null,
    type: data.type,
    opmerkingen: data.opmerkingen?.trim() || null,
  }).eq("id", id);

  if (error) {
    console.error("Update fout:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error } = await supabase().from("partners").delete().eq("id", id);
  if (error) {
    console.error("Verwijder fout:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
