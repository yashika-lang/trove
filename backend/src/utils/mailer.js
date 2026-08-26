import nodemailer from "nodemailer";
import env from "../config/env.js";

let transporter = null;

// Lazily created — if EMAIL_* env vars aren't set, this throws only when an
// email is actually attempted, not at server boot.
const getTransporter = () => {
  if (transporter) return transporter;

  if (!env.EMAIL_HOST || !env.EMAIL_USER || !env.EMAIL_PASS) {
    throw new Error(
      "Email is not configured — set EMAIL_HOST, EMAIL_PORT, EMAIL_USER and EMAIL_PASS in backend/.env."
    );
  }

  transporter = nodemailer.createTransport({
    host: env.EMAIL_HOST,
    port: Number(env.EMAIL_PORT) || 587,
    secure: Number(env.EMAIL_PORT) === 465,
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASS,
    },
  });

  return transporter;
};

const sendMail = async ({ to, subject, html, attachments }) => {
  const mailer = getTransporter();

  return await mailer.sendMail({
    from: env.EMAIL_USER,
    to,
    subject,
    html,
    attachments,
  });
};

export { sendMail };
