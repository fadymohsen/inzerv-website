// Local stand-in for the Inzerv backend, for testing the website without touching production.
// Run:  node scripts/mock-api.mjs      (listens on http://localhost:4000/api/v1)
// Point the site at it with .env.local:
//   API_URL=http://localhost:4000/api/v1
//   NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
// Services and delivery destinations are read from the live API (GET only) so the catalogue is real.
// Everything else (accounts, orders, one-time codes) lives in memory and disappears on restart.

import http from "node:http";
import { randomUUID, randomInt } from "node:crypto";

const PORT = Number(process.env.PORT ?? 4000);
const LIVE = "https://inzerv-app-production.up.railway.app/api/v1";
const ORIGINS = new Set(["http://localhost:3000", "http://localhost:3100", "http://localhost:3101", "http://127.0.0.1:3000"]);

const users = new Map(); // email -> user
const sessions = new Map(); // token -> userId
const otps = new Map(); // email -> { code, expires }
const resetTokens = new Map(); // token -> { email, expires }
const requests = [];
const payments = [];
let catalog = null;

async function liveGet(path) {
  const res = await fetch(`${LIVE}${path}`, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`${path} ${res.status}`);
  return res.json();
}

async function loadCatalog() {
  try {
    catalog = { services: await liveGet("/services"), destinations: await liveGet("/delivery/destinations") };
    console.log(`[mock-api] catalogue loaded: ${catalog.services.length} services, ${catalog.destinations.length} destinations`);
  } catch (e) {
    console.log("[mock-api] could not reach the live catalogue, using a tiny built-in one:", e.message);
    catalog = {
      services: [
        {
          id: "00000000-0000-4000-8000-000000000001",
          type: "birth_certificate",
          nameEn: "Birth Certificate",
          nameAr: "شهادة الميلاد",
          descriptionEn: "Official birth registration document.",
          descriptionAr: "وثيقة رسمية للمواليد.",
          servicePrice: "150.00",
          estimatedProcessingTime: "5-7 business days",
          fields: [
            { id: "f1", keyName: "holder_name", labelEn: "Full Name", labelAr: "الاسم", fieldType: "text", isRequired: true, showForAnotherPerson: false, options: null, sortOrder: 0 },
          ],
          requiredDocuments: [
            { id: "d1", keyName: "applicant_id_copy", labelEn: "National ID Copy", labelAr: "صورة البطاقة", isRequired: true, showForAnotherPerson: false, allowedTypes: ["image/jpeg", "image/png", "application/pdf"], maxSizeMb: 10, sortOrder: 0 },
          ],
        },
      ],
      destinations: [{ id: "00000000-0000-4000-8000-0000000000d1", zone: "inside_egypt", country: "Egypt", countryCode: "EG", deliveryFee: "50.00" }],
    };
  }
}

const send = (res, status, body, origin) => {
  const headers = { "Content-Type": "application/json" };
  if (origin && ORIGINS.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Headers"] = "authorization,content-type";
    headers["Access-Control-Allow-Methods"] = "GET,POST,PATCH,DELETE";
    headers["Vary"] = "Origin";
  }
  res.writeHead(status, headers);
  res.end(body === undefined ? "" : JSON.stringify(body));
};

const readBody = (req) =>
  new Promise((resolve) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
  });

const parseJson = (buf) => {
  try {
    return JSON.parse(buf.toString("utf8") || "{}");
  } catch {
    return null;
  }
};

const bad = (res, origin, messages) => send(res, 400, { statusCode: 400, message: messages, error: "Bad Request" }, origin);

function validate(body, allowed, rules) {
  const errs = [];
  for (const k of Object.keys(body)) if (!allowed.includes(k)) errs.push(`property ${k} should not exist`);
  for (const [k, test, msg] of rules) if (!test(body[k], body)) errs.push(msg ?? `${k} is invalid`);
  return errs;
}

const emailOk = (v) => typeof v === "string" && /^\S+@\S+\.\S+$/.test(v);
const str = (v) => typeof v === "string" && v.trim().length > 0;
const publicUser = (u) => ({ id: u.id, email: u.email, firstName: u.firstName, lastName: u.lastName, phone: u.phone, countryOfResidence: u.countryOfResidence ?? null, role: "user" });

