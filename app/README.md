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
3. Add the environment variables below.
4. Deploy. Every push to `main` redeploys; pull requests get preview URLs.

### Environment variables

| Variable         | Needed for                          | Notes                                                                                                       |
| ---------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `VITE_SITE_URL`  | canonical URL, social image, sitemap | The final public origin, e.g. `https://srednjiizlaz.hr`. Read at **build** time — redeploy after changing it. |
| `RESEND_API_KEY` | contact form delivery                | From [resend.com](https://resend.com) → API Keys. Until it is set the form validates but reports that sending is unavailable. |
| `CONTACT_TO`     | contact form recipient               | Optional. Defaults to the company address.                                                                   |
| `CONTACT_FROM`   | contact form sender                  | Optional. Must be on a domain verified in Resend. Defaults to Resend's shared test sender, which only delivers to the Resend account owner. |

## Contact form

`POST /api/contact` ([api/contact.ts](api/contact.ts)) is the only thing on this
site that runs per request — Vercel builds anything under `api/` as a function
automatically, and the pages stay static. It sends through Resend over plain
`fetch`, so there is no SDK dependency.

To turn it on: create a Resend account, verify the `srednjiizlaz.hr` domain,
then set `RESEND_API_KEY` and `CONTACT_FROM` (e.g.
`Srednji izlaz <upiti@srednjiizlaz.hr>`) in the Vercel project. Nothing else
changes — the form is already wired up and fails politely until the key exists.

It defends itself with a hidden honeypot field, per-field length limits, an
`Origin` check so the endpoint cannot be used as someone else's mailer, and a
best-effort per-IP rate limit. That limit lives in the memory of one edge
isolate, so it blunts a naive loop rather than guaranteeing a global cap; if the
form ever attracts real abuse, move it to a shared store (Vercel KV / Upstash).

## Contact details are not in the HTML

The e-mail address and phone number are assembled in the browser only after a
visitor clicks "Prikaži" ([src/lib/contact.ts](src/lib/contact.ts)). Because the
pages are prerendered, anything written straight into the markup would sit in
the static HTML for address harvesters to collect — a standard e-mail regex run
over the built pages currently returns nothing. Keep it that way: don't write
the address into JSX or into a `mailto:` href. Use `ContactReveal` for display
and `MailtoAction` for "write to us about X" buttons.

The WhatsApp link is the deliberate exception. It exists to be clicked, so it is
a normal link with the number in the href.

Attach the custom domain under **Project → Settings → Domains**, then update the
`Sitemap:` line in `public/robots.txt` if the domain differs from the default.

### What `vercel.json` configures

- Build command, and `dist/client` as the output directory.
- Security headers on every response: a Content-Security-Policy scoped to this
  site plus Google Fonts, HSTS, `nosniff`, `X-Frame-Options: DENY`, a referrer
  policy and a permissions policy.
- Caching, split by what the filename tells us. Vite's hashed JS/CSS sits flat in
  `/assets`, matched by `/assets/:file` (one path segment) and cached forever —
  a new build changes the name. The media in `/assets/img`, `/assets/brand` and
  `/assets/world` keeps stable filenames, so it gets a day (a week for the film)
  plus background revalidation instead. Marking those `immutable` would pin a
  replaced photo in caches for a year.

## Editing content

There is no CMS — content lives in the route files as typed Croatian/English
pairs, so a change means an edit and a push.

| To change                     | Edit                                   |
| ----------------------------- | -------------------------------------- |
| Job adverts                   | `src/routes/oglasi.tsx` (`jobs`)        |
| What the employer offers      | `src/routes/oglasi.tsx` (`benefits`)    |
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
- **The company brokers property but publishes no listings page.** The
  real-estate call to action points at the contact block rather than an index
  that does not exist. If listings are ever wanted, they need a new route.
- **A role in the application select must exist in some advert's `roles`.** The
  select is built from the adverts, so removing an advert removes its roles.
- The contact route is a `mailto:` link, not a form.
