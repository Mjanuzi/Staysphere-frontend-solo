# StaySphere Frontend

Detta är frontend-klienten för StaySphere – en bokningsplattform där värdar kan skapa och hantera boenden och gäster kan söka, boka och lämna omdömen. Backend-API:t finns i ett separat repo: **Staysphere-backend-solo**.

## Funktioner
- Offentliga sidor: startsida med utvalda objekt, listvy med oändlig scroll och detaljsida med datumväljare.
- Autentisering med cookie-baserad session (login, register, logout) och rollskyddade rutter (t.ex. admin).
- Värdflöde: skapa/redigera/inaktivera annonser, lägga till tillgänglighet och radera egna annonser.
- Bokningar: gäster reserverar datum; värdar kan godkänna eller avvisa bokningsförfrågningar per annons.
- Profil: översikt av konto, egna annonser och antal väntande bokningar.
- Grundläggande admin-dashboard (redo att byggas ut).

## Teknisk stack
- React + Vite
- React Router v7
- @tanstack/react-query för datahämtning/caching
- Axios med centraliserad instans (`src/api/axios.js`)
- date-fns, react-datepicker, react-infinite-scroll-component
- ESLint för kodkvalitet

## Kom igång
### Förutsättningar
- Node.js 18+ och npm
- Backend igång från `Staysphere-backend-solo` (se repo-instruktioner)

### Installation & körning
```bash
# klona frontend
git clone https://github.com/<ditt-konto>/StaySphere-Frontend.git
cd StaySphere-Frontend

npm install

# starta dev-server (http://localhost:5173)
npm run dev
```

### Miljövariabler
Skapa `.env.local` i projektroten:
```
VITE_API_URL=http://localhost:8080
```
- Peka `VITE_API_URL` mot backend-bas-URL:en. Axios skickar cookies (`withCredentials: true`) för sessioner.

### Nyttiga npm-skript
- `npm run dev` – starta Vite dev-server med HMR.
- `npm run build` – produktionsbuild.
- `npm run preview` – förhandsgranska byggd bundle.
- `npm run lint` – kör ESLint.

## Struktur (kortfattat)
- `src/App.jsx` – routing och routeskydd.
- `src/contexts/auth/` – auth-state, reducer och actions mot `/auth/*`.
- `src/api/` – Axios-instans och tjänster för listings, bookings och reviews.
- `src/pages/` – sidor (Home, Listings, ListingDetail, Profile, Create/Update Listing, AddAvailability, BookingManagement m.fl.).
- `src/hooks/` – React Query-baserade hooks för listings/bookings/auth.
- `src/components/` – layout (Header/Footer), DatePicker, ProtectedRoute m.m.

## Koppla mot backend
1) Starta backend-projektet `Staysphere-backend-solo` (t.ex. `mvn spring-boot:run` eller enligt repo-instruktionen).  
2) Säkerställ att backend körs på samma domän/port som `VITE_API_URL` i `.env.local`.  
3) Dev-servern måste få skicka cookies: behåll `withCredentials: true` i `src/api/axios.js` och se till att CORS i backend tillåter detta.

## Flöden att känna till
- **Registrering/Inloggning**: POST mot `/auth/register` respektive `/auth/login`. `checkAuthStatus` mot `/auth/check` håller sessionen uppdaterad.
- **Listings**: CRUD på `/api/listing/*`; värdar hanterar sina egna annonser och tillgänglighet.
- **Bokningar**: gäster skapar bokning via `/api/bookings`; värdar godkänner/avvisar via `BookingManagement`.
- **Roller**: `ProtectedRoute` kan kräva `requiredRoles` (t.ex. `ADMIN`) och omdirigerar till `/unauthorized` vid saknade rättigheter.

## Testdata och bilder
- Annonsbilder anges som URL:er i formulären (ingen filuppladdning i frontend).  
- Om inga bilder finns används en fallback-bild i list- och detaljvyer.

## Vidare utveckling
- Bygg ut `AdminDashboard` med statistik och moderering.
- Lägg till riktiga kartor och riktiga recensioner (API-stöd finns i `reviewService`).
- Lägg till E2E- och enhetstester samt UI-förfining.

