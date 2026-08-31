import Link from "next/link";

import { auth, signOut } from "@/auth";

const primaryButtonClassName =
  "inline-flex items-center justify-center rounded-xl bg-[#5c4eb4] px-8 py-4 text-base font-semibold text-white shadow-md transition-all hover:bg-[#4c3ea4]";

const secondaryButtonClassName =
  "inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-8 py-4 text-base font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50";

const featureCardClassName =
  "rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-sm";

type FeatureCard = {
  title: string;
  description: string;
};

const studentFeatureCards: FeatureCard[] = [
  {
    title: "100% Anonimno",
    description:
      "Vaši odgovori su u potpunosti anonimni i onemogućuju povezivanje identiteta s predanim odgovorima.",
  },
  {
    title: "Ciljane ankete",
    description:
      "Prikazuju vam se samo ankete prilagođene vašem studijskom programu i godini studija.",
  },
  {
    title: "Izravan utjecaj",
    description:
      "Prikupljeni rezultati pomažu Upravi fakulteta u kontinuiranom unapređenju kvalitete nastave.",
  },
];

const adminFeatureCards: FeatureCard[] = [
  {
    title: "Upravljanje anketama",
    description:
      "Kreirajte, uređujte i aktivirajte ankete prilagođene određenim studijskim programima.",
  },
  {
    title: "Analitika odgovora",
    description:
      "Detaljan pregled rezultata anketa i statistike ispunjenosti u stvarnom vremenu.",
  },
  {
    title: "Ciljane grupe",
    description:
      "Filtrirajte i dodjeljujte ankete prema godini studija i studijskom smjeru.",
  },
];

const publicFeatureCards = studentFeatureCards;

function FeatureCards({ cards }: { cards: FeatureCard[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {cards.map((card) => (
        <div key={card.title} className={featureCardClassName}>
          <h3 className="text-lg font-semibold text-slate-900">{card.title}</h3>
          <p className="mt-2 text-sm text-slate-600">{card.description}</p>
        </div>
      ))}
    </div>
  );
}

export default async function HomePage() {
  const session = await auth();
  const isAuthenticated = Boolean(session?.user);
  const isAdmin = session?.user?.role === "ADMIN";

  const featureCards = !isAuthenticated
    ? publicFeatureCards
    : isAdmin
      ? adminFeatureCards
      : studentFeatureCards;

  return (
    <div className="flex min-h-screen flex-col justify-between bg-[#f3f2f8] text-slate-900">
      <header className="w-full bg-[#f3f2f8]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5c4eb4] text-white shadow-sm">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Studentske Ankete FSRE
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-3 sm:gap-4">
            {isAuthenticated && session?.user ? (
              <>
                <span className="max-w-[140px] truncate text-sm text-slate-600 sm:max-w-[220px]">
                  {session.user.email}
                </span>
                <form
                  action={async () => {
                    "use server";
                    await signOut({ redirectTo: "/login" });
                  }}
                >
                  <button
                    type="submit"
                    className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-300"
                  >
                    Odjava
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-lg border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50"
                >
                  Prijava
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-[#5c4eb4] px-5 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#4c3ea4]"
                >
                  Registracija
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto my-auto w-full max-w-7xl px-6 py-12 md:py-20">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div className="max-w-xl">
            {isAuthenticated && isAdmin ? (
              <>
                <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                  Admin nadzorna ploča
                </h1>
                <p className="mt-6 text-lg leading-relaxed text-slate-600">
                  Upravljajte anketama, izradite nove upitnike i pregledajte analitiku odgovora
                  FSRE studenata.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Link href="/admin/surveys/create" className={primaryButtonClassName}>
                    Izradi novu anketu
                  </Link>
                  <Link href="/admin/dashboard" className={secondaryButtonClassName}>
                    Pregled svih anketa
                  </Link>
                </div>
              </>
            ) : isAuthenticated ? (
              <>
                <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                  Dobrodošli natrag!
                </h1>
                <p className="mt-6 text-lg leading-relaxed text-slate-600">
                  Pristupite dostupnim anketama prilagođenim vašem studijskom programu.
                </p>
                <div className="mt-8">
                  <Link href="/surveys" className={primaryButtonClassName}>
                    Moje ankete
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                  Glas studenata za bolji studij.
                </h1>
                <p className="mt-6 text-lg leading-relaxed text-slate-600">
                  Službena platforma za anonimno provođenje studentskih anketa i evaluaciju
                  nastave na Fakultetu strojarstva, računarstva i elektrotehnike.
                </p>
                <div className="mt-8">
                  <Link href="/login" className={primaryButtonClassName}>
                    Započni anketu →
                  </Link>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-center lg:justify-end">
            <img
              src="/examples_main.png"
              alt="Ilustracija studentskih anketa"
              className="h-auto w-full max-w-lg object-contain mix-blend-multiply lg:max-w-xl"
            />
          </div>
        </div>
      </main>

      <footer className="w-full bg-[#f3f2f8] pb-12 pt-6">
        <div className="mx-auto max-w-7xl px-6">
          <FeatureCards cards={featureCards} />
        </div>
      </footer>
    </div>
  );
}
