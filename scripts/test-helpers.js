"use strict";

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const jwt = require("jsonwebtoken");
const { closePool } = require("../utils/db");

const csrfByBase = new Map();

function adminToken(overrides = {}) {
  return jwt.sign(
    { id: 1, role: "admin", name: "Audit", ...overrides },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
}

async function startApp() {
  const app = require("../index");
  return new Promise((resolve, reject) => {
    const server = app.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      const base = `http://127.0.0.1:${port}`;
      resolve({
        server,
        base,
        close: async () => {
          csrfByBase.delete(base);
          await new Promise((done, fail) => {
            if (typeof server.closeIdleConnections === "function") {
              server.closeIdleConnections();
            }
            if (typeof server.closeAllConnections === "function") {
              server.closeAllConnections();
            }
            server.close((err) => (err ? fail(err) : done()));
          });
          await closePool();
        },
      });
    });
    server.on("error", reject);
  });
}

function form(obj) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(obj)) {
    if (Array.isArray(v)) v.forEach((item) => p.append(k, item == null ? "" : String(item)));
    else p.append(k, v == null ? "" : String(v));
  }
  return p.toString();
}

function readCsrfFromHeaders(headers) {
  const list =
    typeof headers.getSetCookie === "function"
      ? headers.getSetCookie()
      : String(headers.get("set-cookie") || "").split(/,(?=\s*_csrf=)/);
  for (const raw of list) {
    const match = String(raw).match(/(?:^|, )?_csrf=([^;]+)/);
    if (match) return match[1];
  }
  return "";
}

async function getCsrf(base) {
  if (csrfByBase.has(base)) return csrfByBase.get(base);
  const res = await fetch(base + "/auth/login", { redirect: "manual" });
  const text = await res.text();
  const fromCookie = readCsrfFromHeaders(res.headers);
  const fromMeta = (text.match(/name="csrf-token" content="([a-f0-9]{64})"/) || [])[1];
  const token = fromCookie || fromMeta;
  if (!token) throw new Error("CSRF token tidak terbit");
  csrfByBase.set(base, token);
  return token;
}

function withCookies(existing, parts) {
  return [existing, ...parts].filter(Boolean).join("; ");
}

async function request(base, path, { method = "GET", body, token, headers = {}, type, csrf } = {}) {
  const h = { ...headers };
  const mutating = !["GET", "HEAD", "OPTIONS"].includes(method);
  const csrfToken = csrf === false ? "" : csrf || (mutating ? await getCsrf(base) : "");
  h.Cookie = withCookies(h.Cookie, [
    token ? `token=${token}` : "",
    csrfToken ? `_csrf=${csrfToken}` : "",
  ]);
  if (csrfToken) h["X-CSRF-Token"] = csrfToken;

  const opts = { method, headers: h, redirect: "manual" };
  if (body != null) {
    if (typeof body === "string" || Buffer.isBuffer(body)) {
      if (type) h["Content-Type"] = type;
      opts.body = body;
    } else if (body instanceof URLSearchParams) {
      if (csrfToken && !body.has("_csrf")) body.set("_csrf", csrfToken);
      h["Content-Type"] = "application/x-www-form-urlencoded";
      opts.body = body.toString();
    } else {
      h["Content-Type"] = type || "application/x-www-form-urlencoded";
      if (typeof body === "object" && h["Content-Type"].includes("json")) {
        if (csrfToken && body._csrf == null) body = { ...body, _csrf: csrfToken };
        opts.body = JSON.stringify(body);
      } else {
        const payload = { ...body };
        if (csrfToken && payload._csrf == null) payload._csrf = csrfToken;
        opts.body = form(payload);
      }
    }
  }
  const res = await fetch(base + path, opts);
  const text = await res.text();
  return {
    status: res.status,
    loc: res.headers.get("location"),
    headers: res.headers,
    text,
  };
}

module.exports = { adminToken, startApp, form, request, getCsrf };
