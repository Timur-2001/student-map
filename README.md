# Student Map

Mobile-first, single-page guide to student life around Irkutsk State University.
Built with React, TypeScript, Vite, Tailwind CSS v4, Leaflet, and Framer Motion.

## Run

- Install dependencies: `npm install`
- Development server: `npm run dev`
- Production build: `npm run build`
- Preview the build: `npm run preview`

## Structure

- `src/App.tsx`: page layout, category/search state, sorting, saved places.
- `src/components/MapPanel.tsx`: OpenStreetMap tiles, custom markers, map controls, geolocation, and search suggestions.
- `src/components/PlaceCard.tsx`: selectable place cards and image fallbacks.
- `src/components/PlaceDetail.tsx`: full place information and walking-direction links.
- `src/components/AboutModal.tsx`: author-link placeholder, project information, and keyboard-accessible dialog.
- `src/data/places.ts`: editable place data, category definitions, route links, and distance estimates.
- `src/index.css`: mobile-first styles and reduced-motion support.

The page order is header, map, categories, and place information. The default
view shows all eight places. Category selection filters both the map and list;
the faculty stays on the map as a reference point. Map markers and list cards
open the same detail view. Closely positioned markers are separated visually
with dotted leader lines so the faculty and its canteen remain tappable.

## Data And Services

The verified faculty location is 52.249958, 104.264536, at 126 Lermontova Street,
Building VI, Irkutsk. Address sources:

- https://fbki.isu.ru/abiturientam
- https://yandex.ru/maps/63/irkutsk/house/ulitsa_lermontova_126/ZUkCaAVmTUAEWkJvYWJzdXVqYQA=/

The remaining entries are a realistic demo collection. Prices, amenities,
descriptions, and walking times are examples rather than live business data.
Walking times use a geographic distance estimate with a detour factor, not
a routing service. Park access points are approximate. The UI identifies the
collection as educational and the photographs as illustrative. Stock images
are supplied by Pexels, with a local SVG fallback if a photograph cannot load.

Leaflet requests tiles directly from `tile.openstreetmap.org`; no API key is
required. Keep the OpenStreetMap attribution and follow its tile usage policy
when deploying at scale: https://operations.osmfoundation.org/policies/tiles/.
Map tiles, photos, Google Fonts, and outgoing routes require an internet
connection. Failed map requests can be retried without losing access to the
place list or filters.

Walking-route buttons open Yandex Maps in a new tab, starting from the faculty.
The faculty's own route leaves the origin blank for the visitor to specify.
The application does not calculate or draw a route itself.

Favorites are stored under `student-map:saved:v1` in this browser's localStorage.
No account or backend is needed. Geolocation is only requested after pressing
the location button and requires browser permission and a secure context
(HTTPS or localhost). The application does not persist the visitor's location.

## Verification

The production build has been verified with Vite. Browser end-to-end tests,
live geolocation permission prompts, and device-specific visual checks have
not been run in this environment.