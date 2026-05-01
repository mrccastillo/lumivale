import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";

const TRUSTED_CLIENT_COOKIE = "trusted_client";
const MAGIC_LINK_MAX_AGE_SECONDS = 60 * 15;
const TRUSTED_CLIENT_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 14;

type TrustedClientTokenPayload = {
  email: string;
  exp: number;
  type: "magic-link" | "trusted-session";
};

function getTrustedClientSecret() {
  const secret = process.env.TRUSTED_CLIENT_MAGIC_LINK_SECRET;

  if (!secret) {
    throw new Error("TRUSTED_CLIENT_MAGIC_LINK_SECRET is not configured.");
  }

  return secret;
}

function base64UrlEncode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signValue(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function createSignedToken(payload: TrustedClientTokenPayload) {
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = signValue(encodedPayload, getTrustedClientSecret());

  return `${encodedPayload}.${signature}`;
}

function readSignedToken(token: string, expectedType: TrustedClientTokenPayload["type"]) {
  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signValue(encodedPayload, getTrustedClientSecret());
  const matchesSignature =
    signature.length === expectedSignature.length &&
    timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));

  if (!matchesSignature) {
    return null;
  }

  const payload = JSON.parse(
    base64UrlDecode(encodedPayload),
  ) as TrustedClientTokenPayload;

  if (payload.type !== expectedType || payload.exp <= Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload;
}

export function normalizeTrustedClientEmail(email: string) {
  return email.trim().toLowerCase();
}

export function getTrustedClientEmails() {
  const rawEmails = process.env.TRUSTED_CLIENT_EMAILS ?? "";

  return rawEmails
    .split(",")
    .map((email) => normalizeTrustedClientEmail(email))
    .filter(Boolean);
}

export function isTrustedClientEmail(email: string) {
  return getTrustedClientEmails().includes(normalizeTrustedClientEmail(email));
}

export function createMagicLinkToken(email: string) {
  return createSignedToken({
    email: normalizeTrustedClientEmail(email),
    exp: Math.floor(Date.now() / 1000) + MAGIC_LINK_MAX_AGE_SECONDS,
    type: "magic-link",
  });
}

export function readMagicLinkToken(token: string) {
  return readSignedToken(token, "magic-link");
}

export function createTrustedClientSessionToken(email: string) {
  return createSignedToken({
    email: normalizeTrustedClientEmail(email),
    exp: Math.floor(Date.now() / 1000) + TRUSTED_CLIENT_SESSION_MAX_AGE_SECONDS,
    type: "trusted-session",
  });
}

export function readTrustedClientSessionToken(token: string) {
  return readSignedToken(token, "trusted-session");
}

export async function hasTrustedClientAccess() {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(TRUSTED_CLIENT_COOKIE)?.value;

  if (!cookieValue) {
    return false;
  }

  try {
    return Boolean(readTrustedClientSessionToken(cookieValue));
  } catch {
    return false;
  }
}

export {
  MAGIC_LINK_MAX_AGE_SECONDS,
  TRUSTED_CLIENT_COOKIE,
  TRUSTED_CLIENT_SESSION_MAX_AGE_SECONDS,
};
