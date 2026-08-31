import { useState, type ReactNode } from "react";

import { useLang, type Lang } from "@/lib/i18n";
import {
  emailAddress,
  mailtoHref,
  phoneDisplay,
  telHref,
} from "@/lib/contact";

const copy: Record<Lang, { showEmail: string; showPhone: string }> = {
  hr: { showEmail: "Prikaži e-mail", showPhone: "Prikaži broj" },
  en: { showEmail: "Show e-mail", showPhone: "Show number" },
};

/**
 * Renders a button that swaps itself for the real address once clicked.
 *
 * The address is resolved inside the click handler, so it exists only after a
 * person asks for it — it is absent from the prerendered HTML and from the DOM
 * a crawler sees. See lib/contact.ts.
 */
export function ContactReveal({ kind }: { kind: "email" | "phone" }) {
  const { lang } = useLang();
  const [value, setValue] = useState<{ href: string; text: string } | null>(
    null,
  );

  if (value) {
    return (
      <a className="si-contact-value" href={value.href}>
        {value.text}
      </a>
    );
  }

  return (
    <button
      className="si-reveal"
      type="button"
      onClick={() =>
        setValue(
          kind === "email"
            ? { href: mailtoHref(), text: emailAddress() }
            : { href: telHref(), text: phoneDisplay() },
        )
      }
    >
      {kind === "email" ? copy[lang].showEmail : copy[lang].showPhone}
    </button>
  );
}

/**
 * A "write to us about X" action whose address is only assembled on click, so
 * the subject-prefilled mailto never appears in the markup either. Rendered as
 * a button because there is no href until the visitor acts.
 */
export function MailtoAction({
  subject,
  className,
  children,
}: {
  subject?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      className={className}
      type="button"
      onClick={() => {
        window.location.href = mailtoHref(subject);
      }}
    >
      {children}
    </button>
  );
}
