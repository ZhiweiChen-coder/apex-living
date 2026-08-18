"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const cookieName = "apex_cookie_preference";

function hasPreferenceCookie() {
  return document.cookie.split("; ").some((cookie) => cookie.startsWith(`${cookieName}=`));
}

function setPreference(value: "accepted" | "necessary") {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${cookieName}=${value}; Max-Age=31536000; Path=/; SameSite=Lax${secure}`;
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setVisible(!hasPreferenceCookie()));
    return () => window.cancelAnimationFrame(frame);
  }, []);
  if (!visible) return null;

  function choose(value: "accepted" | "necessary") {
    setPreference(value);
    setVisible(false);
  }

  return <section className="cookie-consent" aria-label="Cookie preferences"><div><p className="eyebrow">Your privacy</p><p>We use one essential preference cookie to remember this choice. We do not use advertising or tracking cookies. <Link href="/privacy">Privacy notice</Link></p></div><div className="cookie-actions"><button className="text-button" onClick={() => choose("necessary")}>Necessary only</button><button className="button button-gold" onClick={() => choose("accepted")}>Accept</button></div></section>;
}
