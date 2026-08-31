import { Link } from "@tanstack/react-router";

import { useLang, type Lang } from "@/lib/i18n";

import { Logo } from "./logo";

const labels: Record<Lang, { services: string; jobs: string; contact: string }> = {
  // "Poslovi" rather than the page's own "Oglasi za posao": the bar has to hold
  // three links and the language toggle on a 360px screen.
  hr: { services: "Usluge", jobs: "Poslovi", contact: "Kontakt" },
  en: { services: "Services", jobs: "Jobs", contact: "Contact" },
};

export function SiteNav() {
  const { lang, setLang } = useLang();
  const t = labels[lang];

  return (
    <header className="si-nav">
      <div className="si-container si-nav-inner">
        <Link to="/">
          <Logo />
        </Link>
        <nav className="si-nav-links" aria-label="Main">
          <a className="si-nav-link" href="/#usluge">
            {t.services}
          </a>
          <Link className="si-nav-link" to="/oglasi">
            {t.jobs}
          </Link>
          <a className="si-nav-link" href="/#kontakt">
            {t.contact}
          </a>
          <div className="si-lang" role="group" aria-label="Language">
            <button
              aria-pressed={lang === "hr"}
              onClick={() => setLang("hr")}
              type="button"
            >
              HR
            </button>
            <button
              aria-pressed={lang === "en"}
              onClick={() => setLang("en")}
              type="button"
            >
              EN
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
