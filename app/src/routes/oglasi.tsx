import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";

import { ContactForm } from "@/components/site/contact-form";
import { SiteFooter } from "@/components/site/footer";
import { SiteNav } from "@/components/site/nav";
import { Reveal } from "@/components/site/reveal";
import { useLang, type Lang } from "@/lib/i18n";

export const Route = createFileRoute("/oglasi")({
  head: () => ({
    meta: [
      { title: "Oglasi za posao · Srednji izlaz d.o.o." },
      {
        name: "description",
        content:
          "Zapošljavamo: tesari, zidari, armirači, kranisti, fasaderi, soboslikari, knauferi i keramičari. Stalni radni odnos, poticajna primanja i dodatne edukacije.",
      },
    ],
  }),
  component: Oglasi,
});

type Job = {
  id: string;
  title: string;
  summary: string;
  contract: string;
  skills: string[];
  education: string;
  /** Roles this advert covers, offered in the application select. */
  roles: string[];
};

const jobs: Record<Lang, Job[]> = {
  hr: [
    {
      id: "tesar",
      title: "Tesar / Zidar / Armirač",
      summary:
        "Poslovi građevinskog radnika u visokogradnji i niskogradnji (izgradnja, adaptacija i rekonstrukcija objekata i prometnica): rad sa oplatama, zidanje, armiranje, betoniranje, asfaltiranje.",
      contract: "Na određeno vrijeme, stalni radni odnos",
      skills: [
        "SSS / KV tesar, KV zidar ili KV armirač, odnosno uvjerenje o stručnom osposobljavanju za poslove tesara, zidara ili armirača",
        "U obzir dolaze svi kandidati građevinsko-obrtničkog zanimanja (zidari, tesari, armirači, betonirci i dr.)",
        "Poželjno iskustvo rada sa zidnim oplatama",
      ],
      education:
        "Srednja stručna sprema, kvalificirani, nekvalificirani, polukvalificirani, visokokvalificirani",
      roles: ["Tesar", "Zidar", "Armirač"],
    },
    {
      id: "kranist",
      title: "Kranist",
      summary:
        "Rukovanje građevinskim dizalicama (toranjskim i pokretnim) prilikom izgradnje, adaptacije i rekonstrukcije objekata. Podizanje, premještanje i precizno postavljanje građevinskog materijala. Održavanje i osnovno servisiranje opreme te rad u skladu sa sigurnosnim standardima.",
      contract: "Na određeno vrijeme, stalni radni odnos",
      skills: [
        "SSS tehničkog usmjerenja ili uvjerenje o stručnom osposobljavanju za rukovatelja građevinskim dizalicama",
        "Poželjno radno iskustvo na istim ili sličnim poslovima",
        "Odgovornost i preciznost u radu",
        "Poželjna vozačka dozvola B kategorije",
      ],
      education:
        "Srednja stručna sprema, kvalificirani, nekvalificirani, polukvalificirani, visokokvalificirani",
      roles: ["Kranist"],
    },
    {
      id: "zavrsni",
      title: "Fasaderi, soboslikari, knauferi, keramičari",
      summary:
        "Rad na završnim građevinskim radovima: fasaderski radovi (toplinska izolacija, završni slojevi), soboslikarski radovi (priprema i ličenje zidova), montaža gipskartonskih sustava (knauf pregradni zidovi i stropovi) te postavljanje keramičkih pločica i priprema podloga.",
      contract: "Na određeno vrijeme, stalni radni odnos",
      skills: [
        "SSS građevinsko-obrtničkog usmjerenja ili uvjerenje o stručnom osposobljavanju za fasadera, soboslikara, montera suhe gradnje ili keramičara",
        "Poželjno radno iskustvo na istim ili sličnim poslovima",
        "Odgovornost i preciznost u radu",
        "Poželjna vozačka dozvola B kategorije",
      ],
      education:
        "Srednja stručna sprema, kvalificirani, nekvalificirani, polukvalificirani, visokokvalificirani",
      roles: ["Fasader", "Soboslikar", "Knaufer", "Keramičar"],
    },
  ],
  en: [
    {
      id: "tesar",
      title: "Carpenter / Mason / Steel fixer",
      summary:
        "Construction work in structural and civil engineering (building, adaptation and reconstruction of buildings and roads): formwork, masonry, steel fixing, concreting and asphalting.",
      contract: "Fixed term, permanent employment",
      skills: [
        "Secondary or skilled-trade qualification as a carpenter, mason or steel fixer, or a certificate of vocational training for that work",
        "All candidates from the building trades are welcome (masons, carpenters, steel fixers, concreters and others)",
        "Experience with wall formwork is an advantage",
      ],
      education:
        "Secondary, skilled, unskilled, semi-skilled and highly skilled candidates considered",
      roles: ["Carpenter", "Mason", "Steel fixer"],
    },
    {
      id: "kranist",
      title: "Crane operator",
      summary:
        "Operating construction cranes (tower and mobile) during the building, adaptation and reconstruction of structures. Lifting, moving and precisely positioning materials. Maintaining and basically servicing the equipment, and working to safety standards.",
      contract: "Fixed term, permanent employment",
      skills: [
        "Secondary technical qualification or a certificate of vocational training as a construction crane operator",
        "Experience in the same or similar work is an advantage",
        "Reliability and precision",
        "A category B driving licence is an advantage",
      ],
      education:
        "Secondary, skilled, unskilled, semi-skilled and highly skilled candidates considered",
      roles: ["Crane operator"],
    },
    {
      id: "zavrsni",
      title: "Facade fitters, painters, drywallers, tilers",
      summary:
        "Finishing work on site: facades (thermal insulation and top coats), painting and decorating (preparing and painting walls), drywall systems (partition walls and ceilings) and laying ceramic tiles including substrate preparation.",
      contract: "Fixed term, permanent employment",
      skills: [
        "Secondary building-trade qualification or a certificate of vocational training as a facade fitter, painter, drywall fitter or tiler",
        "Experience in the same or similar work is an advantage",
        "Reliability and precision",
        "A category B driving licence is an advantage",
      ],
      education:
        "Secondary, skilled, unskilled, semi-skilled and highly skilled candidates considered",
      roles: ["Facade fitter", "Painter", "Drywaller", "Tiler"],
    },
  ],
};

