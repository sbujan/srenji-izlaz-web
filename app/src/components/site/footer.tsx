import { useLang, type Lang } from "@/lib/i18n";

import { Logo } from "./logo";

const copy: Record<
  Lang,
  {
    ctaTitle: string;
    ctaButton: string;
    address: string;
    contact: string;
    company: string;
    director: string;
    rights: string;
  }
> = {
  hr: {
    ctaTitle: "Imate projekt ili upit?",
    ctaButton: "Pošalji upit",
    address: "Adresa",
    contact: "Kontakt",
    company: "Podaci o društvu",
    director: "direktor",
    rights: "Sva prava pridržana.",
  },
  en: {
    ctaTitle: "Have a project or an inquiry?",
    ctaButton: "Send an inquiry",
    address: "Address",
    contact: "Contact",
    company: "Company details",
    director: "director",
    rights: "All rights reserved.",
  },
};

export function SiteFooter() {
  const { lang } = useLang();
  const t = copy[lang];

  return (
    <footer className="si-footer" id="kontakt">
      <div className="si-container">
        <div className="si-footer-cta">
          <h2 className="si-h2">{t.ctaTitle}</h2>
          <a className="si-cta-inquiry" href="mailto:ivan@srednjiizlaz.hr">
            {t.ctaButton}
          </a>
        </div>
        <div className="si-footer-cols">
          <div className="si-footer-col">
            <Logo />
          </div>
          <div className="si-footer-col">
            <h4>{t.address}</h4>
            <p>
              Srednji izlaz d.o.o.
              <br />
              Mokrička 26
              <br />
              10298 Donja Bistra
            </p>
          </div>
          <div className="si-footer-col">
            <h4>{t.contact}</h4>
            <p>
              Ivan Pranjić, {t.director}
              <br />
              <a href="mailto:ivan@srednjiizlaz.hr">ivan@srednjiizlaz.hr</a>
            </p>
          </div>
        </div>
        <div className="si-footer-legal">
          <span>OIB: 69231941942 · MBS: 081070237</span>
          <span>
            © {new Date().getFullYear()} Srednji izlaz d.o.o. {t.rights}
          </span>
        </div>
      </div>
    </footer>
  );
}
