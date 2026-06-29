# Ithemba Kuluntu CRM

## Wat is dit project?
Een CRM systeem voor Ithemba Kuluntu, een NGO uit Zuid-Afrika. Mehret Rijksen is consultant gevestigd in Nederland en gebruikt dit systeem om bedrijven te closen als partners/donateurs.

## Wie gebruikt het?
- **Mehret Rijksen** (consultant, Nederland) — mehretrijksen@gmail.com
- **CEO van Ithemba Kuluntu** (Zuid-Afrika) — info@ithembakuluntu.org
- **Partners/donateurs** — ontvangen contract via email na closing

## Wat doet het systeem?

### Dashboard (intern, alleen Mehret + CEO)
- Login met email/wachtwoord (Supabase Auth)
- Overzicht van alle partners met zoeken, filteren, sorteren
- Statistieken: totaal, partners, donateurs, beide
- CSV export van alle partners
- Wachtwoord vergeten functie

### Nieuwe partner toevoegen (intern)
Route: `/dashboard/partner/nieuw`
Mehret vult altijd zelf het formulier in. Twee flows:

**Prospect (nog niet gesloten):**
- Basisgegevens invullen
- Partner krijgt een nette bedankmail

**Gesloten (deal gesloten):**
- Basisgegevens + bedrag, frequentie, looptijd, betalingswijze
- Contract wordt automatisch gegenereerd
- Partner krijgt email met link om contract te ondertekenen

### Contract systeem
- Route: `/contract/[token]` — publiek toegankelijk voor partner
- Partner leest contract en typt naam om digitaal te ondertekenen
- Geldig als Simple Electronic Signature onder EU eIDAS
- Na ondertekening: bevestiging naar partner + notificatie naar Mehret + CEO
- Contract opgeslagen in database (ondertekend_op, IP, naam)

### Partner beheer
- Detail pagina: `/dashboard/partner/[id]`
- Bewerken: `/dashboard/partner/[id]/bewerken`
- Verwijderen: knop op detail pagina met bevestiging

### Extern partnerformulier (backup)
Route: `/partner/nieuw?token=ithemba2026partners`
Beveiligd met token — voor als partner zelf wil invullen.

### Automatische backup
Elke maandag 8:00 UTC → CSV per email naar mehretrijksen@gmail.com

## Tech stack
- **Framework:** Next.js 15 (App Router, TypeScript, Tailwind CSS)
- **Database:** Supabase — project: `ttiaofqufuovqlikqehk`
- **Auth:** Supabase Auth (email/password)
- **Email:** Resend (tijdelijk via `onboarding@resend.dev`, later `info@ithembakuluntu.org`)
- **Hosting:** Vercel — https://ithemba-crm.vercel.app

## Organisatie gegevens (voor contract)
- **Naam:** iThemba Kuluntu e.V.
- **Adres:** Am Emberg 20, 57399 Kirchhundem, Duitsland
- **BTW:** DE370051614
- **Vereinsregisternummer:** ← nog opvragen bij CEO

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

## Alle links
| Pagina | URL |
|--------|-----|
| Login | https://ithemba-crm.vercel.app/login |
| Dashboard | https://ithemba-crm.vercel.app/dashboard |
| Nieuwe partner | https://ithemba-crm.vercel.app/dashboard/partner/nieuw |
| Extern formulier | https://ithemba-crm.vercel.app/partner/nieuw?token=ithemba2026partners |
| Contract | https://ithemba-crm.vercel.app/contract/[token] |

## Database structuur

### Tabel: partners
| Kolom | Type | Beschrijving |
|-------|------|--------------|
| id | uuid | Primary key |
| voornaam | text | |
| achternaam | text | |
| bedrijfsnaam | text | |
| functie | text | |
| email | text | Uniek |
| telefoon | text | |
| website | text | |
| type | text | partner / donateur / beide |
| opmerkingen | text | |
| status | text | prospect / partner |
| bedrag | numeric | Alleen bij gesloten partners |
| frequentie | text | maandelijks / jaarlijks / eenmalig |
| looptijd | text | onbepaald / 1jaar / 2jaar / 5jaar |
| betalingswijze | text | sepa / overboeking |
| contract_token | uuid | Unieke link voor ondertekening |
| contract_ondertekend | boolean | |
| contract_ondertekend_op | timestamp | |
| contract_ip | text | IP bij ondertekening |
| contract_naam | text | Getypte naam bij ondertekening |
| created_at | timestamp | |

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
- Row Level Security (RLS) op alle tabellen
- Service role policies op alle tabellen
- Rate limiting: max 5 inzendingen per IP per uur (extern formulier)
- CSRF bescherming op extern formulier
- Extern formulier beveiligd met token: `ithemba2026partners`
- Contract ondertekening: naam check + akkoord checkbox + IP/timestamp logging
- Intern formulier beschermd door Supabase Auth middleware

## Email flows
| Situatie | Ontvanger | Onderwerp |
|----------|-----------|-----------|
| Prospect toegevoegd | Partner | Bedankt voor ons gesprek |
| Partner gesloten | Partner | Contract ondertekenen |
| Contract ondertekend | Partner | Bevestiging ondertekening |
| Contract ondertekend | Mehret + CEO | Notificatie |
| Extern formulier ingevuld | Partner | Welcome / Welkom |
| Extern formulier ingevuld | Mehret + CEO | Nieuwe partner geregistreerd |
| Wekelijkse backup | Mehret | CSV bijlage |

## Wat nog gedaan moet worden
### Hoog
- [ ] Email domein instellen (`info@ithembakuluntu.org`) — na woensdag
- [ ] Vereinsregisternummer opvragen bij CEO → toevoegen aan contract

### Middel
- [ ] Mollie koppelen voor automatische incasso (SEPA)
- [ ] Status zichtbaar maken in dashboard tabel (prospect/partner/ondertekend)
- [ ] Eigen domeinnaam (`crm.ithembakuluntu.org`)

### Laag
- [ ] Design verbeteren
- [ ] Paginering bij veel partners
- [ ] Partner status (actief/inactief)
