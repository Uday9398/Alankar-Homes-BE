import transporter, { ADMIN_EMAIL, FRONTEND_URL, MAIL_FROM, isMailConfigured } from "../config/mailer.js";

// Customer-typed text goes into HTML emails, so it must never be able to inject markup
const escapeHtml = (value) => String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const formatCurrency = (amount) => new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: Number.isInteger(Number(amount)) ? 0 : 2
}).format(Number(amount));

const formatDate = (date) => new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(date));

const COLORS = { bg: "#f6f1e7", card: "#ffffff", ink: "#1c2b28", muted: "#5f7470", gold: "#a8823f", line: "#e6dccb" };

// Shared look for every email: a simple card that renders well in Gmail and on phones
const layout = ({ heading, intro, body = "", button }) => `
<div style="background:${COLORS.bg};padding:24px 12px;font-family:Arial,Helvetica,sans-serif;color:${COLORS.ink}">
  <div style="max-width:560px;margin:0 auto;background:${COLORS.card};border-radius:12px;overflow:hidden;border:1px solid ${COLORS.line}">
    <div style="background:#00110f;padding:18px 24px">
      <span style="font-family:Georgia,serif;font-size:20px;color:#ecc588;letter-spacing:1px">Alankar Homes</span>
    </div>
    <div style="padding:24px">
      <h1 style="font-family:Georgia,serif;font-size:22px;font-weight:normal;margin:0 0 12px">${heading}</h1>
      ${intro ? `<p style="font-size:14px;line-height:1.6;color:${COLORS.muted};margin:0 0 16px">${intro}</p>` : ""}
      ${body}
      ${button ? `<p style="margin:24px 0 0"><a href="${button.url}" style="display:inline-block;background:${COLORS.gold};color:#ffffff;text-decoration:none;font-size:14px;font-weight:bold;padding:12px 22px;border-radius:8px">${button.label}</a></p>` : ""}
    </div>
    <div style="padding:14px 24px;border-top:1px solid ${COLORS.line};font-size:11px;color:${COLORS.muted}">
      Handmade gifts and keepsakes, crafted with love one piece at a time.
    </div>
  </div>
</div>`;

// Label / value rows, e.g. customer details
const detailsTable = (rows) => `
<table style="width:100%;border-collapse:collapse;font-size:14px;margin:0 0 16px">
  ${rows.filter(([, value]) => value !== null && value !== undefined && value !== "").map(([label, value]) => `
  <tr>
    <td style="padding:6px 12px 6px 0;color:${COLORS.muted};white-space:nowrap;vertical-align:top">${escapeHtml(label)}</td>
    <td style="padding:6px 0;vertical-align:top">${escapeHtml(value)}</td>
  </tr>`).join("")}
</table>`;

const itemsTable = (items, total) => `
<table style="width:100%;border-collapse:collapse;font-size:14px;margin:0 0 16px">
  ${items.map((item) => `
  <tr style="border-bottom:1px solid ${COLORS.line}">
    <td style="padding:8px 0">${escapeHtml(item.productName)} <span style="color:${COLORS.muted}">× ${item.quantity}</span></td>
    <td style="padding:8px 0;text-align:right;white-space:nowrap">${formatCurrency(item.price * item.quantity)}</td>
  </tr>`).join("")}
  <tr>
    <td style="padding:10px 0;font-weight:bold">Total (cash on delivery)</td>
    <td style="padding:10px 0;text-align:right;font-weight:bold;color:${COLORS.gold}">${formatCurrency(total)}</td>
  </tr>
</table>`;

const addressOf = (r) => `${r.shippingAddress}, ${r.shippingCity}, ${r.shippingState} – ${r.shippingPincode}`;

// Sends in the background: a mail problem is logged but never fails the customer's action
const send = (to, subject, html) => {
    if (!isMailConfigured || !to) return;
    transporter.sendMail({ from: MAIL_FROM, to, subject, html })
        .catch((error) => console.error(`Email "${subject}" to ${to} failed:`, error.message));
};

