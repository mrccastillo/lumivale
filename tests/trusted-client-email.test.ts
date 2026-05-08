import { describe, expect, test } from "vitest";

import { buildTrustedClientMagicLinkEmail } from "@/lib/trusted-client-email";

describe("trusted client email", () => {
  test("builds a branded magic link email with html and text fallbacks", () => {
    const template = buildTrustedClientMagicLinkEmail({
      magicLink: "http://localhost:3000/client-access/verify?token=test-token",
    });

    expect(template.html).toContain("Lumivale");
    expect(template.html).toContain("Open private pricing");
    expect(template.html).toContain(
      "http://localhost:3000/client-access/verify?token=test-token",
    );
    expect(template.text).toContain("Your Lumivale private pricing link is ready.");
    expect(template.text).toContain(
      "Open private pricing: http://localhost:3000/client-access/verify?token=test-token",
    );
  });

  test("escapes the magic link in html output", () => {
    const template = buildTrustedClientMagicLinkEmail({
      magicLink: 'http://localhost:3000/?next="<script>',
    });

    expect(template.html).toContain("&quot;&lt;script&gt;");
    expect(template.html).not.toContain('next="<script>');
  });
});
