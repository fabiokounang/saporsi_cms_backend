"use strict";

const crypto = require("crypto");

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const TOKEN_RE = /^[a-f0-9]{64}$/;

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
}

function newToken() {
  return crypto.randomBytes(32).toString("hex");
}

function tokensEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  if (!TOKEN_RE.test(a) || !TOKEN_RE.test(b)) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

function issueCsrf(req, res, next) {
  let token = req.cookies && req.cookies._csrf;
  if (!TOKEN_RE.test(token || "")) {
    token = newToken();
    res.cookie("_csrf", token, cookieOptions());
  }
  res.locals.csrfToken = token;
  next();
}

function rotateCsrf(res) {
  const token = newToken();
  res.cookie("_csrf", token, cookieOptions());
  return token;
}

function sentToken(req) {
  return (
    req.get("x-csrf-token") ||
    (req.body && req.body._csrf) ||
    ""
  );
}

function rejectCsrf(req, res) {
  const wantsHtml = req.accepts("html") && !req.accepts("json");
  res.status(403);
  if (wantsHtml) return res.send("Invalid CSRF token");
  return res.json({ error: "Invalid CSRF token" });
}

function verifyCsrf(req, res, next) {
  if (SAFE_METHODS.has(req.method)) return next();
  if (req.path.startsWith("/api/")) return next();

  const expected = req.cookies && req.cookies._csrf;
  const sent = sentToken(req);
  if (tokensEqual(expected, sent)) return next();

  return rejectCsrf(req, res);
}

function injectCsrfHtml(req, res, next) {
  const send = res.send.bind(res);
  res.send = function patchedSend(body) {
    const token = res.locals.csrfToken;
    if (token && typeof body === "string" && body.includes("<head>") && !body.includes('name="csrf-token"')) {
      body = body.replace(
        "<head>",
        `<head>\n<meta name="csrf-token" content="${token}">\n<script src="/public/js/csrf.js" defer></script>`
      );
      body = body.replace(/<form\b([^>]*\bmethod\s*=\s*['"]post['"][^>]*)>/gi, (open) => {
        return `${open}<input type="hidden" name="_csrf" value="${token}">`;
      });
    }
    return send(body);
  };
  next();
}

module.exports = {
  issueCsrf,
  verifyCsrf,
  injectCsrfHtml,
  rotateCsrf,
};
