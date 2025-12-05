# StaySphere Frontend

This is the frontend client for StaySphere—a booking platform where hosts can create/manage listings and guests can browse, book, and leave reviews. The backend API lives in a separate repo: **Staysphere-backend-solo**.

## Features

- Public pages: home with featured listings, listings page with infinite scroll, and listing detail with date picker.
- Authentication with cookie-based sessions (login, register, logout) and role-protected routes (e.g., admin).
- Host flows: create/edit/deactivate listings, add availability, and delete own listings.
- Bookings: guests reserve dates; hosts can approve/deny booking requests per listing.
- Profile: account overview, own listings, and pending booking counts.
- Basic admin dashboard (ready to extend).

## Tech Stack

- React + Vite
- React Router v7
- @tanstack/react-query for data fetching/caching
- Axios with a centralized instance (`src/api/axios.js`)
- date-fns, react-datepicker, react-infinite-scroll-component
- ESLint for code quality

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend running from `Staysphere-backend-solo` (see that repo)

### Install & run

```bash
# clone frontend
git clone https://github.com/<your-account>/StaySphere-Frontend.git
cd StaySphere-Frontend

npm install

# start dev server (http://localhost:5173)
npm run dev
```

### Environment variables

Create `.env.local` in the project root:

```
VITE_API_URL=http://localhost:8080
```

- Point `VITE_API_URL` to your backend base URL. Axios sends cookies (`withCredentials: true`) for sessions.

### Useful npm scripts

- `npm run dev` – start Vite dev server with HMR.
- `npm run build` – production build.
- `npm run preview` – preview the built bundle.
- `npm run lint` – run ESLint.

## Project Structure (short)

- `src/App.jsx` – routing and route protection.
- `src/contexts/auth/` – auth state, reducer, and actions hitting `/auth/*`.
- `src/api/` – Axios instance and services for listings, bookings, and reviews.
- `src/pages/` – pages (Home, Listings, ListingDetail, Profile, Create/Update Listing, AddAvailability, BookingManagement, etc.).
- `src/hooks/` – React Query-based hooks for listings/bookings/auth.
- `src/components/` – layout (Header/Footer), DatePicker, ProtectedRoute, etc.

## Connecting to the Backend

1. Start `Staysphere-backend-solo` (e.g., `mvn spring-boot:run` or per its README).
2. Ensure the backend runs on the same domain/port as `VITE_API_URL` in `.env.local`.
3. The dev server must send cookies: keep `withCredentials: true` in `src/api/axios.js` and ensure backend CORS allows it.

## Key Flows

- **Register/Login**: POST to `/auth/register` and `/auth/login`. `checkAuthStatus` hits `/auth/check` to keep the session fresh.
- **Listings**: CRUD via `/api/listing/*`; hosts manage their own listings and availability.
- **Bookings**: guests create bookings via `/api/bookings`; hosts approve/deny via `BookingManagement`.
- **Roles**: `ProtectedRoute` can require `requiredRoles` (e.g., `ADMIN`) and redirects to `/unauthorized` if missing.

## Test Data & Images

- Listing images are provided as URLs in forms (no file upload in the frontend).
- If no images exist, a fallback image is shown in list/detail views.

## Future Improvements

- Expand `AdminDashboard` with stats and moderation tools.
  -\ Lay in real maps and real reviews (API support exists in `reviewService`).
- Add E2E/unit tests and UI polish.
