import { describe, expect, test } from "vitest";
import { formatResultCount } from "@/lib/result-count";

describe("result count formatting", () => {
  test.each([
    ["5M+", "0M+", "3M+"],
    ["30K+", "0K+", "15K+"],
    ["2,000+", "0+", "1,000+"],
    ["98.6%", "0.0%", "49.3%"],
    ["$12,500", "$0", "$6,250"],
    ["100–140", "0–0", "50–70"],
    ["—", "—", "—"],
    ["Coming soon", "Coming soon", "Coming soon"],
  ])("preserves the format of %s", (value, start, midpoint) => {
    expect(formatResultCount(value, 0)).toBe(start);
    expect(formatResultCount(value, .5)).toBe(midpoint);
    expect(formatResultCount(value, 1)).toBe(value);
  });
});
