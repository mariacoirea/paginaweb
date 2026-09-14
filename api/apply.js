const REQUIRED_FIELDS = ["name", "email", "organization", "role", "desired_shift", "team_size"];
const DEFAULT_APPLICATION_RECIPIENTS = ["hello@coirea.com", "mjose.fadaros@gmail.com"];

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function isValidEmail(email = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function parseRecipients(value = "") {
  return String(value)
    .split(/[,\n;]/)
    .map((email) => email.trim())
    .filter(Boolean);
}

function fieldRow(label, value) {
  return `
    <tr>
      <td style="padding:12px 14px;border-bottom:1px solid #e8dfd2;color:#6c705f;font-size:12px;text-transform:uppercase;letter-spacing:.08em;font-weight:700;">${escapeHtml(label)}</td>
      <td style="padding:12px 14px;border-bottom:1px solid #e8dfd2;color:#183b2c;font-size:15px;line-height:1.55;">${value}</td>
    </tr>
  `;
}

async function readJsonBody(request) {
  if (request.body && typeof request.body === "object") return request.body;
  if (typeof request.body === "string") return JSON.parse(request.body);

  const chunks = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  if (chunks.length === 0) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  let data = {};
  try {
    data = await readJsonBody(request);
  } catch {
    return response.status(400).json({ error: "Invalid form submission." });
  }

  if (data.website) {
    return response.status(200).json({ ok: true });
  }

  const missing = REQUIRED_FIELDS.filter((field) => !String(data[field] || "").trim());
  if (missing.length > 0) {
    return response.status(400).json({ error: "Please complete all required fields." });
  }

  if (!isValidEmail(data.email)) {
    return response.status(400).json({ error: "Please enter a valid email address." });
  }

  if (!Array.isArray(data.friction) || data.friction.length === 0) {
    return response.status(400).json({ error: "Please select at least one friction area." });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("Missing RESEND_API_KEY for COIREA application email automation.");
    return response.status(503).json({ error: "Email service is not configured yet." });
  }

  const configuredRecipients = parseRecipients(process.env.APPLICATION_TO_EMAIL);
  const recipients = configuredRecipients.length > 0 ? configuredRecipients : DEFAULT_APPLICATION_RECIPIENTS;
  const from = process.env.RESEND_FROM_EMAIL || "COIREA <onboarding@resend.dev>";
  const frictionList = data.friction.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const submittedAt = new Date().toISOString();

  const html = `
    <div style="margin:0;padding:32px;background:#f7f1e8;font-family:Inter,Arial,sans-serif;color:#183b2c;">
      <div style="max-width:680px;margin:0 auto;background:#fffaf2;border:1px solid #e8dfd2;border-radius:22px;overflow:hidden;">
        <div style="padding:28px 32px;background:#143b2a;color:#fffaf2;">
          <p style="margin:0 0 8px;color:#d5aa62;font-size:12px;text-transform:uppercase;letter-spacing:.12em;font-weight:700;">New COIREA application</p>
          <h1 style="margin:0;font-family:Georgia,serif;font-size:34px;font-weight:400;line-height:1.08;">${escapeHtml(data.organization)} wants to work with COIREA</h1>
        </div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
          ${fieldRow("Name", escapeHtml(data.name))}
          ${fieldRow("Email", `<a href="mailto:${escapeHtml(data.email)}" style="color:#143b2a;">${escapeHtml(data.email)}</a>`)}
          ${fieldRow("Organization", escapeHtml(data.organization))}
          ${fieldRow("Role", escapeHtml(data.role))}
          ${fieldRow("Team size", escapeHtml(data.team_size))}
          ${fieldRow("Friction areas", `<ul style="margin:0;padding-left:18px;">${frictionList}</ul>`)}
          ${fieldRow("What would shift", escapeHtml(data.desired_shift).replace(/\n/g, "<br />"))}
          ${fieldRow("Submitted at", escapeHtml(submittedAt))}
        </table>
        <div style="padding:22px 32px;color:#6c705f;font-size:13px;line-height:1.6;">
          This message was sent automatically from the COIREA website application form.
        </div>
      </div>
    </div>
  `;

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: recipients,
      reply_to: data.email,
      subject: `New COIREA application - ${data.organization}`,
      html,
    }),
  });

  const result = await resendResponse.json().catch(() => ({}));

  if (!resendResponse.ok) {
    const resendError =
      result.message ||
      result.error?.message ||
      result.error ||
      result.name ||
      "Email could not be sent.";
    console.error("Resend COIREA application email failed", {
      status: resendResponse.status,
      error: resendError,
      recipients,
      from,
    });
    return response.status(502).json({ error: resendError });
  }

  return response.status(200).json({ ok: true, id: result.id });
}
