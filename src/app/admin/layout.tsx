import { redirect } from "next/navigation";

import { auth, signOut } from "@/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin/dashboard");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen flex-col justify-between bg-[#f3f2f8] text-slate-900">
      <header className="w-full border-b border-slate-200/80 bg-white/50 backdrop-blur-sm">
        <div className="app-container flex items-center justify-between py-4 md:py-5">
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

          <div className="flex shrink-0 items-center gap-3 sm:gap-4">
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
                className="rounded-lg bg-slate-100 px-3.5 py-1.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200"
              >
                Odjava
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="app-container flex-1 pt-6 pb-10">{children}</main>
    </div>
  );
}
