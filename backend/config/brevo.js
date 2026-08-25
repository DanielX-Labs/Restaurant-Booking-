import nodemailer from "nodemailer";

const brevoTransporters = new Map();

export const getBrevoTransporter = (portOverride) => {
  const transport = process.env.BREVO_EMAIL_TRANSPORT?.trim().toLowerCase();
  const host = process.env.BREVO_SMTP_HOST?.trim();
  const configuredPort = Number(process.env.BREVO_SMTP_PORT);
  const port = portOverride ?? configuredPort;
  const user = process.env.BREVO_SMTP_LOGIN?.trim();
  const pass = process.env.BREVO_SMTP_KEY?.trim();
  if (transport !== "smtp") throw new Error("BREVO_EMAIL_TRANSPORT must be smtp");
  const missing = [["BREVO_SMTP_HOST", host], ["BREVO_SMTP_PORT", configuredPort], ["BREVO_SMTP_LOGIN", user], ["BREVO_SMTP_KEY", pass]]
    .filter(([, value]) => !value).map(([name]) => name);
  if (missing.length) throw new Error(`Missing Brevo SMTP variables: ${missing.join(", ")}`);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("BREVO_SMTP_PORT must be a valid port number");
  if (!brevoTransporters.has(port)) {
    brevoTransporters.set(port, nodemailer.createTransport({
      host, port, secure: port === 465, requireTLS: port !== 465,
      auth: { user, pass }, connectionTimeout: 10_000,
      greetingTimeout: 10_000, socketTimeout: 20_000,
    }));
  }
  return brevoTransporters.get(port);
};
