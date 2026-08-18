import { afterEach, describe, expect, it } from "vitest";
import { POST as chat } from "@/app/api/chat/route";
import { POST as booking } from "@/app/api/bookings/route";

const environment = { openai: process.env.OPENAI_API_KEY, supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL, publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY };

afterEach(() => {
  process.env.OPENAI_API_KEY = environment.openai;
  process.env.NEXT_PUBLIC_SUPABASE_URL = environment.supabaseUrl;
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = environment.publishableKey;
});

describe("POST /api/chat", () => {
  it("returns a listing-guided fallback when OpenAI is unavailable", async () => {
    delete process.env.OPENAI_API_KEY;
    const response = await chat(new Request("http://localhost/api/chat", { method: "POST", body: JSON.stringify({ messages: [{ role: "user", content: "Which public schools are nearby?" }] }) }));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ source: "fallback" });
  });
  it("rejects an empty conversation", async () => {
    const response = await chat(new Request("http://localhost/api/chat", { method: "POST", body: JSON.stringify({ messages: [] }) }));
    expect(response.status).toBe(400);
  });
});

describe("POST /api/bookings", () => {
  it("rejects invalid request fields before persistence", async () => {
    const response = await booking(new Request("http://localhost/api/bookings", { method: "POST", body: JSON.stringify({ name: "A", email: "invalid" }) }));
    expect(response.status).toBe(400);
  });
  it("reports an unconfigured persistence service", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    const response = await booking(new Request("http://localhost/api/bookings", { method: "POST", body: JSON.stringify({ name: "Alex Smith", email: "alex@example.com", phone: "+61 412 345 678", viewingDate: "Thursday, 21 August", viewingSlot: "10:00 am", privacyConsent: true }) }));
    expect(response.status).toBe(500);
  });
});
