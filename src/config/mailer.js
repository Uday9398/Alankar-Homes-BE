import nodemailer from "nodemailer";
import dotenv from "dotenv"
dotenv.config()

const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;

export const isMailConfigured = Boolean(GMAIL_USER && GMAIL_APP_PASSWORD);

if (!isMailConfigured) {
    console.warn("Gmail is not configured, email notifications are turned off until GMAIL_* values are set in .env");
}

// Gmail needs an App Password here, not the normal account password
const transporter = isMailConfigured
    ? nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: GMAIL_USER,
            // Google shows app passwords in groups of four; spaces are not part of it
            pass: GMAIL_APP_PASSWORD.replace(/\s/g, "")
        }
    })
    : null;

// Gmail only lets us send as the signed-in account, so only the display name can change
export const MAIL_FROM = `"Alankar Homes" <${GMAIL_USER}>`;

// Where shop notifications (new customers, orders, custom requests) are sent
export const ADMIN_EMAIL = process.env.ADMIN_NOTIFY_EMAIL || GMAIL_USER;

// Used to build links back to the website inside emails
export const FRONTEND_URL = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");

export default transporter;
