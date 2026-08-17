import { describe, expect, it } from "vitest";
import { buildFallbackAnswer } from "@/lib/fallback";
import { project } from "@/lib/project";

describe("listing-guided AI fallback", () => {
  it("introduces the concierge for greetings and identity questions", () => {
    expect(buildFallbackAnswer("hi")).toContain("digital property concierge");
    expect(buildFallbackAnswer("Who are you?")).toContain("digital property concierge");
  });
  it("uses the local school facts for school questions", () => {
    const answer = buildFallbackAnswer("Which public schools are nearby?");
    expect(answer).toContain(project.schools[0]);
  });
  it("does not promise an investment return", () => {
    const answer = buildFallbackAnswer("What investment return can I expect?");
    expect(answer).toContain("not financial advice");
    expect(answer).not.toMatch(/\d+%/);
  });
});
