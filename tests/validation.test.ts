import { describe, expect, it } from "vitest";
import { bookingSchema, chatRequestSchema } from "@/lib/validation";

describe("booking validation", () => {
  const validBooking = { name: "Alex Smith", email: "alex@example.com", phone: "+61 412 345 678", viewingDate: "Thursday, 21 August", viewingSlot: "10:00 am", notes: "", privacyConsent: true };
  it("accepts a complete booking", () => expect(bookingSchema.safeParse(validBooking).success).toBe(true));
  it("rejects a malformed email", () => expect(bookingSchema.safeParse({ ...validBooking, email: "not-an-email" }).success).toBe(false));
  it("requires a viewing time", () => expect(bookingSchema.safeParse({ ...validBooking, viewingSlot: "" }).success).toBe(false));
  it("requires privacy consent", () => expect(bookingSchema.safeParse({ ...validBooking, privacyConsent: false }).success).toBe(false));
  it("rejects a completed honeypot field", () => expect(bookingSchema.safeParse({ ...validBooking, website: "https://bot.example" }).success).toBe(false));
});

describe("chat request validation", () => {
  it("accepts ordered conversation messages", () => expect(chatRequestSchema.safeParse({ messages: [{ role: "user", content: "Is this suitable for investment?" }] }).success).toBe(true));
  it("rejects empty messages", () => expect(chatRequestSchema.safeParse({ messages: [] }).success).toBe(false));
});
