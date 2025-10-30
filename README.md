BnB – Frontend (Next.js + TypeScript)

En enkel BnB-frontend som pratar med min backend (Hono + Supabase).
Funktionellt fokus: autentisering via cookies, lista properties, skapa property, samt grund för bokningar.

🔧 Tech stack

Next.js 16 (App Router)

TypeScript

Tailwind CSS

Fetch API med credentials: 'include' (cookies)

Context för användare (contexts/user.tsx)

🗂️ Projektstruktur (kort)
app/
  login/page.tsx           # Login/Signup formulär
  properties/page.tsx      # Lista properties (GET)
  properties/new/page.tsx  # Skapa property (POST)
  layout.tsx, page.tsx     # Next.js bas
components/
  PageWrapper.tsx          # Skyddar sidor bakom login
contexts/
  user.tsx                 # UserContext (hämtar /auth/me)
lib/
  http.ts                  # fetchJson helper
public/                    # Ikoner/bilder

🚀 Kom igång
1) Klona & installera
git clone https://github.com/lindazelizi/Inviduell-backend-2-frontend.git
cd Inviduell-backend-2-frontend
npm install

2) Miljövariabler

Skapa en fil .env.local i projektroten:

# Din backend-bas (port enligt din Hono-server)
NEXT_PUBLIC_BACKEND_BASE_URL=http://localhost:5177


Byt till din deployade backend-URL vid produktion (t.ex. på Render/Fly/railway).

3) Starta dev-server
npm run dev


Öppna: http://localhost:3000

🔐 CORS & Cookies (viktigt)

I backend måste CORS tillåta din frontend-origin och credentials:

// backend/src/index.ts
import { cors } from "hono/cors";

app.use(
  "*",
  cors({
    origin: ["http://localhost:3000"],
    allowMethods: ["GET","POST","PUT","DELETE","PATCH","OPTIONS"],
    allowHeaders: ["Content-Type","Authorization"],
    credentials: true, // <- krävs för cookies
  })
);


I frontend skickas alltid cookies så här:

await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include", // <- viktigt
  body: JSON.stringify({ email, password }),
});

✅ Implementerade sidor/flows
Login/Signup

Route: /login

Komponent: app/login/page.tsx

Gör: POST till /auth/login eller /auth/register, cookies sätts av backend (HttpOnly)

Lista properties

Route: /properties

Komponent: app/properties/page.tsx

Gör: GET /properties (public read), visar lista

Context: UserContext hämtar /auth/me i bakgrunden

Skapa property

Route: /properties/new

Komponent: app/properties/new/page.tsx

Gör: POST /properties med credentials: 'include'

Kräver inloggning → skyddas av PageWrapper

Nästa steg (rekommenderat): lägg till edit/delete av property och sidor för bookings:

Lista & skapa bokningar (POST /bookings räknar totalpris auto)

Mina bokningar (GET /bookings) – kräver login

🧩 UserContext

contexts/user.tsx hämtar nuvarande användare via /auth/me när appen laddar.
Använd PageWrapper för att skydda sidor:

// exempel
import PageWrapper from "@/components/PageWrapper";

export default function ProtectedPage() {
  return (
    <PageWrapper>
      <div>Endast för inloggade</div>
    </PageWrapper>
  );
}

🔗 API-kontrakt (som frontenden förväntar sig)
Auth

POST /auth/login { email, password } → 200 + Set-Cookie

POST /auth/register { email, password } → 200 + Set-Cookie

GET /auth/me → { id, email } eller 401

Properties

GET /properties → { data: Property[] }

POST /properties (auth) → body:

{
  "title": "Cozy cabin",
  "description": "Near lake",
  "location": "Åre",
  "price_per_night": 1200,
  "is_active": true
}

Bookings (senare)

GET /bookings (auth) → egna + som värd

POST /bookings (auth) → { property_id, check_in, check_out }

Backend beräknar nights & total_price

🧪 Kör lokalt mot backend

Starta backend (Hono) – se till att HONO_PORT=5177 eller uppdatera NEXT_PUBLIC_BACKEND_BASE_URL.

Starta frontend på port 3000:

npm run dev


Testflöde:

Gå till /login, registrera eller logga in.

Gå till /properties (ska lista befintliga).

Gå till /properties/new, skapa en property.

(Senare) Lägg till bookings-sidor.

🧵 Branch-strategi

staging = arbetande branch (default på GitHub)

main = stabil/klar att demo/deploy

Flöde:

# jobba på staging
git checkout staging
git add .
git commit -m "Feature: properties list"
git push

# PR staging -> main på GitHub när du är klar

🧩 Vanliga fel & lösningar

401 på /auth/me: du är inte inloggad eller cookies skickas inte → kolla credentials: 'include' och CORS.

CORS error i konsolen: säkerställ att backend origin inkluderar http://localhost:3000 och credentials: true.

Cookies syns inte i browsern: kontrollera att backend sätter cookie med HttpOnly; SameSite=None; Secure (dev kan ibland tillåta utan Secure, beror på miljö).

📦 Deploy (tips)

Frontend: Vercel (Next.js auto)

Backend: Render/Fly/Railway

Uppdatera .env.local i frontend med din publika backend-URL.