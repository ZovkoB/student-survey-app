"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { useState } from "react";
import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { cn } from "@/lib/utils";

const inputClassName =
  "bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 rounded-lg p-2.5 text-sm h-auto";

const fieldErrorClassName =
  "border-rose-400 focus:border-rose-500 focus:ring-rose-100";

function FieldErrorMessage({ message }: { message: string }) {
  return (
    <span className="mt-1 block text-xs font-medium text-rose-500">{message}</span>
  );
}

function resolvePostLoginPath(
  role: string | undefined,
  callbackUrl: string | null,
): string {
  if (role === "ADMIN") {
    if (callbackUrl?.startsWith("/admin")) {
      return callbackUrl;
    }
    return "/admin/dashboard";
  }

  if (role === "STUDENT") {
    if (callbackUrl?.startsWith("/surveys")) {
      return callbackUrl;
    }
    return "/surveys";
  }

  if (callbackUrl && callbackUrl !== "/") {
    return callbackUrl;
  }

  return "/surveys";
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const registered = searchParams.get("registered") === "true";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validateForm(): boolean {
    const errors: { email?: string; password?: string } = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      errors.email = "E-pošta je obavezna";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = "Unesite valjanu e-mail adresu";
    }

    if (!password) {
      errors.password = "Lozinka je obavezna";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const result = await signIn("credentials", {
      email: email.trim(),
      password,
      redirect: false,
    });

    if (result?.error) {
      setIsSubmitting(false);
      setError("Neispravna e-pošta ili lozinka. Pokušajte ponovno.");
      return;
    }

    const session = await getSession();
    const redirectPath = resolvePostLoginPath(
      session?.user?.role,
      callbackUrl,
    );

    router.push(redirectPath);
    router.refresh();
  }

  return (
    <div className="w-full max-w-xl rounded-2xl border border-slate-200/80 bg-white p-10 shadow-md">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Prijava</h1>
        <p className="text-base text-slate-600">
          Unesite svoje podatke za pristup studentskim anketama.
        </p>
      </div>

      <form
        noValidate
        autoComplete="off"
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        {registered && (
          <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900">
            <AlertDescription>
              Vaš račun je uspješno kreiran. Sada se možete prijaviti.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-slate-700">
            E-pošta
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="off"
            placeholder="vi@fsre.sum.ba"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (fieldErrors.email) {
                setFieldErrors((prev) => {
                  const next = { ...prev };
                  delete next.email;
                  return next;
                });
              }
            }}
            aria-invalid={!!fieldErrors.email}
            className={cn(inputClassName, fieldErrors.email && fieldErrorClassName)}
          />
          {fieldErrors.email && (
            <FieldErrorMessage message={fieldErrors.email} />
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-slate-700">
            Lozinka
          </Label>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="off"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              if (fieldErrors.password) {
                setFieldErrors((prev) => {
                  const next = { ...prev };
                  delete next.password;
                  return next;
                });
              }
            }}
            aria-invalid={!!fieldErrors.password}
            className={cn(
              inputClassName,
              fieldErrors.password && fieldErrorClassName,
            )}
          />
          {fieldErrors.password && (
            <FieldErrorMessage message={fieldErrors.password} />
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-[#5c4eb4] py-3 font-medium text-white shadow-sm transition-all hover:bg-[#4c3ea4] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Prijava u tijeku..." : "Prijava"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Nemate račun?{" "}
        <Link
          href="/register"
          className="font-semibold text-[#5c4eb4] hover:underline"
        >
          Registrirajte se
        </Link>
      </p>
    </div>
  );
}
