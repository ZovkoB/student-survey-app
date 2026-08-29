"use client";

import { useState } from "react";
import { Users, X } from "lucide-react";
import { toast } from "sonner";

import { createAdminUser } from "@/app/actions/admin-users";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CreateAdminField } from "@/lib/validations/admin-user";

const inputClassName =
  "rounded-xl border-slate-200 bg-slate-50 p-2.5 text-sm text-slate-900 focus:border-[#5c4eb4] focus:bg-white focus:ring-2 focus:ring-[#5c4eb4]/10 focus-visible:ring-offset-0";

const emptyForm = {
  fullName: "",
  email: "",
  password: "",
};

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-1 text-xs font-medium text-rose-500">{message}</p>;
}

export function CreateAdminDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<CreateAdminField, string>>
  >({});

  function openDialog() {
    setForm(emptyForm);
    setFieldErrors({});
    setIsOpen(true);
  }

  function closeDialog() {
    if (isSubmitting) {
      return;
    }

    setIsOpen(false);
  }

  function updateField(field: CreateAdminField, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});

    const result = await createAdminUser(form);

    if (!result.success) {
      if (result.fieldErrors) {
        const nextErrors: Partial<Record<CreateAdminField, string>> = {};

        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) {
            nextErrors[field as CreateAdminField] = messages[0];
          }
        }

        setFieldErrors(nextErrors);
      }

      toast.error(result.message);
      setIsSubmitting(false);
      return;
    }

    toast.success(result.message);
    setIsSubmitting(false);
    setIsOpen(false);
    setForm(emptyForm);
  }

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-800 transition-all hover:bg-slate-200"
      >
        <Users className="h-4 w-4" />
        Upravljanje korisnicima
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Zatvori"
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={closeDialog}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-admin-title"
            className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <h2
                id="create-admin-title"
                className="text-xl font-bold text-slate-900"
              >
                Kreiraj novog administratora
              </h2>
              <button
                type="button"
                onClick={closeDialog}
                disabled={isSubmitting}
                className="rounded-lg p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <Label htmlFor="admin-full-name" className="text-sm text-slate-700">
                  Ime i prezime
                </Label>
                <Input
                  id="admin-full-name"
                  value={form.fullName}
                  onChange={(event) => updateField("fullName", event.target.value)}
                  placeholder="npr. Ana Anić"
                  className={inputClassName}
                  autoComplete="name"
                />
                <FieldError message={fieldErrors.fullName} />
              </div>

              <div>
                <Label htmlFor="admin-email" className="text-sm text-slate-700">
                  E-pošta
                </Label>
                <Input
                  id="admin-email"
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder="ime.prezime@fsre.sum.ba"
                  className={inputClassName}
                  autoComplete="off"
                />
                <FieldError message={fieldErrors.email} />
              </div>

              <div>
                <Label htmlFor="admin-password" className="text-sm text-slate-700">
                  Privremena lozinka
                </Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={form.password}
                  onChange={(event) => updateField("password", event.target.value)}
                  placeholder="Najmanje 8 znakova"
                  className={inputClassName}
                  autoComplete="new-password"
                />
                <FieldError message={fieldErrors.password} />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeDialog}
                  disabled={isSubmitting}
                  className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-60"
                >
                  Odustani
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-[#5c4eb4] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#4c3ea4] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Kreiranje..." : "Kreiraj admina"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
