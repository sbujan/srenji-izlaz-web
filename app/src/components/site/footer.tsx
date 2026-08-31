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
    person: string;
    role: string;
    address: string;
    email: string;
    phone: string;
    rights: string;
  }
> = {
  hr: {
    ctaTitle: "Imate projekt ili upit?",
    ctaBody: "Opišite nam ukratko što planirate — javljamo se s procjenom i sljedećim koracima.",
    person: "Ivan Pranjić",
    role: "Direktor",
    address: "Adresa",
    email: "E-mail",
    phone: "Telefon",
    rights: "Sva prava pridržana.",
  },
  en: {
    ctaTitle: "Have a project or an inquiry?",
    ctaBody:
      "Tell us briefly what you're planning — we'll come back with an estimate and the next steps.",
    person: "Ivan Pranjić",
    role: "Director",
    address: "Address",
    email: "E-mail",
    phone: "Phone",
    rights: "All rights reserved.",
  },
};

/**
 * `showForm={false}` on a page that already has its own form — /oglasi carries a
 * job application, and a second identical-looking form directly beneath it only
 * makes a visitor wonder which one they are supposed to use. The contact details
 * still show either way.
 */
export function SiteFooter({ showForm = true }: { showForm?: boolean } = {}) {
  const { lang } = useLang();
  const t = copy[lang];

  return (
    <footer className="si-footer" id="kontakt">
      <div className="si-container">
        <div className={showForm ? "si-footer-cta" : "si-footer-cta si-footer-cta--solo"}>
          <div className="si-contact-card">
            <h2 className="si-h2">{t.ctaTitle}</h2>
            <p className="si-lead">{t.ctaBody}</p>

            <p className="si-contact-person">
              <strong>{t.person}</strong>
              <span>{t.role}</span>
            </p>

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
              <div>
                <dt>{t.address}</dt>
                <dd>
                  Srednji izlaz d.o.o.
                  <br />
                  Mokrička 26, 10298 Donja Bistra
                </dd>
              </div>
            </dl>
          </div>

          {showForm ? <ContactForm /> : null}
        </div>

        <div className="si-footer-legal">
          <Logo />
          <span>OIB: 69231941942 · MBS: 081070237</span>
          <span>
            © {new Date().getFullYear()} Srednji izlaz d.o.o. {t.rights}
          </span>
        </div>
      </div>
    </footer>
  );
}
