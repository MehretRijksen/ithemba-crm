import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import DashboardClient from "./DashboardClient";

async function getPartners() {
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
  const { data } = await supabase.from("partners").select("*").order("created_at", { ascending: false });
  return data ?? [];
}

export default async function Dashboard() {
  const [partners, supabase] = await Promise.all([getPartners(), createClient()]);
  const { data: { user } } = await supabase.auth.getUser();
  const gebruiker = user?.email?.split("@")[0] ?? "gebruiker";

  return <DashboardClient partners={partners} gebruiker={gebruiker} />;
}
