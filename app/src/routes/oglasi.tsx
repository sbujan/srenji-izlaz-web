import { createFileRoute } from "@tanstack/react-router";

import { SiteFooter } from "@/components/site/footer";
import { SiteNav } from "@/components/site/nav";
import { Reveal } from "@/components/site/reveal";
import { useLang, type Lang } from "@/lib/i18n";

export const Route = createFileRoute("/oglasi")({
  head: () => ({
    meta: [
      { title: "Oglasi · Srednji izlaz d.o.o." },
      {
        name: "description",
        content:
          "Nekretnine i projekti u ponudi: novogradnja, stanovi i građevinska zemljišta. Srednji izlaz d.o.o.",
      },
    ],
  }),
  component: Oglasi,
});

type Listing = {
  id: string;
  image: string;
  type: string;
  location: string;
  status: string;
  title: string;
  body: string;
  price: string;
  inquire: string;
};

const listings: Record<Lang, Listing[]> = {
  hr: [
    {
      id: "kompleks",
      image: "/assets/world/scene-03-poster.jpg",
      type: "Novogradnja",
      location: "Donja Bistra",
      status: "U izgradnji",
      title: "Stambeni kompleks, tri zgrade",
      body: "Stanovi u novogradnji s uređenim zajedničkim okolišem, balkonima i podzemnom garažom.",
      price: "Cijena na upit",
      inquire: "Pošalji upit",
    },
    {
      id: "stan",
      image: "/assets/img/nekretnine.jpg",
      type: "Stan",
      location: "Donja Bistra",
      status: "Dostupno",
      title: "Trosobni stan u novogradnji",
      body: "Funkcionalan raspored, balkon i pripadajuće parkirno mjesto. Useljivo po dogovoru.",
      price: "Cijena na upit",
      inquire: "Pošalji upit",
    },
    {
      id: "zemljiste",
      image: "/assets/img/projektiranje.jpg",
      type: "Zemljište",
      location: "Zaprešić i okolica",
      status: "Dostupno",
      title: "Građevinsko zemljište",
      body: "Zemljište s pristupnim putem, pogodno za stambenu gradnju. Dokumentacija dostupna na uvid.",
      price: "Cijena na upit",
      inquire: "Pošalji upit",
    },
  ],
  en: [
    {
      id: "kompleks",
      image: "/assets/world/scene-03-poster.jpg",
      type: "New build",
      location: "Donja Bistra",
      status: "Under construction",
      title: "Residential complex, three buildings",
      body: "New-build apartments with landscaped common grounds, balconies and an underground garage.",
      price: "Price on request",
      inquire: "Send an inquiry",
    },
    {
      id: "stan",
      image: "/assets/img/nekretnine.jpg",
      type: "Apartment",
      location: "Donja Bistra",
      status: "Available",
      title: "Three-room new-build apartment",
      body: "Functional layout, balcony and a dedicated parking space. Move-in by arrangement.",
      price: "Price on request",
      inquire: "Send an inquiry",
    },
    {
      id: "zemljiste",
      image: "/assets/img/projektiranje.jpg",
      type: "Land",
      location: "Zaprešić area",
      status: "Available",
      title: "Building plot",
      body: "Plot with an access road, suitable for residential construction. Documentation available on request.",
      price: "Price on request",
      inquire: "Send an inquiry",
    },
  ],
};

const page: Record<Lang, { title: string; lead: string; note: string }> = {
  hr: {
    title: "Oglasi",
    lead: "Nekretnine i projekti u aktualnoj ponudi.",
    note: "Ponuda se redovito ažurira. Za detalje, dokumentaciju i termine razgleda pošaljite upit na",
  },
  en: {
    title: "Listings",
    lead: "Properties and projects currently on offer.",
    note: "The offer is updated regularly. For details, documentation and viewing times, send an inquiry to",
  },
};

function Oglasi() {
  const { lang } = useLang();
  const t = page[lang];
  const items = listings[lang];

  return (
    <div className="si-page">
      <SiteNav />
      <main>
        <section className="si-pagehead">
          <div className="si-container">
            <Reveal>
              <h1 className="si-h2">{t.title}</h1>
              <p className="si-lead">{t.lead}</p>
            </Reveal>
          </div>
        </section>
        <section className="si-section">
          <div className="si-container">
            <div className="si-listings">
              {items.map((item, index) => (
                <Reveal className="si-listing" delay={index * 80} key={item.id}>
                  <img alt={item.title} loading="lazy" src={item.image} />
                  <div className="si-listing-body">
                    <p className="si-listing-meta">
                      <span>
                        {item.type} · {item.location}
                      </span>
                      <span className="si-status">{item.status}</span>
                    </p>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                    <div className="si-listing-price">
                      <span>{item.price}</span>
                      <a
                        className="si-cta-positions"
                        href={`mailto:ivan@srednjiizlaz.hr?subject=${encodeURIComponent(
                          `Upit: ${item.title}`,
                        )}`}
                      >
                        {item.inquire}
                        <span aria-hidden="true" className="si-arrow">
                          →
                        </span>
                      </a>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
            <p className="si-note">
              {t.note}{" "}
              <a href="mailto:ivan@srednjiizlaz.hr">ivan@srednjiizlaz.hr</a>.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
