# Web aplikacija za anketiranje studenata i analizu rezultata

Aplikacija za anonimno provođenje studentskih anketa i analizu rezultata evaluacije nastave na FSRE. Studenti ispunjavaju ankete anonimno, a administratori/profesori upravljaju anketama i pregledavaju analitiku.

**Tehnologije:** Next.js (App Router), React, Tailwind CSS, Prisma, Supabase (PostgreSQL), NextAuth.js

## Kako pokrenuti

Trebaš imati instalirano: Node.js.

### 1. Konfiguracija okruženja

Prije pokretanja napravi `.env` datoteku (po uzoru na `.env.example`) i upiši pristupne podatke za Supabase bazu.

### 2. Pokretanje aplikacije

```bash
npm install
npx prisma generate
npm run dev
```

Aplikacija radi na http://localhost:3000

### 3. Baza i testni podaci (ako se koristi nova baza)

```bash
npx prisma migrate dev
npx prisma db seed
```
