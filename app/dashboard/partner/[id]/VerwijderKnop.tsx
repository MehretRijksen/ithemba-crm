"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VerwijderKnop({ id, naam }: { id: string; naam: string }) {
  const [bevestigen, setBevestigen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleVerwijder() {
    setLoading(true);
    const res = await fetch(`/api/partner/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/dashboard");
    } else {
      alert("Er is iets misgegaan bij het verwijderen.");
      setLoading(false);
    }
  }

  if (bevestigen) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-red-400">Zeker weten?</span>
        <button
          onClick={handleVerwijder}
          disabled={loading}
          className="bg-red-600 hover:bg-red-500 disabled:opacity-50 transition px-3 py-2 rounded-lg text-sm font-semibold"
        >
          {loading ? "Bezig..." : "Ja, verwijder"}
        </button>
        <button
          onClick={() => setBevestigen(false)}
          className="bg-gray-700 hover:bg-gray-600 transition px-3 py-2 rounded-lg text-sm"
        >
          Annuleer
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setBevestigen(true)}
      className="bg-red-800 hover:bg-red-700 transition px-4 py-2 rounded-lg text-sm font-semibold"
    >
      Verwijderen
    </button>
  );
}
