import { describe, expect, it } from "vitest";
import { redactContactDetails } from "@/lib/privacy";

describe("chat privacy redaction", () => {
  it("removes email addresses and phone numbers before an AI request", () => {
    expect(redactContactDetails("Please call +61 412 345 678 or email alex@example.com")).toBe("Please call [phone removed] or email [email removed]");
  });
});
