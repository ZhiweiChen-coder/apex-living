"use client";

import { useEffect, useRef } from "react";

type TurnstileApi = { render: (element: HTMLElement, options: { sitekey: string; callback: (token: string) => void; "error-callback": () => void; "expired-callback": () => void }) => string };

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export function Turnstile({ onToken }: { onToken: (token: string) => void }) {
  const container = useRef<HTMLDivElement>(null);
  const callback = useRef(onToken);

  useEffect(() => { callback.current = onToken; }, [onToken]);

  useEffect(() => {
    if (!siteKey || !container.current) return;
    let mounted = true;
    const render = () => {
      if (!mounted || !container.current || !window.turnstile) return;
      window.turnstile.render(container.current, {
        sitekey: siteKey,
        callback: (token) => callback.current(token),
        "error-callback": () => callback.current(""),
        "expired-callback": () => callback.current(""),
      });
    };

    const existing = document.getElementById("apex-turnstile-script") as HTMLScriptElement | null;
    if (existing) {
      if (window.turnstile) render();
      else existing.addEventListener("load", render, { once: true });
    } else {
      const script = document.createElement("script");
      script.id = "apex-turnstile-script";
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.addEventListener("load", render, { once: true });
      document.head.appendChild(script);
    }

    return () => { mounted = false; };
  }, []);

  if (!siteKey) return null;
  return <div className="turnstile" ref={container} aria-label="Security check" />;
}
