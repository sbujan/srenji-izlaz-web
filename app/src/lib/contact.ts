/**
 * Contact details, assembled at call time rather than written as literals.
 *
 * Every page here is prerendered to static HTML at build time. An address
 * written straight into JSX — or into a `mailto:` href — ships inside that HTML,
 * where an address harvester finds it with one regex pass. Splitting the parts
 * and joining them only when a visitor asks keeps the finished address out of
 * the served markup and out of the crawlable DOM.
 *
 * This defeats the naive scrapers that cause the actual spam. It is not
 * protection against someone reading the JS bundle by hand, and it is not meant
 * to be: the address has to reach real visitors somehow.
 */

const EMAIL_USER = "ivan";
const EMAIL_DOMAIN = "srednjiizlaz.hr";

const PHONE_COUNTRY = "385";
const PHONE_GROUPS = ["91", "2244", "476"];

/** ivan@… — call only from an event handler or after mount, never during render. */
export function emailAddress(): string {
  return `${EMAIL_USER}@${EMAIL_DOMAIN}`;
}

/** Human-readable number, grouped as it is written locally. */
export function phoneDisplay(): string {
  return `+${PHONE_COUNTRY} ${PHONE_GROUPS.join(" ")}`;
}

/** Digits only, for tel: and wa.me. */
export function phoneDigits(): string {
  return `${PHONE_COUNTRY}${PHONE_GROUPS.join("")}`;
}

export function mailtoHref(subject?: string): string {
  const base = `mailto:${emailAddress()}`;
  return subject ? `${base}?subject=${encodeURIComponent(subject)}` : base;
}

export function telHref(): string {
  return `tel:+${phoneDigits()}`;
}

/**
 * WhatsApp deep link. Unlike the address above this one is a call to action —
 * it exists to be clicked — so it is rendered as a normal link rather than
 * hidden behind a reveal.
 */
export function whatsappHref(): string {
  return `https://wa.me/${phoneDigits()}`;
}
