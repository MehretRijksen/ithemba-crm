import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center space-y-6">
        <div className="flex flex-col items-center">
          <Image src="/logo.png" alt="Ithemba Kuluntu" width={140} height={140} className="mb-4" />
          <h1 className="text-4xl font-bold text-white mb-1">Ithemba Kuluntu</h1>
          <p className="text-gray-400 text-lg">Partner & Donateur CRM</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <Link href="/dashboard" className="bg-green-700 hover:bg-green-600 transition rounded-xl p-6 text-left">
            <div className="text-2xl mb-2">📊</div>
            <div className="font-semibold text-lg">Dashboard</div>
            <div className="text-green-200 text-sm mt-1">Bekijk alle partners en donateurs</div>
          </Link>
          <Link href="/partner/nieuw" className="bg-blue-700 hover:bg-blue-600 transition rounded-xl p-6 text-left">
            <div className="text-2xl mb-2">➕</div>
            <div className="font-semibold text-lg">Partner toevoegen</div>
            <div className="text-blue-200 text-sm mt-1">Stuur een formulier naar een nieuwe partner</div>
          </Link>
        </div>
      </div>
    </main>
  );
}
