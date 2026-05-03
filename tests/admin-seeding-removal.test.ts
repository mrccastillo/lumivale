import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, test } from "vitest";

const root = process.cwd();

describe("admin seeding removal", () => {
  test("does not expose the legacy admin seed command or env keys", () => {
    const packageJson = JSON.parse(
      readFileSync(join(root, "package.json"), "utf8"),
    ) as {
      scripts?: Record<string, string>;
    };
    const envExample = readFileSync(join(root, ".env.example"), "utf8");

    expect(packageJson.scripts).not.toHaveProperty("seed:admin");
    expect(envExample).not.toContain("ADMIN_SEED_EMAIL");
    expect(envExample).not.toContain("ADMIN_SEED_PASSWORD");
  });
});
