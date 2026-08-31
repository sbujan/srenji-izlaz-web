import { createFileRoute } from "@tanstack/react-router";

import { SiteFooter } from "@/components/site/footer";
import { SiteNav } from "@/components/site/nav";
import { MailtoAction } from "@/components/site/contact-reveal";
import { Reveal } from "@/components/site/reveal";
import { useLang, type Lang } from "@/lib/i18n";

export const Route = createFileRoute("/karijera")({
  head: () => ({
    meta: [
      { title: "Karijera · Srednji izlaz d.o.o." },
      {
        name: "description",
        content:
          "Otvorene pozicije u građevinskim timovima tvrtke Srednji izlaz d.o.o. Pridružite se timu koji gradi.",
      },
    ],
  }),
  component: Karijera,
});

type Job = {
  id: string;
  title: string;
  meta: string;
  body: string;
};

const jobs: Record<Lang, Job[]> = {
  hr: [
    {
      id: "radnik",
      title: "Građevinski radnik (m/ž)",
      meta: "Gradilišta · Zagreb i okolica · Puno radno vrijeme",
      body: "Radovi niskogradnje i visokogradnje na aktivnim gradilištima. Iskustvo je prednost, ali nije uvjet.",
    },
    {
      id: "tesar",
      title: "Tesar / zidar (m/ž)",
      meta: "Gradilišta · Zagreb i okolica · Puno radno vrijeme",
      body: "Izvedba tesarskih, zidarskih i armiračkih radova prema projektnoj dokumentaciji.",
    },
    {
      id: "voditelj",
      title: "Voditelj gradilišta (m/ž)",
      meta: "Donja Bistra · Puno radno vrijeme",
      body: "Organizacija gradilišta, koordinacija timova i podizvođača te kontrola kvalitete i rokova.",
    },
  ],
  en: [
    {
      id: "radnik",
      title: "Construction worker (m/f)",
      meta: "Construction sites · Zagreb area · Full time",
      body: "Civil and structural works on active construction sites. Experience is a plus, not a requirement.",
    },
    {
      id: "tesar",
      title: "Carpenter / mason (m/f)",
      meta: "Construction sites · Zagreb area · Full time",
      body: "Carpentry, masonry and reinforcement works according to project documentation.",
    },
    {
      id: "voditelj",
      title: "Site manager (m/f)",
      meta: "Donja Bistra · Full time",
      body: "Site organization, coordination of teams and subcontractors, quality and schedule control.",
    },
  ],
};

const page: Record<
  Lang,
  {
    title: string;
    lead: string;
    apply: string;
    openTitle: string;
    openBody: string;
    openCta: string;
    applySubject: string;
    openSubject: string;
  }
> = {
  hr: {
    title: "Karijera",
    lead: "Tim koji gradi. Tražimo ljude koji žele raditi na stvarnim projektima, od temelja do primopredaje.",
    apply: "Prijavi se",
    openTitle: "Ne vidiš svoju poziciju?",
    openBody: "Pošalji otvorenu prijavu i javit ćemo se kad se otvori odgovarajuće mjesto.",
    openCta: "Otvorena prijava",
    applySubject: "Prijava",
    openSubject: "Otvorena prijava",
  },
  en: {
    title: "Careers",
    lead: "A team that builds. We are looking for people who want to work on real projects, from foundation to handover.",
    apply: "Apply",
    openTitle: "Don't see your position?",
    openBody: "Send an open application and we will reach out when a suitable role opens.",
    openCta: "Open application",
    applySubject: "Application",
    openSubject: "Open application",
  },
};

function Karijera() {
  const { lang } = useLang();
  const t = page[lang];
  const items = jobs[lang];

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
            <Reveal>
              <img
                alt="Srednji izlaz"
                className="si-hero-img"
                loading="lazy"
                height={1066}
                src="/assets/img/karijera.jpg"
                width={1600}
              />
            </Reveal>
            <div style={{ marginTop: "3rem" }}>
              {items.map((job, index) => (
                <Reveal delay={index * 60} key={job.id}>
                  <div className="si-job">
                    <div>
                      <h3>{job.title}</h3>
                      <p className="si-job-meta">{job.meta}</p>
                      <p>{job.body}</p>
                    </div>
                    <MailtoAction
                      className="si-cta-positions"
                      subject={`${t.applySubject}: ${job.title}`}
                    >
                      {t.apply}
                      <span aria-hidden="true" className="si-arrow">
                        →
                      </span>
                    </MailtoAction>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal delay={100}>
              <div className="si-open-app">
                <div>
                  <h3>{t.openTitle}</h3>
                  <p>{t.openBody}</p>
                </div>
                <MailtoAction className="si-cta-inquiry" subject={t.openSubject}>
                  {t.openCta}
                </MailtoAction>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
