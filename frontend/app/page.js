import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 space-y-8">
      <h1 className="text-4xl font-black text-slate-800 text-center">RecoverAI (HC-01)</h1>
      <p className="text-slate-500 text-center max-w-md">Intelligent Post-Discharge Care Companion Prototype.</p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/patient" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold shadow hover:bg-blue-700 transition">
          Open Patient View
        </Link>
        <Link href="/dashboard" className="px-6 py-3 bg-slate-800 text-white rounded-lg font-bold shadow hover:bg-slate-900 transition">
          Open Caregiver Dashboard
        </Link>
      </div>
    </div>
  );
}
