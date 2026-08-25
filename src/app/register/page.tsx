"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";

import {
  registerUser,
  type AuthActionState,
} from "@/app/actions/auth";
import type { RegisterInput } from "@/lib/validations/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const initialState: AuthActionState = {
  success: false,
  message: "",
};

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"ADMIN" | "STUDENT">("STUDENT");
  const [state, formAction, isPending] = useActionState(
    registerUser,
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      router.push("/login?registered=true");
    }
  }, [state.success, router]);

  function getFieldError(field: keyof RegisterInput) {
    return state.fieldErrors?.[field]?.[0];
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            Register as an admin or student to use the survey platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            {!state.success && state.message && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@university.edu"
                aria-invalid={!!getFieldError("email")}
              />
              {getFieldError("email") && (
                <p className="text-sm text-destructive">
                  {getFieldError("email")}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={role}
                onValueChange={(value) =>
                  setRole(value as "ADMIN" | "STUDENT")
                }
              >
                <SelectTrigger id="role" aria-label="Role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STUDENT">Student</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
              <input type="hidden" name="role" value={role} />
              {getFieldError("role") && (
                <p className="text-sm text-destructive">
                  {getFieldError("role")}
                </p>
              )}
            </div>

            {role === "STUDENT" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="studyProgram">Study program</Label>
                  <Input
                    id="studyProgram"
                    name="studyProgram"
                    placeholder="e.g. Computer Science"
                    aria-invalid={!!getFieldError("studyProgram")}
                  />
                  {getFieldError("studyProgram") && (
                    <p className="text-sm text-destructive">
                      {getFieldError("studyProgram")}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearOfStudy">Year of study</Label>
                  <Input
                    id="yearOfStudy"
                    name="yearOfStudy"
                    type="number"
                    min={1}
                    max={6}
                    placeholder="1"
                    aria-invalid={!!getFieldError("yearOfStudy")}
                  />
                  {getFieldError("yearOfStudy") && (
                    <p className="text-sm text-destructive">
                      {getFieldError("yearOfStudy")}
                    </p>
                  )}
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                aria-invalid={!!getFieldError("password")}
              />
              {getFieldError("password") && (
                <p className="text-sm text-destructive">
                  {getFieldError("password")}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                aria-invalid={!!getFieldError("confirmPassword")}
              />
              {getFieldError("confirmPassword") && (
                <p className="text-sm text-destructive">
                  {getFieldError("confirmPassword")}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
