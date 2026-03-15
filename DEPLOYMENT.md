# HC Breda Evaluatie App — Deployment Handleiding

## Wat je nodig hebt
- Een browser (Chrome, Firefox, Edge)
- Een gratis GitHub account → github.com
- Een gratis Supabase account → supabase.com
- Een gratis Vercel account → vercel.com

---

## Stap 1 — Supabase instellen (database + login)

1. Ga naar **supabase.com** en maak een gratis account
2. Klik **New Project** → vul een naam in (bijv. "hcbreda") → kies een regio → sla het wachtwoord op
3. Wacht tot het project klaar is (±1 minuut)
4. Ga naar **SQL Editor** (linkermenu)
5. Klik **New query**
6. Open het bestand `supabase_setup.sql` uit deze map, kopieer alles, plak het in de editor
7. Klik **Run** — je ziet "Success" als alles goed gaat
8. Ga naar **Project Settings → API**
9. Noteer:
   - **Project URL** (begint met https://...)
   - **anon / public** key

---

## Stap 2 — Omgevingsvariabelen instellen

1. Maak een nieuw bestand `.env` (kopieer `.env.example`)
2. Vul je Supabase gegevens in:
   ```
   VITE_SUPABASE_URL=https://jouw-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=jouw-anon-key
   ```

---

## Stap 3 — Code uploaden naar GitHub

1. Ga naar **github.com** en log in
2. Klik **New repository** → naam: "hcbreda-evaluatie" → Public → Create
3. Klik op **uploading an existing file**
4. Sleep alle bestanden uit de `hcbreda-app` map naar het uploadvenster
5. Klik **Commit changes**

> Let op: Voeg ook het `.env` bestand NIET toe aan GitHub (staat in `.gitignore`).
> De Supabase keys voeg je toe als omgevingsvariabelen in Vercel (stap 4).

---

## Stap 4 — Deployen op Vercel

1. Ga naar **vercel.com** en maak een gratis account (log in met GitHub)
2. Klik **Add New → Project**
3. Kies je GitHub repository `hcbreda-evaluatie`
4. Bij **Environment Variables** voeg je toe:
   - `VITE_SUPABASE_URL` = jouw Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = jouw anon key
5. Klik **Deploy** — Vercel bouwt en publiceert de app (±1 minuut)
6. Je krijgt een link zoals `hcbreda-evaluatie.vercel.app` — dit is de app!

---

## Stap 5 — Gebruikers aanmaken

In Supabase → **Authentication → Users** → **Add user**:

Voor elke coach/trainer/observator:
- E-mailadres invullen
- Tijdelijk wachtwoord instellen (zij kunnen het later aanpassen)
- Klik op de gebruiker → in **Raw User Meta Data** voeg je toe:
  ```json
  { "naam": "Jan Jansen", "rol": "coach" }
  ```
  Rollen: `coach`, `trainer`, `observator`, `hot`

### Teams koppelen aan coaches/trainers
In Supabase → **Table Editor → team_assignments**:
- `profiel_id` = de UUID van de coach/trainer (te vinden bij Authentication → Users)
- `team_id` = 1 (O8), 2 (O9), 3 (O10), 4 (O11)

---

## Stap 6 — Spelers toevoegen

Log in als HOT → ga naar **Beheer** tab → voeg spelers toe per team.

Of via Supabase → Table Editor → spelers → Insert.

---

## Rollen overzicht

| Rol | Wat ze zien | Wat ze kunnen invullen |
|-----|-------------|----------------------|
| `coach` | Alleen eigen team | Formulier A (eigen kolom) |
| `trainer` | Alleen eigen team | Formulier A (eigen kolom, apart van coach) |
| `observator` | Alle spelers | Formulier B (selectiedagen) |
| `hot` | Alles | Beheer + volledig dashboard |

---

## Vragen?

Neem contact op met de technisch beheerder of raadpleeg docs.supabase.com en vercel.com/docs.
