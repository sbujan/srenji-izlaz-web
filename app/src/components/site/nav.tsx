import { Link } from "@tanstack/react-router";

import { useLang, type Lang } from "@/lib/i18n";

import { Logo } from "./logo";

const labels: Record<Lang, { listings: string; careers: string; contact: string }> = {
  hr: { listings: "Oglasi", careers: "Karijera", contact: "Kontakt" },
  en: { listings: "Listings", careers: "Careers", contact: "Contact" },
};

export function SiteNav() {
  const { lang, setLang } = useLang();
  const t = labels[lang];

  return (
    <header className="si-nav">
      <div className="si-container si-nav-inner">
        <Link to="/" aria-label="Srednji izlaz">
          <Logo />
        </Link>
        <nav className="si-nav-links" aria-label="Main">
          <Link className="si-nav-link" to="/oglasi">
            {t.listings}
          </Link>
          <Link className="si-nav-link" to="/karijera">
            {t.careers}
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
