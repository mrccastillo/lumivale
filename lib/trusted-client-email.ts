import nodemailer from "nodemailer";

type SendTrustedClientMagicLinkArgs = {
  email: string;
  magicLink: string;
};

type SendTrustedClientMagicLinkResult =
  | { mode: "email" }
  | { mode: "preview"; previewUrl: string };

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildTrustedClientMagicLinkEmail({
  magicLink,
}: {
  magicLink: string;
}) {
  const safeMagicLink = escapeHtml(magicLink);

  return {
    html: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Your Lumivale pricing access link</title>
  </head>
  <body style="margin:0;background:#f7f8fb;color:#031410;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f8fb;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;overflow:hidden;border:1px solid #e6e9f2;border-radius:18px;background:#ffffff;">
            <tr>
              <td style="padding:28px 28px 12px;">
                <div style="display:inline-flex;align-items:center;gap:10px;">
                  <span style="display:inline-block;width:32px;height:32px;border-radius:999px;background:#031410;color:#14c983;font-size:14px;font-weight:700;line-height:32px;text-align:center;">L</span>
                  <span style="font-size:18px;font-weight:700;color:#031410;">Lumivale</span>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 28px 4px;">
                <p style="margin:0 0 10px;color:#14c983;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">Private pricing access</p>
                <h1 style="margin:0;color:#031410;font-size:28px;line-height:1.18;font-weight:700;">Your secure pricing link is ready</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 28px 0;">
                <p style="margin:0;color:#68708a;font-size:15px;line-height:1.7;">Use the button below to open Lumivale private pricing. This link is time-limited for your account access.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:26px 28px 8px;">
                <a href="${safeMagicLink}" style="display:inline-block;border-radius:999px;background:#14c983;color:#010807;font-size:15px;font-weight:700;text-decoration:none;padding:14px 22px;">Open private pricing</a>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px 28px;">
                <p style="margin:0 0 8px;color:#68708a;font-size:13px;line-height:1.6;">If the button does not work, copy and paste this URL into your browser:</p>
                <p style="margin:0;word-break:break-all;color:#031410;font-size:13px;line-height:1.6;"><a href="${safeMagicLink}" style="color:#0f9f69;">${safeMagicLink}</a></p>
              </td>
            </tr>
            <tr>
              <td style="border-top:1px solid #e6e9f2;background:#fbfcff;padding:18px 28px;">
                <p style="margin:0;color:#68708a;font-size:12px;line-height:1.6;">You received this email because your address was approved for Lumivale private pricing access.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
    text: [
      "Your Lumivale private pricing link is ready.",
      "",
      `Open private pricing: ${magicLink}`,
      "",
      "This link is time-limited for your account access.",
      "You received this email because your address was approved for Lumivale private pricing access.",
    ].join("\n"),
  };
}

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
  const template = buildTrustedClientMagicLinkEmail({ magicLink });

  await transporter.sendMail({
    from: config.from,
    to: email,
    subject: "Your Lumivale pricing access link",
    html: template.html,
    text: template.text,
  });

  return { mode: "email" };
}

export { buildTrustedClientMagicLinkEmail };
