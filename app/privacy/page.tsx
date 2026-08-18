import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy | Apex Living",
  description: "How the Apex Living demonstration site handles viewing requests and concierge conversations.",
};

export default function PrivacyPage() {
  return (
    <main className="privacy-page">
      <header className="privacy-header"><Link href="/" className="wordmark">APEX <em>LIVING</em></Link><Link href="/">Return to The Aster House</Link></header>
      <article className="privacy-content">
        <p className="eyebrow">Privacy notice</p>
        <h1>Your details, handled with care.</h1>
        <p>This fictional MVP collects only the details needed to arrange a private viewing: your name, email, mobile number, preferred time and optional notes.</p>
        <section><h2>How we use and store information</h2><p>Viewing requests are stored in Supabase and are visible only to approved Apex Living administrators. They are used solely to arrange or follow up on the requested viewing. The MVP retention period is 12 months after the last interaction, unless a longer period is legally required.</p></section>
        <section><h2>AI concierge</h2><p>The concierge uses OpenAI to answer listing questions. Booking form details are never included in concierge requests. Please do not enter contact, financial or other sensitive details in the chat; obvious email addresses and phone numbers are redacted before a message is sent to the AI service.</p></section>
        <section><h2>Cookies</h2><p>We set one essential preference cookie to remember your cookie choice for one year. This demonstration does not use advertising or analytics cookies.</p></section>
        <section><h2>Your choices</h2><p>You may ask to access, correct or delete a viewing request. Before deploying this fictional demonstration for real customers, replace <em>privacy@apexliving.example</em> with the business&apos;s monitored privacy contact and publish the final retention and legal basis details.</p></section>
      </article>
    </main>
  );
}
