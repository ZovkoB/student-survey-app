"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useActionState, useEffect, useState } from "react";

import {
  registerUser,
  type AuthActionState,
} from "@/app/actions/auth";
import {
  FSRE_EMAIL_DOMAIN_MESSAGE,
  isFsreEmail,
  type RegisterInput,
} from "@/lib/validations/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const DEMO_VERIFICATION_CODE = "123456";

const initialState: AuthActionState = {
  success: false,
  message: "",
};

const inputClassName =
  "bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 rounded-lg p-3 text-sm h-auto";

const yearOfStudyOptions = [
  { value: "1", label: "1. godina" },
  { value: "2", label: "2. godina" },
  { value: "3", label: "3. godina" },
  { value: "4", label: "4. godina" },
  { value: "5", label: "5. godina" },
] as const;

const emailErrorClassName =
  "border-rose-400 focus:border-rose-500 focus:ring-rose-100";

type RegisterStep = "form" | "verify";

type FormField = keyof RegisterInput;

type ClientFieldErrors = Partial<Record<FormField, string>>;

function EmailErrorMessage() {
  return (
    <span className="mt-1 block text-xs font-medium text-rose-500">
      {FSRE_EMAIL_DOMAIN_MESSAGE}
    </span>
  );
}

function FieldErrorMessage({ message }: { message: string }) {
  return (
    <span className="mt-1 block text-xs font-medium text-rose-500">{message}</span>
  );
}

function FormErrorBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
    >
      {message}
    </div>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState<RegisterStep>("form");
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);
  const [clientErrors, setClientErrors] = useState<ClientFieldErrors>({});
  const [verificationCode, setVerificationCode] = useState("");
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [studyProgram, setStudyProgram] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [state, formAction, isPending] = useActionState(
    registerUser,
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      router.push("/login?registered=true");
      return;
    }

    if (state.fieldErrors && Object.keys(state.fieldErrors).length > 0) {
      setStep("form");
      setClientErrors((prev) => ({
        ...prev,
        ...(state.fieldErrors as ClientFieldErrors),
      }));
    }
  }, [state.success, state.fieldErrors, router]);

  function getFieldError(field: FormField) {
    return clientErrors[field] ?? state.fieldErrors?.[field]?.[0];
  }

  function validateEmail(value: string): string | null {
    const trimmed = value.trim();
    if (!trimmed || !isFsreEmail(trimmed)) {
      return FSRE_EMAIL_DOMAIN_MESSAGE;
    }
    return null;
  }

  function handleEmailBlur() {
    const error = validateEmail(email);
    setClientErrors((prev) => {
      const next = { ...prev };
      if (error) {
        next.email = error;
      } else {
        delete next.email;
      }
      return next;
    });
  }

  function validateRegistrationForm(): ClientFieldErrors {
    const errors: ClientFieldErrors = {};

    const emailError = validateEmail(email);
    if (emailError) {
      errors.email = emailError;
    }

    if (!studyProgram.trim()) {
      errors.studyProgram = "Studijski smjer je obavezan";
    }

    const parsedYear = Number.parseInt(yearOfStudy, 10);
    if (!yearOfStudy.trim() || Number.isNaN(parsedYear) || parsedYear < 1 || parsedYear > 5) {
      errors.yearOfStudy = "Godina studija mora biti između 1 i 5";
    }

    if (!password) {
      errors.password = "Lozinka je obavezna";
    } else if (password.length < 8) {
      errors.password = "Lozinka mora imati najmanje 8 znakova";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Potvrdite lozinku";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Lozinke se ne podudaraju";
    }

    return errors;
  }

  function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setVerifyError(null);

    const errors = validateRegistrationForm();
    setClientErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    const formData = new FormData();
    formData.set("email", email.trim());
    formData.set("studyProgram", studyProgram.trim());
    formData.set("yearOfStudy", yearOfStudy.trim());
    formData.set("password", password);
    formData.set("confirmPassword", confirmPassword);

    setPendingFormData(formData);
    setVerificationCode("");
    setStep("verify");
  }

  function handleVerifySubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setVerifyError(null);

    if (verificationCode.trim() !== DEMO_VERIFICATION_CODE) {
      setVerifyError("Neispravan kod. Pokušajte ponovno.");
      return;
    }

    if (pendingFormData) {
      startTransition(() => {
        formAction(pendingFormData);
      });
    }
  }

  function handleBackToForm() {
    setStep("form");
    setVerifyError(null);
    setVerificationCode("");
  }

  const showFormBanner =
    step === "form" &&
    !state.success &&
    Boolean(state.message) &&
    !(state.fieldErrors && Object.keys(state.fieldErrors).length > 0);

  const emailHasError = Boolean(getFieldError("email"));

  return (
    <div className="mx-auto w-full max-w-xl rounded-2xl border border-slate-200/80 bg-white p-10 shadow-md">
      {step === "form" ? (
        <>
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900">Registracija</h1>
            <p className="mb-6 text-base text-slate-600">
              Kreirajte račun s fakultetskom e-poštom.
            </p>
          </div>

          <form noValidate onSubmit={handleFormSubmit} className="space-y-4">
            {showFormBanner && <FormErrorBanner message={state.message} />}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                E-pošta
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="vi@fsre.sum.ba"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (clientErrors.email) {
                    setClientErrors((prev) => {
                      const next = { ...prev };
                      delete next.email;
                      return next;
                    });
                  }
                }}
                onBlur={handleEmailBlur}
                aria-invalid={emailHasError}
                className={cn(inputClassName, emailHasError && emailErrorClassName)}
              />
              {emailHasError && <EmailErrorMessage />}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="studyProgram"
                className="text-sm font-medium text-slate-700"
              >
                Studijski smjer
              </Label>
              <Input
                id="studyProgram"
                name="studyProgram"
                placeholder="npr. Računarstvo"
                value={studyProgram}
                onChange={(event) => setStudyProgram(event.target.value)}
                aria-invalid={!!getFieldError("studyProgram")}
                className={cn(
                  inputClassName,
                  getFieldError("studyProgram") && emailErrorClassName,
                )}
              />
              {getFieldError("studyProgram") && (
                <FieldErrorMessage message={getFieldError("studyProgram")!} />
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="yearOfStudy"
                className="text-sm font-medium text-slate-700"
              >
                Godina studija
              </Label>
              <select
                id="yearOfStudy"
                name="yearOfStudy"
                value={yearOfStudy}
                onChange={(event) => {
                  setYearOfStudy(event.target.value);
                  if (clientErrors.yearOfStudy) {
                    setClientErrors((prev) => {
                      const next = { ...prev };
                      delete next.yearOfStudy;
                      return next;
                    });
                  }
                }}
                aria-invalid={!!getFieldError("yearOfStudy")}
                className={cn(
                  inputClassName,
                  "h-auto w-full",
                  getFieldError("yearOfStudy") && emailErrorClassName,
                )}
              >
                <option value="">Odaberite godinu</option>
                {yearOfStudyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {getFieldError("yearOfStudy") && (
                <FieldErrorMessage message={getFieldError("yearOfStudy")!} />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                Lozinka
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-invalid={!!getFieldError("password")}
                className={cn(
                  inputClassName,
                  getFieldError("password") && emailErrorClassName,
                )}
              />
              {getFieldError("password") && (
                <FieldErrorMessage message={getFieldError("password")!} />
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-slate-700"
              >
                Potvrda lozinke
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                aria-invalid={!!getFieldError("confirmPassword")}
                className={cn(
                  inputClassName,
                  getFieldError("confirmPassword") && emailErrorClassName,
                )}
              />
              {getFieldError("confirmPassword") && (
                <FieldErrorMessage message={getFieldError("confirmPassword")!} />
              )}
            </div>

            <button
              type="submit"
              className="mt-4 w-full rounded-xl bg-[#5c4eb4] py-3.5 text-base font-semibold text-white shadow-sm transition-all hover:bg-[#4c3ea4]"
            >
              Kreiraj račun
            </button>
          </form>
        </>
      ) : (
        <>
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900">Potvrda e-pošte</h1>
            <p className="mb-6 text-base text-slate-600">
              Unesite 6-znamenkasti kod poslan na{" "}
              <span className="font-medium text-slate-900">{email}</span>.
            </p>
          </div>

          <form noValidate onSubmit={handleVerifySubmit} className="space-y-4">
            {!state.success && state.message && (
              <FormErrorBanner message={state.message} />
            )}

            <div className="space-y-2">
              <Label
                htmlFor="verificationCode"
                className="text-sm font-medium text-slate-700"
              >
                Verifikacijski kod
              </Label>
              <Input
                id="verificationCode"
                name="verificationCode"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123456"
                maxLength={6}
                value={verificationCode}
                onChange={(event) =>
                  setVerificationCode(
                    event.target.value.replace(/\D/g, "").slice(0, 6),
                  )
                }
                aria-invalid={!!verifyError}
                className={cn(
                  inputClassName,
                  "tracking-[0.3em] text-center",
                  verifyError && emailErrorClassName,
                )}
              />
              {verifyError && <FieldErrorMessage message={verifyError} />}
              <p className="text-xs text-slate-500">
                Demo način: koristite kod <strong>123456</strong>.
              </p>
            </div>

            <button
              type="submit"
              disabled={isPending || verificationCode.length !== 6}
              className="mt-4 w-full rounded-xl bg-[#5c4eb4] py-3.5 text-base font-semibold text-white shadow-sm transition-all hover:bg-[#4c3ea4] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Kreiranje računa..." : "Potvrdi i registriraj se"}
            </button>

            <button
              type="button"
              onClick={handleBackToForm}
              disabled={isPending}
              className="w-full py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 disabled:opacity-60"
            >
              Natrag na obrazac
            </button>
          </form>
        </>
      )}

      <p className="mt-6 text-center text-sm text-slate-600">
        Već imate račun?{" "}
        <Link
          href="/login"
          className="font-semibold text-[#5c4eb4] hover:underline"
        >
          Prijavite se
        </Link>
      </p>
    </div>
  );
}
