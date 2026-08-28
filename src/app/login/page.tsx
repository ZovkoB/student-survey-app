import { Suspense } from "react";

import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md text-center">
          <p className="text-sm text-slate-600">Učitavanje...</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
