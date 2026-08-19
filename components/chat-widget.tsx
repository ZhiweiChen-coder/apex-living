"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Bot, LoaderCircle, MessageCircle, RotateCcw, X } from "lucide-react";
import { Fragment, FormEvent, type ReactNode, useRef, useState } from "react";

type Message = { role: "user" | "assistant"; content: string; source?: "llm" | "fallback" };

const opening: Message = {
  role: "assistant",
  content: "Good evening. I’m the Aster House concierge. Ask me about the residences, local schooling, amenity spaces or private viewings.",
};

function renderInlineMarkdown(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={`${part}-${index}`}>{part.slice(1, -1)}</em>;
    }
    return <Fragment key={`${part}-${index}`}>{part}</Fragment>;
  });
}

function MessageContent({ content }: { content: string }) {
  const blocks: ReactNode[] = [];
  const listItems: { ordered: boolean; text: string }[] = [];

  function flushList() {
    if (listItems.length === 0) return;
    const List = listItems[0].ordered ? "ol" : "ul";
    blocks.push(
      <List key={`list-${blocks.length}`}>
        {listItems.map((item, index) => <li key={`${item.text}-${index}`}>{renderInlineMarkdown(item.text)}</li>)}
      </List>,
    );
    listItems.length = 0;
  }

  content.split(/\r?\n/).forEach((line, index) => {
    const listMatch = line.match(/^\s*(?:([-*])|(\d+\.))\s+(.+)$/);
    if (listMatch) {
      listItems.push({ ordered: Boolean(listMatch[2]), text: listMatch[3] });
      return;
    }

    flushList();
    if (!line.trim()) return;

    const headingMatch = line.match(/^\s*#{1,3}\s+(.+)$/);
    if (headingMatch) {
      blocks.push(<strong className="message-heading" key={`heading-${index}`}>{renderInlineMarkdown(headingMatch[1])}</strong>);
      return;
    }
    blocks.push(<p key={`paragraph-${index}`}>{renderInlineMarkdown(line)}</p>);
  });

  flushList();
  return <div className="message-content">{blocks}</div>;
}

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
                  <MessageContent content={message.content} />
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
