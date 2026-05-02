import { describe, expect, test } from "vitest";

import { metadata } from "@/app/layout";

describe("site metadata", () => {
  test("uses Lumivale growth positioning", () => {
    expect(metadata).toMatchObject({
      title: "Lumivale",
      description: "Simple, affordable growth services for early-stage teams.",
    });
  });
});
