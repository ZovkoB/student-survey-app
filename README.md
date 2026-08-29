# Sustav za studentske ankete FSRE

Službena web aplikacija za anonimno provođenje studentskih anketa i evaluaciju nastave na Fakultetu strojarstva, računarstva i elektrotehnike (FSRE).

Studenti ispunjavaju ankete prilagođene svom studijskom smjeru i godini. Administratori kreiraju ankete, prate odgovore i pregledavaju analitiku.

## Tehnologije

- **Next.js** (App Router) + **React** + **TypeScript**
- **Tailwind CSS** za stilizaciju
- **Prisma** + **PostgreSQL** baza podataka
- **NextAuth.js** (Credentials + JWT) za autentifikaciju

## Preduvjeti

Prije pokretanja projekta potrebno je imati instalirano:

- [Node.js](https://nodejs.org/) 20+
- [npm](https://www.npmjs.com/)
- PostgreSQL baza podataka (lokalno ili cloud, npr. Supabase / Neon)

## Instalacija i pokretanje

### 1. Klonirajte repozitorij i instalirajte ovisnosti

```bash
npm install
```

### 2. Postavite okruženje (`.env`)

U korijenu projekta kreirajte datoteku `.env` sa sljedećim varijablama:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
AUTH_SECRET="generirajte-dugi-slucajni-string"
```

- `DATABASE_URL` — connection string za Prisma klijent
- `DIRECT_URL` — direktna veza za migracije (Prisma)
- `AUTH_SECRET` — tajna za NextAuth sesije (npr. `openssl rand -base64 32`)

### 3. Primijenite migracije baze

```bash
npx prisma migrate dev
```

### 4. Popunite bazu test podacima

```bash
npx prisma db seed
```

Seed kreira administratorski račun, studentske račune, demo ankete i primjere odgovora.

### 5. Pokrenite razvojni server

```bash
npm run dev
```

Aplikacija je dostupna na [http://localhost:3000](http://localhost:3000).

## Demo testni pristupni podaci

Svi seed računi koriste istu lozinku: **`password123`**

### Administrator

| Uloga | E-pošta | Lozinka | Dashboard |
|-------|---------|---------|-----------|
| Admin | `admin@fsre.sum.ba` | `password123` | `/admin/dashboard` |

### Studenti — Računarstvo

| E-pošta | Godina |
|---------|--------|
| `marko.ramic@fsre.sum.ba` | 1 |
| `ana.hodzic@fsre.sum.ba` | 3 |
| `petra.nikolic@fsre.sum.ba` | 2 |
| `sara.begic@fsre.sum.ba` | 3 |

### Studenti — Strojarstvo

| E-pošta | Godina |
|---------|--------|
| `ivan.kovacevic@fsre.sum.ba` | 2 |
| `lejla.selimovic@fsre.sum.ba` | 4 |

### Studenti — Elektrotehnika

| E-pošta | Godina |
|---------|--------|
| `dino.mujkic@fsre.sum.ba` | 5 |
| `emir.jahic@fsre.sum.ba` | 1 |
| `tarik.salkic@fsre.sum.ba` | 3 |
| `mina.turic@fsre.sum.ba` | 2 |

Nakon prijave studenti se preusmjeravaju na `/surveys`. Administratori na `/admin/dashboard`.

## Korisne naredbe

| Naredba | Opis |
|---------|------|
| `npm run dev` | Pokretanje dev servera |
| `npm run build` | Production build |
| `npm run start` | Pokretanje production servera |
| `npm run lint` | ESLint provjera |
| `npx prisma db seed` | Ponovno punjenje demo podataka |
| `npx prisma studio` | GUI pregled baze podataka |

## Napomene

- Registracija novih studenata zahtijeva e-poštu domena `@fsre.sum.ba`.
- Demo verifikacijski kod pri registraciji: **`123456`**
- Seed skripta briše postojeće studentske podatke i ankete pri svakom pokretanju (admin račun se zadržava/ažurira).
