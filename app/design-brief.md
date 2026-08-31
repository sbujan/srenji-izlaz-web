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
- **Locked palette:** ground `#0B0C0E` (off-black), ink `#F4F5F7`, muted
  `#9BA1AA`, accent `#3866B8` (the exact blue of the client logo; user brand
  override of the dark+blue ban). Defense: the brand IS black/white/blue by the
  user's explicit instruction; blue used sparingly as structural accent (logo
  frame, active states, CTA), never as glow.
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
       CTA: view listings (/oglasi).
  - **World grammar:** one continuous photoreal aerial render, daylight, fixed
    exposure, forest-green surround; chapters read over it left-aligned with a
    dark scrim side.
  - **Mobile framing:** subject is center-safe (buildings centered); mobile
    encodes 720p center-crop via object-position 50%.
  - **Delivery budget:** ≤32 MiB desktop total, ≤16 MiB mobile total (source is
    5s, trivially inside budget).
- **Section plan (home, after journey):**
  1. Journey (3 scrub chapters) — full-viewport film.
  2. Services — asymmetric 2-block split (construction / real estate), each with
     generated monochrome image; distinct layouts, not equal cards.
  3. About — editorial single column narrative + company facts sidebar
     (OIB/MBS/director/address) in mono type.
  4. Contact strip / footer — email CTA + address + language switch.
- **Separate pages:** `/oglasi` (real-estate listings grid, sample entries until
  client supplies real ones) and `/karijera` (job ads list, open-application
  block). Both bilingual.
- **Bilingual:** HR default, EN toggle in nav (persisted client-side); two
  stable scene constants (HR/EN) so the scrub controller identity changes only
  on user toggle.
- **Asset plan:** user film (encoded 3 segments desktop+mobile+posters); inline
  SVG rebuild of the logo (blue exit-frame glyph + wordmark, white text for dark
  ground); 3 generated monochrome content images (crane/site, finished facade,
  careers team/site detail); OG cover + favicon via branding pipeline.
- **CTA inventory:**
  - "Pogledaj oglase / View listings" — solid blue rectangle, label slides up on
    hover (journey ch.3 + services real-estate block).
  - "Pošalji upit / Send an inquiry" — outline with animated underline reveal
    (contact strip, mailto).
  - "Otvorene pozicije / Open positions" — mono text link with arrow shift
    (nav + karijera).
- **Eyebrow budget:** max 2 across the page (journey kickers excluded, they are
  chapter kickers by engine design).