function authUser(req) {
  const m = /^Bearer (.+)$/.exec(req.headers.authorization ?? "");
  const id = m && sessions.get(m[1]);
  return id ? [...users.values()].find((u) => u.id === id) : null;
}

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin;
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname.replace(/^\/api\/v1/, "") || "/";
  const method = req.method;

  if (method === "OPTIONS") return send(res, 204, undefined, origin);

  // ---- test helpers (mock only) ----
  if (path === "/__debug/otp") return send(res, 200, otps.get(url.searchParams.get("email")?.toLowerCase()) ?? null, origin);
  if (path === "/__debug/state") {
    return send(res, 200, { users: [...users.values()].map(publicUser), requests, payments }, origin);
  }

  const raw = method === "POST" || method === "PATCH" ? await readBody(req) : Buffer.alloc(0);
  const isMultipart = (req.headers["content-type"] ?? "").startsWith("multipart/form-data");
  const body = method === "POST" && !isMultipart ? parseJson(raw) : {};
  if (body === null) return bad(res, origin, ["Unexpected token in JSON"]);

  // ---- public catalogue ----
  if (method === "GET" && path === "/services") return send(res, 200, catalog.services, origin);
  if (method === "GET" && path === "/delivery/destinations") return send(res, 200, catalog.destinations, origin);

  // ---- auth ----
  if (method === "POST" && path === "/auth/register") {
    const errs = validate(
      body,
      ["firstName", "lastName", "email", "password", "phone", "countryCode", "countryOfResidence"],
      [
        ["firstName", str, "firstName should not be empty"],
        ["lastName", str, "lastName should not be empty"],
        ["email", emailOk, "email must be an email"],
        ["password", (v) => typeof v === "string" && /^(?=.*[A-Z])(?=.*\d).{8,128}$/.test(v), "Password must contain at least one uppercase letter and one number"],
        ["phone", str, "phone should not be empty"],
      ],
    );
    if (errs.length) return bad(res, origin, errs);
    const email = body.email.toLowerCase().trim();
    if (users.has(email)) return send(res, 409, { statusCode: 409, message: "An account with this email already exists.", error: "Conflict" }, origin);
    if ([...users.values()].some((u) => u.phone === body.phone)) {
      return send(res, 409, { statusCode: 409, message: "An account with this phone number already exists.", error: "Conflict" }, origin);
    }
    const user = { id: randomUUID(), email, password: body.password, firstName: body.firstName.trim(), lastName: body.lastName.trim(), phone: body.phone, countryOfResidence: body.countryOfResidence, createdAt: new Date().toISOString() };
    users.set(email, user);
    const token = `mock.${randomUUID()}`;
    sessions.set(token, user.id);
    console.log(`[mock-api] registered ${email}`);
    return send(res, 201, { user: publicUser(user), accessToken: token }, origin);
  }

  if (method === "POST" && path === "/auth/login") {
    const errs = validate(body, ["email", "password"], [["email", emailOk, "email must be an email"], ["password", str, "password should not be empty"]]);
    if (errs.length) return bad(res, origin, errs);
    const user = users.get(body.email.toLowerCase().trim());
    if (!user || user.password !== body.password) return send(res, 401, { statusCode: 401, message: "Invalid email or password.", error: "Unauthorized" }, origin);
    const token = `mock.${randomUUID()}`;
    sessions.set(token, user.id);
    return send(res, 200, { user: publicUser(user), accessToken: token }, origin);
  }

  if (method === "GET" && path === "/users/profile") {
    const user = authUser(req);
    if (!user) return send(res, 401, { statusCode: 401, message: "Unauthorized" }, origin);
    return send(res, 200, publicUser(user), origin);
  }

  if (method === "POST" && path === "/auth/forgot-password") {
    const errs = validate(body, ["email"], [["email", emailOk, "email must be an email"]]);
    if (errs.length) return bad(res, origin, errs);
    const email = body.email.toLowerCase().trim();
    if (users.has(email)) {
      const code = String(randomInt(100000, 1000000));
      otps.set(email, { code, expires: Date.now() + 10 * 60 * 1000 });
      console.log(`[mock-api] one-time code for ${email}: ${code}`);
    }
    return send(res, 200, undefined, origin);
  }

  if (method === "POST" && path === "/auth/verify-otp") {
    const errs = validate(body, ["email", "otp"], [["email", emailOk], ["otp", (v) => typeof v === "string" && v.length === 6, "otp must be 6 characters"]]);
    if (errs.length) return bad(res, origin, errs);
    const entry = otps.get(body.email.toLowerCase().trim());
    if (!entry || Date.now() > entry.expires) return bad(res, origin, "Invalid or expired OTP.");
    if (entry.code !== body.otp) return bad(res, origin, "Invalid OTP. Please try again.");
    otps.delete(body.email.toLowerCase().trim());
    const resetToken = randomUUID();
    resetTokens.set(resetToken, { email: body.email.toLowerCase().trim(), expires: Date.now() + 10 * 60 * 1000 });
    return send(res, 200, { resetToken }, origin);
  }

  if (method === "POST" && path === "/auth/reset-password") {
    const errs = validate(body, ["resetToken", "newPassword"], [
      ["resetToken", str],
      ["newPassword", (v) => typeof v === "string" && v.length >= 8 && /[A-Z]/.test(v) && /[0-9]/.test(v) && /[!@#$%^&*(),.?":{}|<>_-]/.test(v), "Password must contain at least one uppercase letter, one number and one special character."],
    ]);
    if (errs.length) return bad(res, origin, errs);
    const entry = resetTokens.get(body.resetToken);
    if (!entry || Date.now() > entry.expires) return bad(res, origin, "Invalid or expired reset token.");
    const user = users.get(entry.email);
    if (user.password === body.newPassword) return bad(res, origin, "New password must differ from your current password.");
    user.password = body.newPassword;
    resetTokens.delete(body.resetToken);
    return send(res, 200, undefined, origin);
  }

  // ---- orders (signed-in) ----
  const user = authUser(req);
  const needAuth = /^\/(requests|payments)/.test(path);
  if (needAuth && !user) return send(res, 401, { statusCode: 401, message: "Unauthorized" }, origin);

  if (method === "POST" && path === "/requests") {
    const errs = validate(
      body,
      ["serviceId", "requestFor", "fieldValues", "numberOfCopies", "deliveryDestinationId", "recipientName", "recipientPhone", "deliveryCity", "deliveryAddress", "deliveryGovernorate", "deliveryPostalCode"],
      [
        ["serviceId", str],
        ["requestFor", (v) => v === "myself" || v === "another_person", "requestFor must be a valid enum value"],
        ["fieldValues", Array.isArray],
        ["numberOfCopies", (v) => Number.isFinite(v) && v >= 1],
        ["deliveryDestinationId", str],
        ["recipientName", str],
        ["recipientPhone", str],
        ["deliveryCity", str],
        ["deliveryAddress", str],
      ],
    );
    if (errs.length) return bad(res, origin, errs);
    const service = catalog.services.find((s) => s.id === body.serviceId);
    const dest = catalog.destinations.find((d) => d.id === body.deliveryDestinationId);
    if (!service) return send(res, 404, { statusCode: 404, message: "Service not found." }, origin);
    if (!dest) return bad(res, origin, "Invalid delivery destination.");
    const total = Number(service.servicePrice) * body.numberOfCopies + Number(dest.deliveryFee);
    const stamp = new Date().toISOString().slice(0, 10).replaceAll("-", "");
    const request = { id: randomUUID(), referenceNumber: `INZ-${stamp}-${randomInt(1000, 9999)}`, userId: user.id, status: "requested", totalAmount: total, service: service.type, documents: [], ...body };
    requests.push(request);
    console.log(`[mock-api] request ${request.referenceNumber} by ${user.email}, total ${total}`);
    return send(res, 201, request, origin);
  }

  const docMatch = /^\/requests\/([0-9a-f-]{36})\/documents$/.exec(path);
  if (method === "POST" && docMatch) {
    const request = requests.find((r) => r.id === docMatch[1] && r.userId === user.id);
    if (!request) return send(res, 404, { statusCode: 404, message: "Request not found." }, origin);
    request.documents.push({ key: url.searchParams.get("key"), bytes: raw.length });
    return send(res, 201, { id: randomUUID(), key: url.searchParams.get("key") }, origin);
  }

  if (method === "POST" && path === "/payments") {
    const errs = validate(body, ["requestId", "paymentMethod"], [["requestId", str], ["paymentMethod", (v) => v === "card" || v === "wallet", "paymentMethod must be a valid enum value"]]);
    if (errs.length) return bad(res, origin, errs);
    const request = requests.find((r) => r.id === body.requestId && r.userId === user.id);
    if (!request) return send(res, 404, { statusCode: 404, message: "Request not found." }, origin);
    if (payments.some((p) => p.requestId === request.id)) return bad(res, origin, "This request has already been paid.");
    request.status = "received";
    const payment = { requestId: request.id, transactionRef: `TXN-${randomUUID().slice(0, 8).toUpperCase()}` };
    payments.push(payment);
    return send(res, 201, payment, origin);
  }

  if (method === "GET" && path === "/requests") return send(res, 200, requests.filter((r) => r.userId === user.id), origin);

  return send(res, 404, { statusCode: 404, message: `Cannot ${method} ${path}`, error: "Not Found" }, origin);
});

await loadCatalog();
server.listen(PORT, () => console.log(`[mock-api] listening on http://localhost:${PORT}/api/v1`));
