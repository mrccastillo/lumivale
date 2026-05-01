import nodemailer from "nodemailer";

type SendTrustedClientMagicLinkArgs = {
  email: string;
  magicLink: string;
};

type SendTrustedClientMagicLinkResult =
  | { mode: "email" }
  | { mode: "preview"; previewUrl: string };

function getMailConfig() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM;

  if (!host || !port || !user || !pass || !from) {
    return null;
  }

  return {
    auth: { user, pass },
    from,
    host,
    port: Number(port),
    secure: process.env.SMTP_SECURE === "true",
  };
}

export async function sendTrustedClientMagicLink({
  email,
  magicLink,
}: SendTrustedClientMagicLinkArgs): Promise<SendTrustedClientMagicLinkResult> {
  const config = getMailConfig();

  if (!config) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SMTP configuration is required in production.");
    }

    return {
      mode: "preview",
      previewUrl: magicLink,
    };
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth,
  });

  await transporter.sendMail({
    from: config.from,
    to: email,
    subject: "Your Lumivale pricing access link",
    text: `Use this link to access pricing: ${magicLink}`,
  });

  return { mode: "email" };
}
