import { describe, expect, test, vi } from "vitest";

import {
  createAdminSessionToken,
  hashAdminPassword,
  readAdminSessionToken,
  verifyAdminPassword,
} from "@/lib/admin-auth";

describe("admin auth helpers", () => {
  test("hashes and verifies admin passwords without storing the raw password", async () => {
    const hash = await hashAdminPassword("correct horse battery staple");

    expect(hash).not.toContain("correct horse battery staple");
    await expect(
      verifyAdminPassword("correct horse battery staple", hash),
    ).resolves.toBe(true);
    await expect(verifyAdminPassword("wrong password", hash)).resolves.toBe(false);
  });

  test("creates signed admin session tokens that expire", () => {
    vi.stubEnv("ADMIN_SESSION_SECRET", "test-admin-secret");
    vi.setSystemTime(new Date("2026-05-03T08:00:00.000Z"));

    const token = createAdminSessionToken({
      adminId: "admin-1",
      email: "admin@example.com",
    });

    expect(readAdminSessionToken(token)).toMatchObject({
      adminId: "admin-1",
      email: "admin@example.com",
      type: "admin-session",
    });

    vi.setSystemTime(new Date("2026-05-18T08:00:01.000Z"));

    expect(readAdminSessionToken(token)).toBeNull();
  });
});
