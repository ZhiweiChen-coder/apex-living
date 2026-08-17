"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, LoaderCircle } from "lucide-react";
import { FormEvent, type ChangeEvent, type ReactNode, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { project } from "@/lib/project";

type BookingState = "idle" | "sending" | "success";
type FormValues = { name: string; email: string; phone: string; viewingDate: string; viewingSlot: string; notes: string };
const initialValues: FormValues = { name: "", email: "", phone: "", viewingDate: "", viewingSlot: "", notes: "" };

export function BookingDialog({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<BookingState>("idle");
  const [values, setValues] = useState<FormValues>(initialValues);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  function close(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen && status === "success") {
      setTimeout(() => { setStatus("idle"); setValues(initialValues); setError(""); }, 250);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setFieldErrors({});
    setStatus("sending");
    try {
      const response = await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      const payload = await response.json();
      if (!response.ok) {
        setFieldErrors(payload.fields || {});
        throw new Error(payload.error || "We could not save your booking.");
      }
      setStatus("success");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We could not save your booking.");
      setStatus("idle");
    }
  }

  const update = (field: keyof FormValues) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setValues((current) => ({ ...current, [field]: event.target.value }));

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent aria-describedby="booking-description">
        <AnimatePresence mode="wait">
          {status === "success" ? (
            <motion.div className="booking-success" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
              <span className="success-mark"><Check size={29} /></span>
              <p className="eyebrow">Request received</p>
              <h2>Your private viewing is in hand.</h2>
              <p>Our Potts Point team will confirm your preferred time shortly.</p>
              <button className="button button-dark" onClick={() => close(false)}>Return to the residence</button>
            </motion.div>
          ) : (
            <motion.form className="booking-form" onSubmit={submit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="eyebrow">Private appointment</p>
              <h2>Meet The Aster House.</h2>
              <p id="booking-description">Select a time to visit our Potts Point presentation suite.</p>
              <div className="form-grid">
                <label>Full name<input value={values.name} onChange={update("name")} autoComplete="name" />{fieldErrors.name && <small>{fieldErrors.name[0]}</small>}</label>
                <label>Email address<input type="email" value={values.email} onChange={update("email")} autoComplete="email" />{fieldErrors.email && <small>{fieldErrors.email[0]}</small>}</label>
                <label>Mobile number<input type="tel" value={values.phone} onChange={update("phone")} autoComplete="tel" />{fieldErrors.phone && <small>{fieldErrors.phone[0]}</small>}</label>
                <label>Viewing date<select value={values.viewingDate} onChange={update("viewingDate")}><option value="">Select a date</option>{project.viewingDates.map((date) => <option key={date}>{date}</option>)}</select>{fieldErrors.viewingDate && <small>{fieldErrors.viewingDate[0]}</small>}</label>
                <label>Preferred time<select value={values.viewingSlot} onChange={update("viewingSlot")}><option value="">Select a time</option>{project.viewingSlots.map((slot) => <option key={slot}>{slot}</option>)}</select>{fieldErrors.viewingSlot && <small>{fieldErrors.viewingSlot[0]}</small>}</label>
                <label className="full-width">Anything we should prepare?<textarea rows={3} value={values.notes} onChange={update("notes")} placeholder="Bedrooms, accessibility requirements, or questions…" /></label>
              </div>
              {error && <p className="form-error">{error}</p>}
              <button className="button button-dark submit-button" type="submit" disabled={status === "sending"}>{status === "sending" ? <><LoaderCircle className="spin" size={17} /> Reserving your time</> : <>Request private viewing <ArrowRight size={17} /></>}</button>
            </motion.form>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
