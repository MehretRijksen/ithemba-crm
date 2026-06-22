import { createClient } from "@supabase/supabase-js";
import DashboardClient from "./DashboardClient";

async function getPartners() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
  const { data } = await supabase.from("partners").select("*").order("created_at", { ascending: false });
  return data ?? [];
}

export default async function Dashboard() {
  const partners = await getPartners();
  return <DashboardClient partners={partners} />;
}
