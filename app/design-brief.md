# Design brief — Srednji izlaz d.o.o.

- **Design read:** A Croatian construction and real-estate company for clients
  commissioning buildings and buying property; register = engineered confidence,
  monochrome precision, zero decoration.
- **Concept spine:** "Scrolling erects the building." The visitor's scroll plays
  the client's own 3D construction render: foundation, structure, finished
  complex. The page is a construction sequence; every section is a completed
  phase.
- **Delivery tier:** cinema (scroll-scrub journey + chapter reveals, text rises
  bottom-to-top).
- **Locked palette:** ground `#FFFFFF` (white), section tint `#F1F4F7`, ink
  `#0B0C0E` (off-black), muted `#5B6169`, accent `#3866B8` (the exact blue of
  the client logo), emphasis blue `#2B5194`, label-on-accent `#FFFFFF`. The
  brand is black/white/blue by the client's explicit instruction; blue is used
  sparingly as a structural accent (logo frame, active states, CTA), never as
  glow. **Inverted from the original dark ground at the client's request** — the
  off-black became the ink instead of the ground, and the two greys were retuned
  for contrast on white (the old `#9BA1AA` muted only reaches 2.3:1 there).
  Exception: the film chapters keep light type over a dark vignette, because
  that text sits on video and no light treatment survives every frame.
- **Locked type:** Outfit (display + body) + IBM Plex Mono (meta, tags, data).
  No serif; construction/engineering brand.
- **Animation mode:** animated-website
  - **Journey shape:** single-shot. The film is the USER-SUPPLIED continuous 5s
    aerial render of their residential project (one unbroken move, no cuts).
    It is cut at exact frames into 3 sequential segments so each chapter scrubs
    its own phase; seams are byte-exact because all segments come from the one
    continuous source. No generated film needed.
  - **Journey (3 chapters):**
    1. `temelj` — foundation/excavation phase. H1: "Najbrži u svom poslu." /
       "Fastest in the business." Company intro sentence. Tag: Od 2016.
    2. `gradnja` — structure rising. Headline: construction works. Sentence on
       niskogradnja/visokogradnja, Ključ u ruke / Roh-bau. Tags: Ključ u ruke,
       Roh-bau.
    3. `nekretnine` — finished, landscaped complex. Headline: real estate.
       CTA: send an inquiry (#kontakt) — the company brokers property but
       publishes no listings index.
  - **World grammar:** one continuous photoreal aerial render, daylight, fixed
    exposure, forest-green surround; chapters read over it left-aligned with a
    dark scrim side.
  - **Mobile framing:** subject is center-safe (buildings centered); mobile
    encodes 720p center-crop via object-position 50%.
  - **Mobile playback:** phones do NOT scrub. One continuous film
    (scene-full-mobile.mp4) in a single video element plays exactly once, first
    frame to last, then holds the final frame — the film is scenery. Scrolling
    moves only the text blocks (one swipe, one chapter, one text block); it
    never pauses, seeks or restarts the film. Desktop keeps the three-cut
    scrub.
  - **Delivery budget:** ≤32 MiB desktop, **≤3 MB mobile page total**. The
    original ≤16 MiB mobile ceiling was loose enough to call a 9.8 MiB journey
    healthy, which it was not — a phone waited seconds before anything moved.
    Mobile now ships ~1.9 MiB of film (one continuous ~1.5 MiB encode plus
    posters) and plays rather than scrubs, so the encode no longer needs the
    short keyframe interval and the whole-file blob download that
    frame-accurate seeking forced.
- **Section plan (home, after journey):**
  1. Journey (3 scrub chapters) — full-viewport film.
  2. Services — asymmetric 2-block split (construction / real estate), each with
     generated monochrome image; distinct layouts, not equal cards.
  3. About — narrative one side, image the other; company registration data as
     a full-width band beneath, in mono type.
  4. Contact — Ivan Pranjić's details one side, inquiry form the other, then the
     legal row.
- **Separate pages:** `/oglasi` — "Oglasi za posao", the company's real job
  adverts (three trades, employer benefits, application form), bilingual.
  `/karijera` was removed as a duplicate and permanently redirects to `/oglasi`.
- **Bilingual:** HR default, EN toggle in nav (persisted client-side); two
  stable scene constants (HR/EN) so the scrub controller identity changes only
  on user toggle.
- **Asset plan:** user film (encoded 3 segments desktop+mobile+posters); inline
  SVG rebuild of the logo (blue exit-frame glyph + wordmark, white text for dark
  ground); 3 generated monochrome content images (crane/site, finished facade,
  careers team/site detail); OG cover + favicon via branding pipeline.
- **CTA inventory:**
  - "Pošalji upit / Send an inquiry" — solid blue rectangle, label slides up on
    hover (journey ch.3 + services real-estate block, both to #kontakt).
  - "Prijavi se / Apply" — solid blue rectangle per job advert; preselects that
    trade in the application form and scrolls to it.
  - "Prikaži e-mail / Show e-mail" — mono outline button; contact details are
    assembled in the browser on click so they never sit in the prerendered HTML.
- **Eyebrow budget:** max 2 across the page (journey kickers excluded, they are
  chapter kickers by engine design).
