"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Bot, LoaderCircle, MessageCircle, RotateCcw, X } from "lucide-react";
import { FormEvent, useRef, useState } from "react";

type Message = { role: "user" | "assistant"; content: string; source?: "llm" | "fallback" };

const opening: Message = {
  role: "assistant",
  content: "Good evening. I’m the Aster House concierge. Ask me about the residences, local schooling, amenity spaces or private viewings.",
};

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([opening]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastQuestion = useRef("");

  async function send(question: string) {
    const value = question.trim();
    if (!value || isSending) return;
    lastQuestion.current = value;
    setDraft("");
    setError(null);
    setIsSending(true);
    const nextMessages = [...messages, { role: "user" as const, content: value }];
    setMessages(nextMessages);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages.map(({ role, content }) => ({ role, content })) }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "The concierge is temporarily unavailable.");
      setMessages((current) => [...current, { role: "assistant", content: payload.message, source: payload.source }]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The concierge is temporarily unavailable.");
    } finally {
      setIsSending(false);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void send(draft);
  }

  return (
    <aside className="concierge" aria-label="Aster House AI concierge">
      <AnimatePresence>
        {isOpen && (
          <motion.section
            className="chat-panel"
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.22 }}
          >
            <header className="chat-header">
              <span className="bot-mark"><Bot size={17} /></span>
              <div><p>The Aster House</p><span>AI property concierge</span></div>
              <button className="icon-button" onClick={() => setIsOpen(false)} aria-label="Close concierge"><X size={19} /></button>
            </header>
            <div className="chat-messages" aria-live="polite">
              {messages.map((message, index) => (
                <div className={`message ${message.role}`} key={`${message.role}-${index}`}>
                  <p>{message.content}</p>
                  {message.source === "fallback" && <small>Listing-guided response</small>}
                </div>
              ))}
              {isSending && <div className="message assistant typing"><LoaderCircle size={16} className="spin" /> Considering your question…</div>}
              {error && <div className="chat-error"><span>{error}</span><button onClick={() => void send(lastQuestion.current)}><RotateCcw size={14} /> Retry</button></div>}
            </div>
            <form className="chat-form" onSubmit={onSubmit}>
              <input aria-label="Ask the property concierge" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Ask a question…" maxLength={1000} />
              <button type="submit" aria-label="Send question" disabled={!draft.trim() || isSending}><ArrowUp size={17} /></button>
            </form>
            <p className="chat-privacy">Please do not share contact, financial, or other sensitive personal details here.</p>
          </motion.section>
        )}
      </AnimatePresence>
      <button className="concierge-trigger" onClick={() => setIsOpen((value) => !value)} aria-expanded={isOpen}>
        <span><MessageCircle size={20} /></span><b>Ask the concierge</b>
      </button>
    </aside>
  );
}
