import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const scrypt = promisify(scryptCallback);

export const ADMIN_SESSION_COOKIE = "lumivale_admin";
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 14;

type AdminSessionPayload = {
  adminId: string;
  email: string;
  exp: number;
  type: "admin-session";
};

export type AdminSession = AdminSessionPayload;

function getAdminSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not configured.");
  }

  return secret;
}

function base64UrlEncode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signValue(value: string) {
  return createHmac("sha256", getAdminSessionSecret()).update(value).digest("base64url");
}

export async function hashAdminPassword(password: string) {
  const salt = randomBytes(16).toString("base64url");
  const key = (await scrypt(password, salt, 64)) as Buffer;

  return `scrypt:${salt}:${key.toString("base64url")}`;
}

export async function verifyAdminPassword(password: string, storedHash: string) {
  const [algorithm, salt, expectedKey] = storedHash.split(":");

  if (algorithm !== "scrypt" || !salt || !expectedKey) {
    return false;
  }

  const actualKey = (await scrypt(password, salt, 64)) as Buffer;
  const expectedBuffer = Buffer.from(expectedKey, "base64url");

  return (
    actualKey.length === expectedBuffer.length &&
    timingSafeEqual(actualKey, expectedBuffer)
  );
}

export function createAdminSessionToken({
  adminId,
  email,
}: {
  adminId: string;
  email: string;
}) {
  const payload: AdminSessionPayload = {
    adminId,
    email: email.trim().toLowerCase(),
    exp: Math.floor(Date.now() / 1000) + ADMIN_SESSION_MAX_AGE_SECONDS,
    type: "admin-session",
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = signValue(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function readAdminSessionToken(token: string) {
  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signValue(encodedPayload);
  const matchesSignature =
    expectedSignature.length === signature.length &&
    timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature));

  if (!matchesSignature) {
    return null;
  }

  const payload = JSON.parse(base64UrlDecode(encodedPayload)) as AdminSessionPayload;

  if (payload.type !== "admin-session" || payload.exp <= Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload;
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    return readAdminSessionToken(token);
  } catch {
    return null;
  }
}

export async function hasAdminAccess() {
  return Boolean(await getAdminSession());
}

export async function requireAdminAccess() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return session;
}
