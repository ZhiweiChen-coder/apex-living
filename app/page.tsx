"use client";

import { motion } from "framer-motion";
import { ArrowDownRight, ArrowRight, ArrowUpRight, ChevronDown, MapPin, MoveUpRight, Sparkles } from "lucide-react";
import { BookingDialog } from "@/components/booking-dialog";
import { ChatWidget } from "@/components/chat-widget";
import { CookieConsent } from "@/components/cookie-consent";
import { project } from "@/lib/project";

const reveal = { hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0 } };

export default function Home() {
  return (
    <main>
      <section className="hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(16, 27, 24, .84) 0%, rgba(16, 27, 24, .35) 60%, rgba(16, 27, 24, .15)), url(${project.images.hero})` }}>
        <nav className="navigation"><a className="wordmark" href="#top">APEX <em>LIVING</em></a><div className="nav-right"><a href="#residences">Residences</a><a href="#amenities">The experience</a><BookingDialog><button className="nav-book">Enquire <ArrowUpRight /></button></BookingDialog></div></nav>
        <div className="hero-content" id="top">
          <motion.p className="eyebrow light" initial="hidden" animate="visible" variants={reveal} transition={{ duration: .7 }}>Apex Living Collection · Potts Point</motion.p>
          <motion.h1 initial="hidden" animate="visible" variants={reveal} transition={{ duration: .8, delay: .1 }}>The art of<br /><i>coming home.</i></motion.h1>
          <motion.div className="hero-bottom" initial="hidden" animate="visible" variants={reveal} transition={{ duration: .8, delay: .25 }}><p>{project.positioning}</p><BookingDialog><button className="button button-light">Arrange a private viewing <ArrowRight size={17} /></button></BookingDialog></motion.div>
        </div>
        <a className="scroll-cue" href="#residences"><ChevronDown size={18} /> Explore the collection</a>
      </section>

      <section className="intro section" id="residences">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: .2 }} variants={reveal}><p className="eyebrow">A private collection</p><h2>Designed around the view.<br /><i>Considered for life.</i></h2></motion.div>
        <motion.div className="intro-copy" initial="hidden" whileInView="visible" viewport={{ once: true, amount: .3 }} variants={reveal} transition={{ delay: .12 }}><p>Just eighteen residences are discreetly composed above Macleay Street: tactile stone, tailored timber and light that traces the harbour from first light to evening.</p><a className="text-link" href="#amenities">Discover the details <ArrowDownRight size={18} /></a></motion.div>
      </section>

      <section className="fact-strip">{project.facts.map(([number, label]) => <div key={label}><b>{number}</b><span>{label}</span></div>)}</section>

      <section className="image-story section"><div className="image-block image-large" style={{ backgroundImage: `url(${project.images.living})` }} /><motion.div className="story-copy" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal}><p className="eyebrow">An effortless address</p><h2>A softer kind<br />of <i>city living.</i></h2><p>Anchored in the village energy of Potts Point, every home brings a sense of retreat to the very centre of Sydney.</p><div className="address"><MapPin size={18} /><span>{project.address}</span></div></motion.div></section>

      <section className="amenities section" id="amenities"><div className="amenities-heading"><p className="eyebrow">Beyond the threshold</p><h2>Amenity with<br /><i>intention.</i></h2></div><div className="amenity-list">{project.amenities.map((amenity, index) => <motion.article key={amenity.title} initial="hidden" whileInView="visible" viewport={{ once: true, amount: .3 }} variants={reveal} transition={{ delay: index * .08 }}><span>0{index + 1}</span><div><h3>{amenity.title}</h3><p>{amenity.detail}</p></div><MoveUpRight size={19} /></motion.article>)}</div></section>

      <section className="quote-section"><div className="quote-image" style={{ backgroundImage: `url(${project.images.detail})` }} /><div><Sparkles size={20} /><blockquote>“A calm, sculptural retreat above the city’s most magnetic neighbourhood.”</blockquote><p>APEX LIVING DESIGN NOTES</p></div></section>

      <section className="visit section"><div><p className="eyebrow">Meet the residence</p><h2>Your invitation<br />to <i>linger.</i></h2><p>Visit the private presentation suite for a considered introduction to The Aster House.</p></div><BookingDialog><button className="button button-gold">Book a private viewing <ArrowRight size={17} /></button></BookingDialog></section>

      <footer><a className="wordmark" href="#top">APEX <em>LIVING</em></a><p>© 2026 Apex Living. Demonstration property concept only.</p><p>Made for a considered arrival.</p></footer>
      <ChatWidget />
      <CookieConsent />
    </main>
  );
}
