/**
 * Scene data for the scroll-scrub journey.
 *
 * The film is the client's own continuous aerial render of their residential
 * project, cut at exact frames into three sequential segments (foundation,
 * structure, finished complex). Seams are byte-exact because every segment
 * comes from the one continuous source clip.
 *
 * Both language arrays are module constants: the controller identity changes
 * only when the visitor toggles the language.
 */
import type {
  ScrollScrubScene,
  ScrollScrubTheme,
} from "@/components/scroll-scrub/scroll-scrub";

/** Brand tokens for the journey layer (design-brief.md). */
export const scrollScrubTheme: ScrollScrubTheme = {
  accent: "#3866b8",
  background: "#0b0c0e",
  ink: "#f4f5f7",
  muted: "#9ba1aa",
};

// The company brokers property but publishes no listings page, so the chapter
// invites an enquiry rather than promising an index that does not exist.
const listingsCtaHr = (
  <a className="si-cta-listings" href="#kontakt">
    <span className="si-cta-label">Pošalji upit</span>
    <span aria-hidden="true" className="si-cta-ghost">
      Pošalji upit
    </span>
  </a>
);

const listingsCtaEn = (
  <a className="si-cta-listings" href="#kontakt">
    <span className="si-cta-label">Send an inquiry</span>
    <span aria-hidden="true" className="si-cta-ghost">
      Send an inquiry
    </span>
  </a>
);

export const scrollScrubScenesHr: ScrollScrubScene[] = [
  {
    body: "Gradimo, projektiramo i posredujemo u prodaji nekretnina. Od temelja do ključa u ruci.",
    clip: "/assets/world/scene-01.mp4",
    id: "temelj",
    kicker: "Srednji izlaz d.o.o.",
    label: "Temelj",
    linger: 0.15,
    mobileClip: "/assets/world/scene-01-mobile.mp4",
    mobilePoster: "/assets/world/scene-01-mobile-poster.jpg",
    poster: "/assets/world/scene-01-poster.jpg",
    scroll: 2,
    tags: ["Od 2016."],
    title: "Najbrži u svom poslu.",
  },
  {
    align: "right",
    body: "Izvodimo sve vrste građevinskih radova niskogradnje i visokogradnje, po sistemu Ključ u ruke ili Roh-bau.",
    clip: "/assets/world/scene-02.mp4",
    id: "gradnja",
    kicker: "Građevinski radovi",
    label: "Gradnja",
    linger: 0.15,
    mobileClip: "/assets/world/scene-02-mobile.mp4",
    mobilePoster: "/assets/world/scene-02-mobile-poster.jpg",
    poster: "/assets/world/scene-02-poster.jpg",
    scroll: 2,
    tags: ["Niskogradnja", "Visokogradnja", "Projektiranje"],
    title: "Gradnja bez zastoja.",
  },
  {
    actions: listingsCtaHr,
    body: "Posredujemo pri prodaji i kupnji nekretnina i zemljišta. Javite se za aktualnu ponudu stanova i projekata.",
    clip: "/assets/world/scene-03.mp4",
    id: "nekretnine",
    kicker: "Nekretnine",
    label: "Nekretnine",
    linger: 0.15,
    mobileClip: "/assets/world/scene-03-mobile.mp4",
    mobilePoster: "/assets/world/scene-03-mobile-poster.jpg",
    poster: "/assets/world/scene-03-poster.jpg",
    scroll: 2,
    title: "Od gradilišta do doma.",
  },
];

export const scrollScrubScenesEn: ScrollScrubScene[] = [
  {
    body: "We build, design and broker real estate. From the foundation to a turnkey handover.",
    clip: "/assets/world/scene-01.mp4",
    id: "temelj",
    kicker: "Srednji izlaz d.o.o.",
    label: "Foundation",
    linger: 0.15,
    mobileClip: "/assets/world/scene-01-mobile.mp4",
    mobilePoster: "/assets/world/scene-01-mobile-poster.jpg",
    poster: "/assets/world/scene-01-poster.jpg",
    scroll: 2,
    tags: ["Since 2016"],
    title: "Fastest in the business.",
  },
  {
    align: "right",
    body: "We carry out all civil and structural construction works, delivered turnkey or as a Roh-bau shell.",
    clip: "/assets/world/scene-02.mp4",
    id: "gradnja",
    kicker: "Construction works",
    label: "Construction",
    linger: 0.15,
    mobileClip: "/assets/world/scene-02-mobile.mp4",
    mobilePoster: "/assets/world/scene-02-mobile-poster.jpg",
    poster: "/assets/world/scene-02-poster.jpg",
    scroll: 2,
    tags: ["Civil engineering", "Structural works", "Design"],
    title: "Building without delays.",
  },
  {
    actions: listingsCtaEn,
    body: "We broker the sale and purchase of properties and land. Get in touch for the current offer of apartments and projects.",
    clip: "/assets/world/scene-03.mp4",
    id: "nekretnine",
    kicker: "Real estate",
    label: "Real estate",
    linger: 0.15,
    mobileClip: "/assets/world/scene-03-mobile.mp4",
    mobilePoster: "/assets/world/scene-03-mobile-poster.jpg",
    poster: "/assets/world/scene-03-poster.jpg",
    scroll: 2,
    title: "From building site to home.",
  },
];
