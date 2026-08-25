import type { Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      studyProgram: string | null;
      yearOfStudy: number | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
    studyProgram: string | null;
    yearOfStudy: number | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    studyProgram: string | null;
    yearOfStudy: number | null;
  }
}
