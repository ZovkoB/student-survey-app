import Link from "next/link";
import { redirect } from "next/navigation";

import { auth, signOut } from "@/auth";

export default async function SurveysLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/surveys");
  }

  if (session.user.role !== "STUDENT") {
    redirect("/admin/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col justify-between bg-[#f3f2f8] text-slate-900">
      <header className="w-full shrink-0 bg-[#f3f2f8]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
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
          </Link>

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
                className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-300"
              >
                Odjava
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-12">{children}</main>
    </div>
  );
}
