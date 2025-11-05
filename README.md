# BnB Frontend

## Översikt
Detta är en frontend byggd med Next.js 16 och Tailwind CSS.  
Applikationen hanterar inloggning, registrering, skapande av annonser, bokningar och visning av publika boenden.  
Frontend kommunicerar med backend via REST API och använder Supabase Auth för sessionshantering.

---

## Systemkrav
- Node.js 20 eller senare  
- npm eller pnpm  
- En körande backend på `http://localhost:5177`

---

## Installation
Kör följande kommandon i projektets rot:
```bash
npm install
npm run dev
Applikationen startar på http://localhost:3000.

NEXT_PUBLIC_BACKEND_BASE_URL=http://localhost:5177
BACKEND_ORIGIN=http://localhost:5177
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

Funktioner

Publik lista över aktiva boenden med sökning på titel eller plats

Detaljsida med galleri och lightbox

Gäst kan boka och se sina bokningar

Värd kan skapa, redigera och ta bort annonser

Filuppladdning till Supabase Storage via backend

Inloggning, utloggning och automatisk sessionhantering via Supabase

Klient- och serveranrop med hantering av cookies och tokens

Flöde

Starta backend och frontend.

Gå till /register för att skapa ett konto.

Logga in med dina uppgifter.

Om du är värd: skapa och hantera dina annonser.

Om du är gäst: boka boenden och se dina bokningar.

Bildhantering

Endast bilder från dessa domäner stöds av Next.js Image-komponenten:

images.unsplash.com

*.supabase.co

Inställt i next.config.js.