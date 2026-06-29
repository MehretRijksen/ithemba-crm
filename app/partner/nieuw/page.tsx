"use client";
import { useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const VELD_FOUTEN: Record<string, string> = {
  voornaam: "Vul uw voornaam in. / Please fill in your first name.",
  achternaam: "Vul uw achternaam in. / Please fill in your last name.",
  bedrijfsnaam: "Vul de bedrijfsnaam in. / Please fill in your company name.",
  email: "Vul een geldig e-mailadres in. / Please enter a valid email address.",
  type: "Selecteer een type samenwerking. / Please select a partnership type.",
};

function Logo() {
  return (
    <div className="mb-8 text-center">
      <Image src="/logo.png" alt="Ithemba Kuluntu" width={80} height={80} className="mx-auto mb-4" />
      <h1 className="text-2xl font-bold text-slate-900">Ithemba Kuluntu</h1>
    </div>
  );
}

function Formulier() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "dubbel" | "geblokkeerd">("idle");
  const [foutmelding, setFoutmelding] = useState("");
  const [veldFouten, setVeldFouten] = useState<Record<string, string>>({});

  const geheimeToken = process.env.NEXT_PUBLIC_FORM_TOKEN;
  if (geheimeToken && token !== geheimeToken) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm w-full">
          <Logo />
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-3">
            <div className="text-5xl">🔒</div>
            <h2 className="text-xl font-bold text-slate-900">Niet toegankelijk / Access denied</h2>
            <p className="text-slate-500 text-sm">Neem contact op met Ithemba Kuluntu voor een registratielink.<br/>Please contact Ithemba Kuluntu for a registration link.</p>
            <p className="text-slate-400 text-xs pt-2">info@ithembakuluntu.org</p>
          </div>
        </div>
      </main>
    );
  }

  function valideer(data: Record<string, string>): boolean {
    const fouten: Record<string, string> = {};
    for (const [veld, bericht] of Object.entries(VELD_FOUTEN)) {
      if (!data[veld] || data[veld].trim() === "") {
        fouten[veld] = bericht;
      }
    }
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      fouten.email = "Dit e-mailadres is niet geldig. / This email address is not valid.";
    }
    setVeldFouten(fouten);
    return Object.keys(fouten).length === 0;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;

    if (!valideer(data)) return;

    setStatus("loading");
    setFoutmelding("");

    const res = await fetch("/api/partner", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      setStatus("success");
    } else if (res.status === 409) {
      setStatus("dubbel");
    } else if (res.status === 429) {
      setStatus("geblokkeerd");
    } else {
      const json = await res.json().catch(() => ({}));
      setFoutmelding(json.error || "Er is iets misgegaan. Probeer het later opnieuw.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm w-full">
          <Logo />
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-3">
            <div className="text-5xl">✅</div>
            <h2 className="text-2xl font-bold text-slate-900">Bedankt! / Thank you!</h2>
            <p className="text-slate-500 text-sm">Uw registratie is ontvangen. U ontvangt binnen enkele minuten een bevestigingsmail.<br/><br/>Your registration has been received. You will receive a confirmation email shortly.</p>
          </div>
        </div>
      </main>
    );
  }

  if (status === "dubbel") {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm w-full">
          <Logo />
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-3">
            <div className="text-5xl">📧</div>
            <h2 className="text-2xl font-bold text-slate-900">Al geregistreerd / Already registered</h2>
            <p className="text-slate-500 text-sm">Dit e-mailadres is al geregistreerd. Neem contact op als dit een fout is.<br/><br/>This email address is already registered. Please contact us if this is an error.</p>
            <p className="text-slate-400 text-xs pt-2">info@ithembakuluntu.org</p>
          </div>
        </div>
      </main>
    );
  }

  if (status === "geblokkeerd") {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm w-full">
          <Logo />
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-3">
            <div className="text-5xl">⏳</div>
            <h2 className="text-2xl font-bold text-slate-900">Even wachten / Please wait</h2>
            <p className="text-slate-500 text-sm">U heeft te veel pogingen gedaan. Probeer het over een uur opnieuw.<br/><br/>Too many attempts. Please try again in an hour.</p>
          </div>
        </div>
      </main>
    );
  }

  const inputKlasse = (veld: string) =>
    `w-full border rounded-xl px-4 py-2.5 text-slate-900 bg-white focus:outline-none focus:ring-2 ${
      veldFouten[veld] ? "border-red-400 ring-2 ring-red-300" : "border-slate-300 focus:ring-blue-600"
    }`;

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full">
        <div className="mb-8 text-center">
          <Image src="/logo.png" alt="Ithemba Kuluntu" width={80} height={80} className="mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900">Ithemba Kuluntu</h1>
          <p className="text-slate-500 mt-2 text-sm">Partnerregistratie / Partner Registration</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Voornaam / First name *</label>
              <input name="voornaam" className={inputKlasse("voornaam")} />
              {veldFouten.voornaam && <p className="text-red-500 text-xs mt-1">{veldFouten.voornaam}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Achternaam / Last name *</label>
              <input name="achternaam" className={inputKlasse("achternaam")} />
              {veldFouten.achternaam && <p className="text-red-500 text-xs mt-1">{veldFouten.achternaam}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Bedrijfsnaam / Company *</label>
            <input name="bedrijfsnaam" className={inputKlasse("bedrijfsnaam")} />
            {veldFouten.bedrijfsnaam && <p className="text-red-500 text-xs mt-1">{veldFouten.bedrijfsnaam}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Functietitel / Job Title</label>
            <input name="functie" className={inputKlasse("functie")} />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">E-mailadres / Email *</label>
            <input name="email" type="email" className={inputKlasse("email")} />
            {veldFouten.email && <p className="text-red-500 text-xs mt-1">{veldFouten.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Telefoonnummer / Phone</label>
            <input name="telefoon" type="tel" className={inputKlasse("telefoon")} />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Website</label>
            <input name="website" type="url" placeholder="https://" className={inputKlasse("website")} />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Type samenwerking / Partnership Type *</label>
            <select name="type" className={inputKlasse("type")}>
              <option value="">Selecteer... / Select...</option>
              <option value="partner">Partner</option>
              <option value="donateur">Donateur / Donor</option>
              <option value="beide">Partner & Donateur / Partner & Donor</option>
            </select>
            {veldFouten.type && <p className="text-red-500 text-xs mt-1">{veldFouten.type}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Opmerkingen / Notes</label>
            <textarea name="opmerkingen" rows={3} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none" />
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-blue-700 hover:bg-blue-600 disabled:opacity-50 transition rounded-xl py-3 font-semibold text-white"
          >
            {status === "loading" ? "Bezig... / Sending..." : "Registratie indienen / Submit Registration"}
          </button>

          {status === "error" && (
            <p className="text-red-500 text-sm text-center">{foutmelding}</p>
          )}
        </form>
      </div>
    </main>
  );
}

export default function PartnerFormulier() {
  return (
    <Suspense>
      <Formulier />
    </Suspense>
  );
}
