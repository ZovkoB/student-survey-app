import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AppHeader, adminNavLinks } from "@/components/layout/app-header";

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
    <div className="flex min-h-full flex-col bg-gradient-to-b from-background to-muted/30">
      <AppHeader variant="admin" navLinks={adminNavLinks} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
