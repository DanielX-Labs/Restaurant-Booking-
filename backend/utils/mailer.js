import { getBrevoTransporter } from "../config/brevo.js";

export const mailConfigured = () => Boolean(
  process.env.BREVO_EMAIL_TRANSPORT?.trim().toLowerCase() === "smtp" &&
  process.env.BREVO_SMTP_HOST?.trim() && Number(process.env.BREVO_SMTP_PORT) &&
  process.env.BREVO_SMTP_LOGIN?.trim() && process.env.BREVO_SMTP_KEY?.trim() &&
  process.env.BREVO_SENDER_EMAIL?.trim()
);

export const sendMail = async ({ to, subject, text }) => {
  if (!mailConfigured()) return false;
  const message = {
    from: { name: process.env.BREVO_SENDER_NAME?.trim() || "Restaurant", address: process.env.BREVO_SENDER_EMAIL.trim() },
    replyTo: process.env.SUPPORT_EMAIL?.trim() || process.env.BREVO_SENDER_EMAIL.trim(),
    to, subject, text,
  };
  const configuredPort = Number(process.env.BREVO_SMTP_PORT);
  const ports = [...new Set([configuredPort, 2525, 465])];
  let lastError;
  for (const port of ports) {
    try {
      const info = await getBrevoTransporter(port).sendMail(message);
      console.info(`[EMAIL] SENT to=${to} subject="${subject}" port=${port} id=${info.messageId}`);
      return true;
    } catch (error) {
      lastError = error;
      console.error(`[EMAIL] FAILED to=${to} port=${port} code=${error.code || "UNKNOWN"} message="${error.message}"`);
      if (!["ETIMEDOUT", "ECONNECTION", "ESOCKET", "ECONNREFUSED"].includes(error.code)) break;
    }
  }
  throw lastError;
};

export const queueMail = (message) => {
  if (!mailConfigured()) {
    console.warn(`[EMAIL] SKIPPED to=${message.to} reason="Brevo is not fully configured"`);
    return false;
  }
  setImmediate(() => sendMail(message).catch(() => undefined));
  return true;
};
