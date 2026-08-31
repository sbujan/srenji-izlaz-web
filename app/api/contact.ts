/**
 * Contact form endpoint — POST /api/contact
 *
 * Vercel builds any file under /api as a function automatically, independently
 * of the static site in dist/client. The rest of the site stays prerendered and
 * CDN-served; this is the only thing that runs per request.
 *
 * Environment variables (Vercel → Project → Settings → Environment Variables):
 *   RESEND_API_KEY  required to actually deliver. Until it is set the endpoint
 *                   still validates and answers cleanly, it just reports that
 *                   sending is unavailable instead of pretending to succeed.
 *   CONTACT_TO      recipient. Defaults to the company address below.
 *   CONTACT_FROM    sender. Must be an address on a domain verified in Resend.
 *                   The default is Resend's shared testing sender, which only
 *                   delivers to the Resend account owner — fine for a first
 *                   test, replace it with something like
 *                   "Srednji izlaz <upiti@srednjiizlaz.hr>" once the domain is
 *                   verified.
 */

export const config = { runtime: "edge" };

const MAX = { name: 100, email: 200, message: 4000 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const messages = {
  hr: {
    invalid: "Provjerite unesene podatke.",
    tooMany: "Previše pokušaja. Pokušajte ponovno za nekoliko minuta.",
    unavailable: "Slanje trenutačno nije dostupno. Pišite nam izravno e-mailom.",
  },
  en: {
    invalid: "Please check the details you entered.",
    tooMany: "Too many attempts. Please try again in a few minutes.",
    unavailable: "Sending is unavailable right now. Please e-mail us directly.",
  },
} as const;

type Lang = keyof typeof messages;

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      // Never cached, and never surfaced to another origin.
      "cache-control": "no-store",
    },
  });
}

/**
 * Best-effort flood control. An edge isolate keeps this map only while it is
 * warm and each region has its own, so it blunts a naive loop from one address
 * rather than guaranteeing a global limit — that would need a shared store
 * (Vercel KV / Upstash). The honeypot below is what stops ordinary form spam.
 */
const hits = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear(); // bound memory on a long-lived isolate
  return recent.length > MAX_PER_WINDOW;
}

/**
 * Only accept posts that came from a page on this same deployment.
 *
 * There is no session to forge here, so this is not CSRF protection — it stops
 * the endpoint being used as someone else's free mailer from a form on their
 * own domain. Comparing Origin against the request's own host rather than a
 * hard-coded domain keeps preview deployments and the custom domain both
 * working with no configuration. A missing Origin (curl, older clients) is
 * allowed through to the rate limiter rather than rejected outright.
 */
function isForeignOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const host = request.headers.get("host");
  try {
    return Boolean(host) && new URL(origin).host !== host;
  } catch {
    return true;
  }
}

/** Collapse control characters so a pasted newline cannot break the subject line. */
function singleLine(value: string): string {
  // The control-character range is the entire point here — the rule exists to
  // catch one written by accident, which is the opposite of this.
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u001F\u007F]+/g, " ").trim();
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  if (isForeignOrigin(request)) {
    return json({ error: "Forbidden" }, 403);
  }

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return json({ error: messages.hr.invalid }, 400);
  }

  const lang: Lang = payload.lang === "en" ? "en" : "hr";
  const t = messages[lang];

  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const name = str(payload.name);
  const email = str(payload.email);
  const message = str(payload.message);

  // A filled honeypot means a script. Answer exactly like a success so the bot
  // has no signal to adapt to, and send nothing.
  if (str(payload.company)) {
    return json({ ok: true }, 200);
  }

  if (
    !name ||
    name.length > MAX.name ||
    !email ||
    email.length > MAX.email ||
    !EMAIL_RE.test(email) ||
    !message ||
    message.length > MAX.message
  ) {
    return json({ error: t.invalid }, 400);
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return json({ error: t.tooMany }, 429);
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not set — contact form cannot deliver.");
    return json({ error: t.unavailable }, 503);
  }

  const to = process.env.CONTACT_TO || "ivan@srednjiizlaz.hr";
  const from = process.env.CONTACT_FROM || "Srednji izlaz <onboarding@resend.dev>";

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        // Replying goes straight back to the person who wrote in. The address is
        // only ever used here as data, never interpolated into HTML.
        reply_to: email,
        subject: `Upit s webstranice — ${singleLine(name)}`,
        text: [
          `Ime: ${name}`,
          `E-mail: ${email}`,
          `Jezik: ${lang}`,
          "",
          message,
        ].join("\n"),
      }),
    });

    if (!response.ok) {
      console.error(
        `Resend rejected the message: ${response.status} ${await response
          .text()
          .catch(() => "")}`,
      );
      return json({ error: t.unavailable }, 502);
    }

    return json({ ok: true }, 200);
  } catch (error) {
    console.error("Contact form delivery failed", error);
    return json({ error: t.unavailable }, 502);
  }
}
