# Adl 5:8

React + TypeScript, Tailwind CSS, MUI, i18next, Axios and ApexCharts.

Run `npm install`, then `npm run dev`. Production check: `npm run build`.

The API URL defaults to https://debt-back-cvif.onrender.com/api. Override with VITE_API_URL in .env (see .env.example).

Authentication uses the backend's email/password flow. The original site's username credentials are not automatically transferable to this backend. Access tokens refresh on 401 responses. No passwords are persisted in source code or local storage.

Implemented screens: public landing page at `/`, login, registration, dashboard, debts, archive, contacts, folders. User management is intentionally excluded. The UI supports Russian, Tajik and English, light/dark/automatic themes, desktop sidebar and mobile navigation.

The landing page follows the observed reference: grid background, gradient hero, six feature cards, statistics, four steps, call to action and footer. Its text is in the locale JSON files. Reference marketing text/statistics are reproduced as requested, not independently verified claims about this implementation. Footer labels without observed destinations remain static; no invented company, legal or documentation pages were added. Entry/scroll reveals, card lift/shadow, quick-action appearance, theme selection, focus and hover transitions respect reduced-motion preferences.

UI responsibilities are separated into `Landing`, `ProfileMenu`, `QuickAdd`, `DebtChart`, `FolderCards`, `DebtFields`, `DebtTable`, `ContactTable` and `Notifications`. `App` keeps routing, API calls and shared state. The supplied original-site username credentials were used only to inspect the reference, never added to the project.

Archive shows debts whose status is paid. The three-dot debt menu supports editing and explicitly marking a debt closed (PATCH status=paid), with reopening in the archive. Progress displays the remaining percentage, matching the reference: a new debt starts at 100%. Folder filtering uses a contact's folder_id. Charts use debt creation dates and original amounts. Quick increase updates the existing debt amount; decrease records a payment. Overpayments are rejected in the form.

The debt name field accepts both existing contacts and free text. Saving a new name creates a contact first and uses its id for the debt; case-insensitive matching avoids duplicates. Selected photos have a full-width preview and removal button. The modal scrolls within its body while its title and action buttons remain visible. Quick-add actions dismiss on outside click, Escape, or opening a form.

The API has no image-upload endpoint: selected images are stored in this browser only and do not sync to other devices. Password recovery has no API endpoint and displays an explanatory message. No offline sync is claimed or implemented.

Verification: production build and lint; desktop/mobile browser checks; local fixture tests for login, contact create/edit/delete, folder creation, debt creation/increase, partial/full payments, paid archive state and payment history. To repeat fixture tests, run `node tests/mock-api.mjs` in one terminal and `node tests/verify-api.mjs` in another. These tests never write to the live backend. The real backend health endpoint responded successfully. Live authenticated CRUD still requires an account registered with that backend's email/password system.

Design follows the live populated reference and supplied screenshots, including remaining-progress rows, signed amounts, date ranges, three-dot menus, notification cards, chart tooltips, photo preview, focus/hover states and restrained transitions. Exact equality across all browsers and display zoom settings is not guaranteed. Reference logo, avatars and observed SVG paths are reused.
