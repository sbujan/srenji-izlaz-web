import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Canonical origin for the generated sitemap's <loc> entries. Override per
// environment with VITE_SITE_URL (set it in the Vercel project settings once the
// custom domain is attached).
const SITE_URL = (
  process.env.VITE_SITE_URL ?? "https://srednjiizlaz.hr"
).replace(/\/$/, "");

export default defineConfig({
  resolve: {
    // Honour the "@/*" -> "./src/*" alias declared in tsconfig.json. Without
    // this the dependency scan cannot resolve the app's own imports and Vite
    // silently skips dependency pre-bundling, which makes dev startup crawl.
    tsconfigPaths: true,
  },
  plugins: [
    // TanStack Start must run before the React plugin.
    //
    // Every page here is static content — the only interactivity (language
    // toggle, scroll journey, reveals) runs in the browser — so the build
    // prerenders each route to real HTML instead of shipping a server. Vercel
    // then serves the whole site from its CDN: no serverless function, no cold
    // start, and crawlers get fully rendered markup.
    tanstackStart({
      // The site's pages, listed explicitly rather than discovered by crawling
      // links. Crawling also picks up in-page anchors such as "/#kontakt" and
      // files them in the sitemap as separate URLs, which reports the home page
      // to Search Console twice. ADD A NEW PAGE HERE when you add a route —
      // otherwise it still works and still deploys, it just won't be
      // prerendered or listed in the sitemap.
      pages: [
        { path: "/", sitemap: { priority: 1, changefreq: "monthly" } },
        { path: "/oglasi", sitemap: { priority: 0.8, changefreq: "weekly" } },
        { path: "/karijera", sitemap: { priority: 0.6, changefreq: "monthly" } },
      ],
      prerender: {
        enabled: true,
        failOnError: true,
        // Off so the `pages` list above is the single source of truth; link
        // crawling would re-add the "/#kontakt" anchor as its own entry.
        crawlLinks: false,
      },
      sitemap: {
        enabled: true,
        host: SITE_URL,
      },
    }),
    react(),
  ],
});
