"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, LoaderCircle, LockKeyhole, LogOut, Mail, Phone, ShieldCheck } from "lucide-react";

type Booking = { id: string; name: string; email: string; phone: string; viewing_date: string; viewing_slot: string; notes: string | null; lead_status: string; created_at: string; privacy_consent_at: string | null };

function formattedDate(value: string) {
  return new Intl.DateTimeFormat("en-AU", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function AdminPortal() {
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [authState, setAuthState] = useState<"loading" | "anonymous" | "authenticated">("loading");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/bookings", { cache: "no-store" });
      if (response.status === 401) { setBookings(null); setAuthState("anonymous"); return; }
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "We could not load booking leads.");
      setBookings(payload.bookings);
      setAuthState("authenticated");
    } catch (caught) {
      setAuthState("anonymous");
      setError(caught instanceof Error ? caught.message : "We could not load booking leads.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadBookings(); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadBookings]);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "We could not sign you in.");
      setPassword("");
      await loadBookings();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We could not sign you in.");
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    await fetch("/api/admin/session", { method: "DELETE" });
    setBookings(null);
    setAuthState("anonymous");
    setEmail("");
    setError("");
  }

  const authenticated = authState === "authenticated";

  return <main className="admin-shell"><header className="admin-header"><Link href="/" className="wordmark">APEX <em>LIVING</em></Link>{authenticated && <button className="admin-logout" onClick={() => void signOut()}><LogOut size={15} /> Sign out</button>}</header><div className="admin-content">{!authenticated ? <form className="admin-login" onSubmit={signIn}><span className="admin-icon"><LockKeyhole size={23} /></span><p className="eyebrow">Secure access</p><h1>Lead portal</h1><p>For authorised Apex Living representatives only.</p><label>Work email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /></label>{error && <p className="form-error">{error}</p>}<button className="button button-gold" type="submit" disabled={loading}>{loading ? <LoaderCircle className="spin" size={16} /> : <>Sign in <ArrowRight size={16} /></>}</button><Link className="admin-back" href="/"><ArrowLeft size={15} /> Back to The Aster House</Link></form> : <section className="lead-dashboard"><div className="dashboard-heading"><div><p className="eyebrow">Protected customer data</p><h1>Viewing requests</h1><p>Contact details are visible only to approved administrators.</p></div><span className="lead-count"><ShieldCheck size={18} /> {bookings?.length ?? 0} {(bookings?.length ?? 0) === 1 ? "request" : "requests"}</span></div>{error && <p className="form-error">{error}</p>}{loading ? <div className="admin-loading"><LoaderCircle className="spin" /> Loading requests</div> : (bookings?.length ?? 0) === 0 ? <div className="empty-leads">No viewing requests yet.</div> : <div className="lead-list">{bookings?.map((booking) => <article className="lead-card" key={booking.id}><div className="lead-person"><span>{booking.name.slice(0, 1).toUpperCase()}</span><div><h2>{booking.name}</h2><p>Requested {formattedDate(booking.created_at)}</p></div></div><div className="lead-appointment"><p className="eyebrow">Preferred viewing</p><b>{booking.viewing_date}</b><span>{booking.viewing_slot}</span></div><div className="lead-contact"><a href={`mailto:${booking.email}`}><Mail size={15} /> {booking.email}</a><a href={`tel:${booking.phone.replace(/\s/g, "")}`}><Phone size={15} /> {booking.phone}</a></div>{booking.notes && <p className="lead-notes">“{booking.notes}”</p>}<small>{booking.privacy_consent_at ? "Privacy consent recorded" : "Legacy record - consent timestamp unavailable"}</small></article>)}</div>}</section>}</div></main>;
}
