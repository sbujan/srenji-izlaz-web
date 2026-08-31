import { createFileRoute } from "@tanstack/react-router";

import { SiteFooter } from "@/components/site/footer";
import { SiteNav } from "@/components/site/nav";
import { ContactReveal } from "@/components/site/contact-reveal";
import { Reveal } from "@/components/site/reveal";
import { ScrollScrub } from "@/components/scroll-scrub/scroll-scrub";
import { useLang, type Lang } from "@/lib/i18n";
import { scrollScrubScenesEn, scrollScrubScenesHr, scrollScrubTheme } from "@/scroll-scrub-scenes";

export const Route = createFileRoute("/")({
  component: Index,
});

const copy: Record<
  Lang,
  {
    servicesEyebrow: string;
    servicesTitle: string;
    s1Title: string;
    s1Body: string;
    s1Tags: string[];
    s2Title: string;
    s2Body: string;
    s2Cta: string;
    aboutTitle: string;
    aboutBody1: string;
    aboutBody2: string;
    factDirector: string;
    factAddress: string;
    factFounded: string;
    factEmail: string;
    factPhone: string;
  }
> = {
  hr: {
    servicesEyebrow: "Što radimo",
    servicesTitle: "Dvije djelatnosti, jedan standard.",
    s1Title: "Izvođenje građevinskih radova",
    s1Body:
      "Izvodimo sve vrste građevinskih radova niskogradnje i visokogradnje, gradnju objekata po sistemu Ključ u ruke ili sistemu Roh-bau, uz projektiranje i savjetovanje u vezi projektiranja.",
    s1Tags: ["Niskogradnja", "Visokogradnja", "Ključ u ruke", "Roh-bau"],
    s2Title: "Posredovanje i prodaja nekretnina",
    s2Body:
      "Posredujemo prilikom prodaje nekretnina i zemljišta te kupnje istih. Pregledajte sve nekretnine i projekte u aktualnoj ponudi.",
    s2Cta: "Pogledaj oglase",
    aboutTitle: "O nama",
    aboutBody1:
      "Društvo Srednji izlaz d.o.o. osnovano je 2016. godine s ciljem iznajmljivanja vozila, no kroz godine je kontinuiranim rastom proširilo svoj spektar djelatnosti. Od najma osobnih i gospodarskih vozila, prodaje vozila i posredništva, društvo danas posreduje u prodaji nekretnina te se intenzivno razvilo u području izvođenja građevinskih radova.",
    aboutBody2:
      "S našim vrijednim timom izvodimo sve vrste građevinskih radova niskogradnje i visokogradnje, gradnju objekata po sistemu Ključ u ruke ili Roh-bau, projektiranje te nudimo savjetovanje u vezi projektiranja.",
    factDirector: "Direktor",
    factAddress: "Adresa",
    factFounded: "Osnovano",
    factEmail: "E-mail",
    factPhone: "Telefon",
  },
  en: {
    servicesEyebrow: "What we do",
    servicesTitle: "Two trades, one standard.",
    s1Title: "Construction works",
    s1Body:
      "We carry out all types of civil and structural construction works, building delivery on a turnkey or Roh-bau basis, along with design services and design consulting.",
    s1Tags: ["Civil engineering", "Structural works", "Turnkey", "Roh-bau"],
    s2Title: "Real estate brokerage and sales",
    s2Body:
      "We broker the sale and purchase of properties and land. Browse all properties and projects in the current offer.",
    s2Cta: "View listings",
    aboutTitle: "About us",
    aboutBody1:
      "Srednji izlaz d.o.o. was founded in 2016 as a vehicle rental company, and through continuous growth it has steadily widened its scope. From renting and selling personal and commercial vehicles, the company today brokers real estate sales and has grown intensively in the field of construction.",
    aboutBody2:
      "With our dedicated team we carry out all types of civil and structural construction works, turnkey and Roh-bau building delivery, design work, and design consulting.",
    factDirector: "Director",
    factAddress: "Address",
    factFounded: "Founded",
    factEmail: "E-mail",
    factPhone: "Phone",
  },
};

function Index() {
  const { lang } = useLang();
  const t = copy[lang];
  const scenes = lang === "hr" ? scrollScrubScenesHr : scrollScrubScenesEn;

  return (
    <div className="si-page">
      <SiteNav />
      <main>
        <ScrollScrub scenes={scenes} theme={scrollScrubTheme} />

        <section className="si-section" id="usluge">
          <div className="si-container">
            <Reveal>
              <p className="si-eyebrow">{t.servicesEyebrow}</p>
              <h2 className="si-h2">{t.servicesTitle}</h2>
            </Reveal>

            <div className="si-split">
              <Reveal className="si-split-media">
                <img
                  alt={t.s1Title}
                  loading="lazy"
                  height={843}
                  src="/assets/img/gradnja.jpg"
                  width={1500}
                />
              </Reveal>
              <Reveal className="si-split-body" delay={90}>
                <h3 className="si-h3">{t.s1Title}</h3>
                <p>{t.s1Body}</p>
                <ul className="si-taglist">
                  {t.s1Tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              </Reveal>
            </div>

            <div className="si-split si-split--rev">
              <Reveal className="si-split-media">
                <img
                  alt={t.s2Title}
                  loading="lazy"
                  height={1066}
                  src="/assets/img/nekretnine.jpg"
                  width={1600}
                />
              </Reveal>
              <Reveal className="si-split-body" delay={90}>
                <h3 className="si-h3">{t.s2Title}</h3>
                <p>{t.s2Body}</p>
                <a className="si-cta-listings" href="/oglasi">
                  <span className="si-cta-label">{t.s2Cta}</span>
                  <span aria-hidden="true" className="si-cta-ghost">
                    {t.s2Cta}
                  </span>
                </a>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="si-section si-section--tint" id="o-nama">
          <div className="si-container si-about">
            <div>
              <Reveal>
                <h2 className="si-h2">{t.aboutTitle}</h2>
                <p className="si-lead">{t.aboutBody1}</p>
                <br />
                <p className="si-lead">{t.aboutBody2}</p>
              </Reveal>
              <Reveal delay={120}>
                <img
                  alt="Srednji izlaz"
                  className="si-about-img"
                  loading="lazy"
                  height={1066}
                  src="/assets/img/projektiranje.jpg"
                  width={1600}
                />
              </Reveal>
            </div>
            <Reveal className="si-facts" delay={60}>
              <dl>
                <div className="si-fact">
                  <dt>{t.factDirector}</dt>
                  <dd>Ivan Pranjić</dd>
                </div>
                <div className="si-fact">
                  <dt>{t.factAddress}</dt>
                  <dd>Mokrička 26, 10298 Donja Bistra</dd>
                </div>
                <div className="si-fact">
                  <dt>OIB</dt>
                  <dd>69231941942</dd>
                </div>
                <div className="si-fact">
                  <dt>MBS</dt>
                  <dd>081070237</dd>
                </div>
                <div className="si-fact">
                  <dt>{t.factEmail}</dt>
                  <dd>
                    <ContactReveal kind="email" />
                  </dd>
                </div>
                <div className="si-fact">
                  <dt>{t.factPhone}</dt>
                  <dd>
                    <ContactReveal kind="phone" />
                  </dd>
                </div>
                <div className="si-fact">
                  <dt>{t.factFounded}</dt>
                  <dd>2016.</dd>
                </div>
              </dl>
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
