import {
  Outlet,
  Link,
  createRootRoute,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import type { ReactNode } from "react";

import appCss from "../styles.css?url";
import { LanguageProvider } from "../lib/i18n";

// Absolute origin for canonical + og: tags. Social scrapers reject relative
// image URLs, so these must be absolute even though the files are local.
// Vercel exposes the deployment origin; set VITE_SITE_URL to the custom domain
// so previews and production both advertise the canonical host.
const SITE_URL = (
  import.meta.env.VITE_SITE_URL ?? "https://srednjiizlaz.hr"
).replace(/\/$/, "");

const TITLE = "Srednji izlaz d.o.o. · Najbrži u svom poslu";
const DESCRIPTION =
  "Izvođenje građevinskih radova niskogradnje i visokogradnje, Ključ u ruke ili Roh-bau, te posredovanje i prodaja nekretnina. Construction and real estate, Donja Bistra, Croatia.";
const OG_IMAGE = `${SITE_URL}/assets/brand/og-cover.jpg`;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { name: "author", content: "Srednji izlaz d.o.o." },
      { property: "og:site_name", content: "Srednji izlaz d.o.o." },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "hr_HR" },
      { property: "og:locale:alternate", content: "en_GB" },
      { property: "og:url", content: SITE_URL },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: OG_IMAGE },
      { name: "theme-color", content: "#0b0c0e" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/assets/brand/favicon.png" },
      { rel: "apple-touch-icon", href: "/assets/brand/apple-touch-icon.png" },
      // Fonts load as their own request rather than through a CSS @import, so
      // the browser can fetch them in parallel with the stylesheet.
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="hr" style={{ colorScheme: "dark" }}>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <LanguageProvider>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </LanguageProvider>
  );
}

function MessagePage({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children?: ReactNode;
}) {
  return (
    <div className="si-page">
      <section className="si-section" style={{ borderTop: "none" }}>
        <div className="si-container" style={{ paddingTop: "6rem" }}>
          <p className="si-eyebrow">Srednji izlaz d.o.o.</p>
          <h1 className="si-h2">{title}</h1>
          <p className="si-lead">{body}</p>
          <div style={{ display: "flex", gap: "1rem", marginTop: "2.5rem" }}>
            {children}
          </div>
        </div>
      </section>
    </div>
  );
}

function NotFoundComponent() {
  return (
    <MessagePage
      title="Stranica nije pronađena."
      body="Tražena stranica ne postoji ili je premještena. — The page you're looking for doesn't exist or has been moved."
    >
      <Link to="/" className="si-cta-listings">
        <span className="si-cta-label">Povratak na početnu</span>
        <span aria-hidden="true" className="si-cta-ghost">
          Povratak na početnu
        </span>
      </Link>
    </MessagePage>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <MessagePage
      title="Stranica se nije učitala."
      body="Došlo je do pogreške. Pokušajte ponovno ili se vratite na početnu stranicu. — Something went wrong. Try again or head back home."
    >
      <button
        type="button"
        className="si-cta-inquiry"
        onClick={() => {
          router.invalidate();
          reset();
        }}
      >
        Pokušaj ponovno
      </button>
      <a href="/" className="si-cta-positions">
        Početna
        <span className="si-arrow" aria-hidden="true">
          →
        </span>
      </a>
    </MessagePage>
  );
}