/** Identical across all three adverts on the source page, so it is stated once. */
const benefits: Record<Lang, string[]> = {
  hr: [
    "Poticajna i ugodna radna atmosfera",
    "Mogućnost osobnog i profesionalnog razvoja",
    "Poticajna primanja sukladno radnom mjestu",
    "Mogućnost stimulacije sukladno postignutim rezultatima",
    "Dodatne edukacije, osposobljavanja i certificiranja u struci",
    "Prigodne isplate i novčane potpore: božićnica, uskrsnica, dar za dijete, jubilarne nagrade",
  ],
  en: [
    "A supportive and pleasant place to work",
    "Room to grow personally and professionally",
    "Competitive pay for the role",
    "Performance-based bonuses",
    "Further training, qualifications and trade certification",
    "Seasonal payments and financial support: Christmas and Easter bonuses, child allowance, long-service awards",
  ],
};

const page: Record<
  Lang,
  {
    title: string;
    lead: string;
    hiring: string;
    contract: string;
    skills: string;
    education: string;
    apply: string;
    benefitsTitle: string;
    benefitsLead: string;
    formTitle: string;
    formLead: string;
  }
> = {
  hr: {
    title: "Oglasi za posao",
    lead: "Gradimo stalan tim. Za sva radna mjesta zapošljavamo više izvršitelja.",
    hiring: "Više izvršitelja",
    contract: "Vrsta posla",
    skills: "Potrebno znanje i vještine",
    education: "Stručna sprema",
    apply: "Prijavi se",
    benefitsTitle: "Poslodavac ti nudi",
    benefitsLead: "Isto za sva radna mjesta u oglasu.",
    formTitle: "Javite nam se preko forme",
    formLead:
      "Odaberite posao, ostavite kontakt i kratko nam se predstavite. Javljamo se u najkraćem roku.",
  },
  en: {
    title: "Job openings",
    lead: "We're building a permanent team. Every role below is open to several people.",
    hiring: "Several positions",
    contract: "Contract",
    skills: "Skills and qualifications",
    education: "Level of education",
    apply: "Apply",
    benefitsTitle: "What we offer",
    benefitsLead: "The same for every role in this listing.",
    formTitle: "Apply through the form",
    formLead:
      "Pick the job, leave your contact details and tell us briefly about yourself. We'll be in touch shortly.",
  },
};

function Oglasi() {
  const { lang } = useLang();
  const t = page[lang];
  const items = jobs[lang];
  const [position, setPosition] = useState("");
  const formRef = useRef<HTMLDivElement>(null);

  const roles = items.flatMap((job) => job.roles);

  function applyFor(role: string) {
    setPosition(role);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

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
            {items.map((job, index) => (
              <Reveal className="si-vacancy" delay={index * 70} key={job.id}>
                <div className="si-vacancy-head">
                  <div>
                    <p className="si-vacancy-tag">{t.hiring}</p>
                    <h2 className="si-h3">{job.title}</h2>
                  </div>
                  <button
                    className="si-cta-listings"
                    type="button"
                    onClick={() => applyFor(job.roles[0])}
                  >
                    <span className="si-cta-label">{t.apply}</span>
                    <span aria-hidden="true" className="si-cta-ghost">
                      {t.apply}
                    </span>
                  </button>
                </div>

                <p className="si-vacancy-summary">{job.summary}</p>

                <dl className="si-vacancy-detail">
                  <div>
                    <dt>{t.contract}</dt>
                    <dd>{job.contract}</dd>
                  </div>
                  <div>
                    <dt>{t.skills}</dt>
                    <dd>
                      <ul className="si-ticks">
                        {job.skills.map((skill) => (
                          <li key={skill}>{skill}</li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                  <div>
                    <dt>{t.education}</dt>
                    <dd>{job.education}</dd>
                  </div>
                </dl>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="si-section si-section--tint">
          <div className="si-container">
            <Reveal>
              <p className="si-eyebrow">{t.benefitsLead}</p>
              <h2 className="si-h2">{t.benefitsTitle}</h2>
            </Reveal>
            <Reveal delay={80}>
              <ul className="si-benefits">
                {benefits[lang].map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>

        <section className="si-section" id="prijava" ref={formRef}>
          <div className="si-container si-apply">
            <Reveal>
              <h2 className="si-h2">{t.formTitle}</h2>
              <p className="si-lead">{t.formLead}</p>
            </Reveal>
            <Reveal delay={80}>
              <ContactForm positions={roles} position={position} onPositionChange={setPosition} />
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter showForm={false} />
    </div>
  );
}
