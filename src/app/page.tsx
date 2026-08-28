import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f3f2f8] text-slate-900 flex flex-col justify-between">
      {/* 1. Navigacijska traka */}
      <header className="w-full bg-[#f3f2f8]">
        <div className="mx-auto max-w-7xl px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Studentske Ankete FSRE
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="rounded-lg border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-all"
            >
              Prijava
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-[#5c4eb4] px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#4c3ea4] transition-all"
            >
              Registracija
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Sekcija (Dva stupca) */}
      <main className="mx-auto max-w-7xl px-6 py-12 md:py-20 my-auto w-full">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          
          {/* Lijevi stupac - Tekst i Gumb */}
          <div className="max-w-xl">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl leading-tight">
              Glas studenata za bolji studij.
            </h1>
            <p className="mt-6 text-lg text-slate-600 leading-relaxed">
              Službena platforma za anonimno provođenje studentskih anketa i evaluaciju nastave na Fakultetu strojarstva, računarstva i elektrotehnike.
            </p>
            <div className="mt-8">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-xl bg-[#5c4eb4] px-8 py-4 text-base font-semibold text-white shadow-md hover:bg-[#4c3ea4] transition-all"
              >
                Započni anketu &rarr;
              </Link>
            </div>
          </div>

          {/* Desni stupac - Slika stopljena s pozadinom */}
          <div className="flex justify-center lg:justify-end">
            <img
              src="/examples_main.png"
              alt="Ilustracija studentskih anketa"
              className="w-full max-w-lg lg:max-w-xl h-auto object-contain mix-blend-multiply"
            />
          </div>

        </div>
      </main>

      {/* 3. Tri kartice pri dnu */}
      <footer className="w-full bg-[#f3f2f8] pb-12 pt-6">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-slate-900">100% Anonimno</h3>
              <p className="mt-2 text-sm text-slate-600">
                Vaši odgovori su u potpunosti anonimni i onemogućuju povezivanje identiteta s predanim odgovorima.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-slate-900">Ciljane ankete</h3>
              <p className="mt-2 text-sm text-slate-600">
                Prikazuju vam se samo ankete prilagođene vašem studijskom programu i godini studija.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-slate-900">Izravan utjecaj</h3>
              <p className="mt-2 text-sm text-slate-600">
                Prikupljeni rezultati pomažu Upravi fakulteta u kontinuiranom unapređenju kvalitete nastave.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}