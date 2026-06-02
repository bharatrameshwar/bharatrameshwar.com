# bharatrameshwar.com

Personal site and interactive resume for Bharat Rameshwar — SAP BTP, Data & Applied AI.

Built with [Vite](https://vite.dev) + React, deployed to [Cloudflare Pages](https://pages.cloudflare.com).

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
```

## Build

```bash
npm run build    # → dist/
npm run preview  # serve the production build locally
```

## Structure

- `src/resume-data.js` — single structured source of truth for all content.
- `src/App.jsx` — fixed-sidebar layout, scroll-spy nav, deep-link handling.
- `src/components/` — section components, the scrubbable career timeline, and
  the interactive architecture diagram.
- `src/styles/` — design tokens and component styling (Fraunces + Inter,
  paper / ink / olive palette).

## Deep links

Each AI experiment has its own anchor for direct linking:
`/#estate`, `/#privacy`, `/#activity`, `/#notes`. Navigating to one scrolls to
and briefly highlights that section.

## Deploy

```bash
npm run build
npx wrangler pages deploy dist --project-name=bharatrameshwar-com
```
