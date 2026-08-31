# Srednji izlaz d.o.o. — website

Marketing site for a Croatian construction and real-estate company: a
scroll-driven landing page, property listings (`/oglasi`) and careers
(`/karijera`), in Croatian with an English toggle.

## Stack

| Layer     | Choice                                                      |
| --------- | ----------------------------------------------------------- |
| Framework | TanStack Start + TanStack Router (file-based routes)        |
| UI        | React 19                                                     |
| Styling   | Plain CSS — `src/site.css` and `scroll-scrub.css`, no framework |
| Build     | Vite 8, TypeScript                                           |
| Hosting   | Vercel, served as static files                               |

Every page is **prerendered to static HTML at build time**. There is no server,
no database and no API: the only runtime behaviour (language toggle, scroll
journey, reveal animations) runs in the browser. Vercel serves the output from
its CDN, so there are no serverless functions to pay for or keep warm, and
crawlers receive fully rendered markup.

## Local development

```bash
npm install
npm run dev          # http://localhost:3000
```

| Script              | Does                                                      |
| ------------------- | --------------------------------------------------------- |
| `npm run dev`       | dev server with hot reload                                 |
| `npm run build`     | generate routes → typecheck → build → prerender + sitemap  |
| `npm run typecheck` | TypeScript only                                            |
| `npm run lint`      | ESLint                                                     |
| `npm run format`    | Prettier                                                   |

The build writes the deployable site to `dist/client/`.

## Deploying to Vercel

The repository is already wired to GitHub, so the one-time setup is:

1. On [vercel.com/new](https://vercel.com/new), import the
   `sbujan/srenji-izlaz-web` repository.
2. Set **Root Directory** to `app` — the project lives one level down, and
   Vercel will not find it otherwise. This is the only setting that must be
   changed by hand; `vercel.json` supplies the rest (build command, output
   directory, headers).
3. Add an environment variable `VITE_SITE_URL` set to the final public origin,
   e.g. `https://srednjiizlaz.hr`. It is used for the canonical URL, the
   `og:`/`twitter:` image URLs and the `<loc>` entries in `sitemap.xml`. Without
   it the build falls back to `https://srednjiizlaz.hr`.
4. Deploy. Every push to `main` redeploys; pull requests get preview URLs.

Attach the custom domain under **Project → Settings → Domains**, then update the
`Sitemap:` line in `public/robots.txt` if the domain differs from the default.

### What `vercel.json` configures

- Build command, and `dist/client` as the output directory.
- Security headers on every response: a Content-Security-Policy scoped to this
  site plus Google Fonts, HSTS, `nosniff`, `X-Frame-Options: DENY`, a referrer
  policy and a permissions policy.
- Long-lived immutable caching for `/assets/*` (filenames are content-hashed),
  short caching for `sitemap.xml` and `robots.txt`.

## Editing content

There is no CMS — content lives in the route files as typed Croatian/English
pairs, so a change means an edit and a push.

| To change                     | Edit                                   |
| ----------------------------- | -------------------------------------- |
| Property listings             | `src/routes/oglasi.tsx` (`listings`)    |
| Job ads                       | `src/routes/karijera.tsx` (`jobs`)      |
| Services, about text, company facts | `src/routes/index.tsx` (`copy`)   |
| Scroll journey chapters       | `src/scroll-scrub-scenes.tsx`           |
| Nav, footer, contact details  | `src/components/site/`                  |
| Colours, type, page styles    | `src/site.css`                          |
| Title / description / social image | `src/routes/__root.tsx`            |

Both the `hr` and `en` entries need updating together — the English text is what
the language toggle swaps to.

**Adding a page:** create the route file in `src/routes/`, then add its path to
the `pages` list in `vite.config.ts` so it gets prerendered and listed in the
sitemap.

## Known limitations

- **English is not indexable.** The language is a client-side toggle stored in
  `localStorage`; every page is prerendered in Croatian and there are no
  `/en/...` URLs, so search engines only ever see the Croatian text. Fixing it
  means adding real per-language routes.
- **Listings are sample content.** The three entries in `oglasi.tsx` are
  placeholders until real ones are supplied.
- The contact route is a `mailto:` link, not a form.
