import Link from "next/link";

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen min-h-screen flex-col justify-between overflow-hidden bg-[#f3f2f8] text-slate-900">
      <header className="w-full shrink-0 bg-[#f3f2f8]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5c4eb4] text-white shadow-sm">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden
              >
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

          <Link
            href="/"
            className="text-sm font-medium text-slate-700 transition-colors hover:text-slate-900"
          >
            Početna
          </Link>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center overflow-y-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
}
