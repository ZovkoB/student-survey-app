import { Suspense } from "react";

import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-xl text-center">
          <p className="text-sm text-slate-600">Učitavanje...</p>
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
