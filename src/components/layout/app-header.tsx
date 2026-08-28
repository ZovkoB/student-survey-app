import Link from "next/link";
import { BarChart3, ClipboardList, Home, LogIn, UserPlus } from "lucide-react";

import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavLink = {
  href: string;
  label: string;
};

type AppHeaderProps = {
  variant?: "public" | "admin" | "student" | "auth";
  navLinks?: NavLink[];
  className?: string;
};

const brand = {
  title: "FSRE Ankete",
  subtitle: "Sustav za studentske ankete",
};

export async function AppHeader({
  variant = "public",
  navLinks = [],
  className,
}: AppHeaderProps) {
  const session = await auth();

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-sm",
        className,
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-6">
          <Link href="/" className="group min-w-0">
            <p className="truncate text-lg font-bold tracking-tight text-primary transition-colors group-hover:text-primary/80">
              {brand.title}
            </p>
            <p className="hidden truncate text-xs text-muted-foreground sm:block">
              {brand.subtitle}
            </p>
          </Link>

          {navLinks.length > 0 && (
            <nav className="hidden items-center gap-1 md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {session?.user?.email && variant !== "public" && variant !== "auth" && (
            <span className="hidden max-w-[220px] truncate text-sm text-muted-foreground lg:inline">
              {session.user.email}
            </span>
          )}

          {variant === "public" && !session?.user && (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link href="/login">
                  <LogIn className="h-4 w-4" />
                  Prijava
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">
                  <UserPlus className="h-4 w-4" />
                  Registracija
                </Link>
              </Button>
            </>
          )}

          {(variant === "admin" || variant === "student" || variant === "auth") &&
            session?.user && (
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <Button type="submit" variant="outline" size="sm">
                  Odjava
                </Button>
              </form>
            )}
        </div>
      </div>
    </header>
  );
}

export const adminNavLinks: NavLink[] = [
  { href: "/admin/dashboard", label: "Nadzorna ploča" },
  { href: "/admin/surveys/create", label: "Izradi anketu" },
];

export const studentNavLinks: NavLink[] = [
  { href: "/surveys", label: "Dostupne ankete" },
];

export const publicNavLinks: NavLink[] = [
  { href: "/", label: "Početna" },
  { href: "/login", label: "Prijava" },
];

export const featureIcons = {
  home: Home,
  surveys: ClipboardList,
  analytics: BarChart3,
};