const notifyNewUser = (user) => {
    send(ADMIN_EMAIL, `New customer: ${user.name}`, layout({
        heading: "A new customer joined",
        intro: "Someone just created an account on Alankar Homes.",
        body: detailsTable([["Name", user.name], ["Email", user.email], ["Phone", user.phone]]),
        button: { label: "View customers", url: `${FRONTEND_URL}/admin/users` }
    }));

    send(user.email, "Welcome to Alankar Homes", layout({
        heading: `Welcome, ${escapeHtml(user.name.split(" ")[0])}!`,
        intro: "Thank you for joining Alankar Homes. Every piece in our shop is handmade in small batches, and we can also make something just for you.",
        button: { label: "Start shopping", url: `${FRONTEND_URL}/products` }
    }));
};

const notifyNewOrder = (order) => {
    const items = order.items || [];
    const customerEmail = order.user?.email;

    send(ADMIN_EMAIL, `New order #${order.id} · ${formatCurrency(order.totalAmount)}`, layout({
        heading: `New order #${order.id}`,
        intro: `${escapeHtml(order.shippingName)} placed an order. Collect ${formatCurrency(order.totalAmount)} on delivery.`,
        body: itemsTable(items, order.totalAmount) + detailsTable([
            ["Name", order.shippingName],
            ["Phone", order.shippingPhone],
            ["Email", customerEmail],
            ["Deliver to", addressOf(order)],
            ["Note", order.notes]
        ]),
        button: { label: "Open orders", url: `${FRONTEND_URL}/admin/orders?status=pending` }
    }));

    send(customerEmail, `Your Alankar Homes order #${order.id} is placed`, layout({
        heading: "Thank you for your order!",
        intro: `We've received order #${order.id} and will confirm it shortly. You'll pay ${formatCurrency(order.totalAmount)} when it arrives.`,
        body: itemsTable(items, order.totalAmount) + detailsTable([["Delivering to", `${order.shippingName}, ${addressOf(order)}`]]),
        button: { label: "Track your order", url: `${FRONTEND_URL}/orders/${order.id}` }
    }));
};

const notifyNewCustomRequest = (request) => {
    const customerEmail = request.user?.email;
    const details = [
        ["Quantity", request.quantity],
        ["Budget", request.budget !== null ? formatCurrency(request.budget) : "Not given"],
        ["Needed by", request.neededBy ? formatDate(request.neededBy) : "No rush"]
    ];
    const description = `<p style="font-size:14px;line-height:1.6;white-space:pre-line;margin:0 0 16px;padding:12px;background:${COLORS.bg};border-radius:8px">${escapeHtml(request.description)}</p>`;
    const photos = request.images.length > 0
        ? `<p style="margin:0 0 16px">${request.images.map((url) =>
            `<a href="${escapeHtml(url)}"><img src="${escapeHtml(url)}" alt="Reference photo" width="96" height="96" style="width:96px;height:96px;object-fit:cover;border-radius:8px;margin:0 6px 6px 0;border:1px solid ${COLORS.line}"></a>`
        ).join("")}</p>`
        : "";

    send(ADMIN_EMAIL, `New custom request #${request.id}: ${request.title}`, layout({
        heading: `Custom request #${request.id}`,
        intro: `${escapeHtml(request.shippingName)} would like: <strong>${escapeHtml(request.title)}</strong>`,
        body: description + photos + detailsTable([
            ...details,
            ["Name", request.shippingName],
            ["Phone", request.shippingPhone],
            ["Email", customerEmail],
            ["Deliver to", addressOf(request)]
        ]),
        button: { label: "Review and send a price", url: `${FRONTEND_URL}/admin/custom-orders?status=pending` }
    }));

    send(customerEmail, `We've received your custom request #${request.id}`, layout({
        heading: "Thank you, we've got your idea!",
        intro: `We'll look at your request for <strong>${escapeHtml(request.title)}</strong> and share a price on the website soon. We may call you to talk through the details.`,
        body: detailsTable(details),
        button: { label: "View your request", url: `${FRONTEND_URL}/custom-orders/${request.id}` }
    }));
};

export { notifyNewUser, notifyNewOrder, notifyNewCustomRequest };
