import { useId, useRef, useState } from "react";

import { useLang, type Lang } from "@/lib/i18n";

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent" }
  | { kind: "error"; message: string };

type Field = "name" | "email" | "message";

const copy: Record<
  Lang,
  {
    name: string;
    email: string;
    message: string;
    submit: string;
    sending: string;
    sent: string;
    required: string;
    badEmail: string;
    tooLong: string;
    failed: string;
    offline: string;
  }
> = {
  hr: {
    name: "Ime i prezime",
    email: "E-mail",
    message: "Poruka",
    submit: "Pošalji upit",
    sending: "Šaljem…",
    sent: "Hvala na upitu. Javljamo se u najkraćem roku.",
    required: "Ovo polje je obavezno.",
    badEmail: "Provjerite e-mail adresu.",
    tooLong: "Poruka je predugačka.",
    failed: "Slanje nije uspjelo. Pokušajte ponovno ili nam pišite izravno.",
    offline: "Nema veze s internetom. Provjerite vezu i pokušajte ponovno.",
  },
  en: {
    name: "Full name",
    email: "E-mail",
    message: "Message",
    submit: "Send inquiry",
    sending: "Sending…",
    sent: "Thanks for your inquiry. We'll be in touch shortly.",
    required: "This field is required.",
    badEmail: "Check the e-mail address.",
    tooLong: "That message is too long.",
    failed: "Sending failed. Please try again, or write to us directly.",
    offline: "You appear to be offline. Check your connection and try again.",
  },
};

// Mirrors the limits the endpoint enforces, so the form reports a problem the
// server would reject anyway before spending a request on it.
const MAX = { name: 100, email: 200, message: 4000 };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function ContactForm() {
  const { lang } = useLang();
  const t = copy[lang];
  const formId = useId();

  const [values, setValues] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  // Bot trap: a real person never sees this field, so anything in it means the
  // submission was filled in by a script.
  const honeypot = useRef("");

  function validate() {
    const next: Partial<Record<Field, string>> = {};
    if (!values.name.trim()) next.name = t.required;
    if (!values.email.trim()) next.email = t.required;
    else if (!EMAIL_RE.test(values.email.trim())) next.email = t.badEmail;
    if (!values.message.trim()) next.message = t.required;
    else if (values.message.length > MAX.message) next.message = t.tooLong;
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (status.kind === "sending") return;
    if (!validate()) return;

    setStatus({ kind: "sending" });
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          message: values.message.trim(),
          company: honeypot.current,
          lang,
        }),
      });

      if (!response.ok) {
        // The endpoint returns a safe, already-translated reason where it has
        // one; anything else falls back to the generic message.
        const detail = await response.json().catch(() => null);
        setStatus({
          kind: "error",
          message:
            typeof detail?.error === "string" && detail.error.length < 200
              ? detail.error
              : t.failed,
        });
        return;
      }

      setValues({ name: "", email: "", message: "" });
      setStatus({ kind: "sent" });
    } catch {
      setStatus({
        kind: "error",
        message:
          typeof navigator !== "undefined" && navigator.onLine === false
            ? t.offline
            : t.failed,
      });
    }
  }

  function field(name: Field) {
    return {
      id: `${formId}-${name}`,
      name,
      value: values[name],
      maxLength: MAX[name],
      "aria-invalid": errors[name] ? (true as const) : undefined,
      "aria-describedby": errors[name] ? `${formId}-${name}-error` : undefined,
      onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      ) => {
        setValues((v) => ({ ...v, [name]: e.target.value }));
        if (errors[name]) setErrors((x) => ({ ...x, [name]: undefined }));
      },
    };
  }

  const sending = status.kind === "sending";

  return (
    <form className="si-form" noValidate onSubmit={onSubmit}>
      <div className="si-field">
        <label htmlFor={`${formId}-name`}>{t.name}</label>
        <input type="text" autoComplete="name" {...field("name")} />
        {errors.name && (
          <p className="si-field-error" id={`${formId}-name-error`}>
            {errors.name}
          </p>
        )}
      </div>

      <div className="si-field">
        <label htmlFor={`${formId}-email`}>{t.email}</label>
        <input type="email" autoComplete="email" {...field("email")} />
        {errors.email && (
          <p className="si-field-error" id={`${formId}-email-error`}>
            {errors.email}
          </p>
        )}
      </div>

      <div className="si-field">
        <label htmlFor={`${formId}-message`}>{t.message}</label>
        <textarea rows={5} {...field("message")} />
        {errors.message && (
          <p className="si-field-error" id={`${formId}-message-error`}>
            {errors.message}
          </p>
        )}
      </div>

      {/* Off-screen and skipped by tab order and screen readers; only a bot
          fills it in. */}
      <div aria-hidden="true" className="si-hp">
        <label htmlFor={`${formId}-company`}>Company</label>
        <input
          id={`${formId}-company`}
          name="company"
          tabIndex={-1}
          autoComplete="off"
          onChange={(e) => {
            honeypot.current = e.target.value;
          }}
        />
      </div>

      <button className="si-cta-listings" disabled={sending} type="submit">
        <span className="si-cta-label">{sending ? t.sending : t.submit}</span>
        <span aria-hidden="true" className="si-cta-ghost">
          {sending ? t.sending : t.submit}
        </span>
      </button>

      <p
        aria-live="polite"
        className={
          status.kind === "error" ? "si-form-status is-error" : "si-form-status"
        }
      >
        {status.kind === "sent" && t.sent}
        {status.kind === "error" && status.message}
      </p>
    </form>
  );
}
