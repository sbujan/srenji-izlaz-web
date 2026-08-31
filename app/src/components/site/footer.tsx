import { useLang, type Lang } from "@/lib/i18n";

import { ContactForm } from "./contact-form";
import { ContactReveal } from "./contact-reveal";
import { Logo } from "./logo";
import { WhatsAppLink } from "./whatsapp-button";

const copy: Record<
  Lang,
  {
    ctaTitle: string;
    ctaBody: string;
    address: string;
    contact: string;
    director: string;
    email: string;
    phone: string;
    rights: string;
  }
> = {
  hr: {
    ctaTitle: "Imate projekt ili upit?",
    ctaBody:
      "Opišite nam ukratko što planirate — javljamo se s procjenom i sljedećim koracima.",
    address: "Adresa",
    contact: "Kontakt",
    director: "direktor",
    email: "E-mail",
    phone: "Telefon",
    rights: "Sva prava pridržana.",
  },
  en: {
    ctaTitle: "Have a project or an inquiry?",
    ctaBody:
      "Tell us briefly what you're planning — we'll come back with an estimate and the next steps.",
    address: "Address",
    contact: "Contact",
    director: "director",
    email: "E-mail",
    phone: "Phone",
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
          <div className="si-footer-cta-intro">
            <h2 className="si-h2">{t.ctaTitle}</h2>
            <p className="si-lead">{t.ctaBody}</p>
          </div>
          <ContactForm />
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
            <p>Ivan Pranjić, {t.director}</p>
            <dl className="si-contact-list">
              <div>
                <dt>{t.email}</dt>
                <dd>
                  <ContactReveal kind="email" />
                </dd>
              </div>
              <div>
                <dt>{t.phone}</dt>
                <dd>
                  <ContactReveal kind="phone" />
                </dd>
              </div>
              <div>
                <dt>WhatsApp</dt>
                <dd>
                  <WhatsAppLink />
                </dd>
              </div>
            </dl>
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
