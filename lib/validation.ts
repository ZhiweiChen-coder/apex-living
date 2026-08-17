import { z } from "zod";

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(1_000),
});

export const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(12),
});

export const bookingSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name.").max(80),
  email: z.string().trim().email("Please enter a valid email address."),
  phone: z.string().trim().min(8, "Please enter a valid phone number.").max(30),
  viewingDate: z.string().trim().min(1, "Please select a viewing date."),
  viewingSlot: z.string().trim().min(1, "Please select a preferred time."),
  notes: z.string().trim().max(600).optional().default(""),
});

export type BookingInput = z.infer<typeof bookingSchema>;
