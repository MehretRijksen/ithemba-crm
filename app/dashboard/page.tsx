import { createClient } from "@supabase/supabase-js";

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

  const typeBadge: Record<string, string> = {
    partner: "bg-blue-800 text-blue-200",
    donateur: "bg-yellow-800 text-yellow-200",
    beide: "bg-purple-800 text-purple-200",
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-400 mt-1">{partners.length} partners & donateurs geregistreerd</p>
          </div>
          <a href="/partner/nieuw" className="bg-green-600 hover:bg-green-500 transition px-4 py-2 rounded-lg text-sm font-semibold">
            + Nieuwe partner
          </a>
        </div>

        {partners.length === 0 ? (
          <div className="text-center text-gray-500 py-20">
            <div className="text-4xl mb-4">📭</div>
            <p>Nog geen partners geregistreerd.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-800">
            <table className="w-full text-sm">
              <thead className="bg-gray-900 text-gray-400">
                <tr>
                  <th className="text-left px-4 py-3">Naam</th>
                  <th className="text-left px-4 py-3">Bedrijf</th>
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-left px-4 py-3">Telefoon</th>
                  <th className="text-left px-4 py-3">Type</th>
                  <th className="text-left px-4 py-3">Datum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {partners.map((p: Record<string, string>) => (
                  <tr key={p.id} className="bg-gray-900 hover:bg-gray-800 transition">
                    <td className="px-4 py-3 font-medium">{p.voornaam} {p.achternaam}</td>
                    <td className="px-4 py-3 text-gray-300">{p.bedrijfsnaam}</td>
                    <td className="px-4 py-3 text-gray-300">{p.email}</td>
                    <td className="px-4 py-3 text-gray-300">{p.telefoon || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeBadge[p.type] ?? "bg-gray-700 text-gray-300"}`}>
                        {p.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{new Date(p.created_at).toLocaleDateString("nl-NL")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
