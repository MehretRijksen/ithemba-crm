# Ithemba Kuluntu CRM

## Wat is dit project?
Een CRM systeem voor Ithemba Kuluntu, een NGO uit Zuid-Afrika. Mehret Rijksen is consultant gevestigd in Nederland en gebruikt dit systeem om bedrijven te closen als partners/donateurs.

## Wie gebruikt het?
- **Mehret Rijksen** (consultant, Nederland) — mehretrijksen@gmail.com
- **CEO van Ithemba Kuluntu** (Zuid-Afrika) — heeft ook toegang tot het dashboard
- **Partners/donateurs** — vullen het registratieformulier in na closing

## Wat doet het systeem?
1. **Dashboard** (`/dashboard`) — beveiligd met login, toont alle partners in een tabel met zoek/filteroptie
2. **Partnerformulier** (`/partner/nieuw`) — publiek formulier dat partners invullen na closing
3. **Automatische emails** — partner krijgt bevestigingsmail, Mehret krijgt notificatie

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

## Wat nog gedaan moet worden (prioriteit)
### Hoog
- [ ] Email domein instellen (`info@ithembakuluntu.org`) zodra Mehret het Ithemba emailadres heeft (na woensdag)
- [ ] SQL uitvoeren in Supabase voor `form_submissions` tabel (rate limiting)
- [ ] Partner detail pagina — klik op een partner voor alle info
- [ ] Partner bewerken en verwijderen
- [ ] Statistieken bovenaan dashboard (aantal partners, donateurs, beide)
- [ ] Favicon instellen

### Middel
- [ ] Email ook naar CEO sturen bij nieuwe partner
- [ ] Export naar Excel/CSV
- [ ] Sorteren op kolommen in tabel
- [ ] Mobiel testen en verbeteren
- [ ] Eigen domeinnaam (`crm.ithembakuluntu.org`)

### Laag
- [ ] Bevestigingsmail ook in het Engels
- [ ] Error logging
- [ ] Betere emailopmaak met logo

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

### Tabel: form_submissions (voor rate limiting)
| Kolom | Type |
|-------|------|
| id | uuid |
| ip | text |
| created_at | timestamp |

## Belangrijk
- `.env.local` staat NIET op GitHub (staat in .gitignore) — bevat alle geheime keys
- Rate limiting: max 5 formulier-inzendingen per IP per uur
- CSRF bescherming: alleen verzoeken van `ithemba-crm.vercel.app` of `localhost:3000`
- Row Level Security staat aan in Supabase
