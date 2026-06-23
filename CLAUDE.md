# Ithemba Kuluntu CRM

## Wat is dit project?
Een CRM systeem voor Ithemba Kuluntu, een NGO uit Zuid-Afrika. Mehret Rijksen is consultant gevestigd in Nederland en gebruikt dit systeem om bedrijven te closen als partners/donateurs.

## Wie gebruikt het?
- **Mehret Rijksen** (consultant, Nederland) — mehretrijksen@gmail.com
- **CEO van Ithemba Kuluntu** (Zuid-Afrika) — info@ithembakuluntu.org
- **Partners/donateurs** — vullen het registratieformulier in na closing

## Wat doet het systeem?
1. **Dashboard** (`/dashboard`) — beveiligd met login, toont statistieken + tabel met zoek/filter/sorteer
2. **Partner detail** (`/dashboard/partner/[id]`) — alle info van één partner
3. **Partner bewerken** (`/dashboard/partner/[id]/bewerken`) — info aanpassen
4. **Partner verwijderen** — knop op detail pagina met bevestiging
5. **Partnerformulier** (`/partner/nieuw?token=ithemba2026partners`) — beveiligd met token
6. **Automatische emails** — partner krijgt NL+EN bevestiging, Mehret én CEO krijgen notificatie

## Tech stack
- **Framework:** Next.js 15 (App Router, TypeScript, Tailwind CSS)
- **Database:** Supabase — project: `ttiaofqufuovqlikqehk`
- **Auth:** Supabase Auth (email/password)
- **Email:** Resend (tijdelijk via `onboarding@resend.dev`, later `info@ithembakuluntu.org`)
- **Hosting:** Vercel — https://ithemba-crm.vercel.app

## Accounts & toegang
- **GitHub:** github.com/MehretRijksen/ithemba-crm
- **Supabase:** supabase.com — project iThemba-crm
- **Resend:** resend.com — account mehretrijksen
- **Vercel:** vercel.com — account Mehret Rijksen (Hobby plan)

## Lokaal draaien
```bash
cd C:\Users\Mehret\ithemba-crm
npm run dev
# Open http://localhost:3000
```

## Deployen
Elke `git push` naar `master` deployt automatisch naar Vercel.

```bash
git add .
git commit -m "omschrijving"
git push
```

## Partnerformulier link
De link die je naar partners stuurt:
`https://ithemba-crm.vercel.app/partner/nieuw?token=ithemba2026partners`

## Supabase database structuur
### Tabel: partners
| Kolom | Type |
|-------|------|
| id | uuid (primary key) |
| voornaam | text |
| achternaam | text |
| bedrijfsnaam | text |
| functie | text |
| email | text |
| telefoon | text |
| website | text |
| type | text (partner/donateur/beide) |
| opmerkingen | text |
| created_at | timestamp |

### Tabel: form_submissions (rate limiting)
| Kolom | Type |
|-------|------|
| id | uuid |
| ip | text |
| created_at | timestamp |

### Tabel: error_logs
| Kolom | Type |
|-------|------|
| id | uuid |
| bericht | text |
| context | text |
| created_at | timestamp |

## Beveiliging
- Row Level Security aan op alle tabellen
- Service role policies ingesteld op alle tabellen
- Rate limiting: max 5 formulier-inzendingen per IP per uur
- CSRF bescherming: alleen verzoeken van `ithemba-crm.vercel.app` of `localhost:3000`
- Formulier beveiligd met token: `ithemba2026partners`

## Wat nog gedaan moet worden
### Hoog
- [ ] Email domein instellen (`info@ithembakuluntu.org`) — na woensdag
- [ ] Eigen domeinnaam (`crm.ithembakuluntu.org`)

### Middel
- [ ] Export naar Excel/CSV
- [ ] Design verbeteren
- [ ] Email opmaak met logo

### Laag
- [ ] Database backup strategie documenteren
