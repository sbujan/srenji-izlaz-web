import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

// A reload must open at the top, on the film — not wherever the last visit
// ended. Two restorers had to be told so: "manual" switches off the browser's
// own position restore, and the router is created WITHOUT scrollRestoration so
// it keeps no positions of its own (its cache is read the moment the library
// module evaluates, which makes clearing it later unreliable — not opting in is
// the only race-free off switch). Navigations inside the site still land at the
// top of the target page, which is the router's default, and #kontakt fragment
// scrolling is unaffected — fragment handling is separate from restoration.
if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

export const getRouter = () =>
  createRouter({
    routeTree,
    defaultPreloadStaleTime: 0,
  });
