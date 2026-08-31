"use strict";

const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const { adminToken, startApp, request } = require("./test-helpers");
const { detectImageMime } = require("../utils/uploader");

const ADMIN_PATHS = [
  "/admin",
  "/admin/hero",
  "/admin/navbar",
  "/admin/about",
  "/admin/services",
  "/admin/gallery",
  "/admin/footer",
];

describe("security companyprofile CMS", () => {
  let ctx;

  before(async () => {
    ctx = await startApp();
  });

  after(async () => {
    if (ctx) await ctx.close();
  });

  it("menyembunyikan X-Powered-By", async () => {
    const res = await request(ctx.base, "/auth/login");
    assert.equal(res.headers.get("x-powered-by"), null);
  });

  it("memasang header keamanan Helmet", async () => {
    const res = await request(ctx.base, "/auth/login");
    assert.ok(res.headers.get("x-content-type-options"));
    assert.ok(res.headers.get("x-dns-prefetch-control") || res.headers.get("referrer-policy") || res.headers.get("x-frame-options"));
  });

  for (const path of ADMIN_PATHS) {
    it(`menolak ${path} tanpa cookie`, async () => {
      const res = await request(ctx.base, path);
      assert.equal(res.status, 302);
      assert.match(res.loc || "", /login/);
    });
  }

  it("menolak JWT sampah", async () => {
    const res = await request(ctx.base, "/admin", { token: "bukan.jwt.sama-sekali" });
    assert.equal(res.status, 302);
    assert.match(res.loc || "", /login/);
  });

  it("menolak JWT dengan secret salah", async () => {
    const bad = jwt.sign({ id: 1, role: "admin", name: "X" }, "secret-palsu", { expiresIn: "1h" });
    const res = await request(ctx.base, "/admin", { token: bad });
    assert.equal(res.status, 302);
    assert.match(res.loc || "", /login/);
  });

  it("menolak POST admin tanpa cookie", async () => {
    const res = await request(ctx.base, "/admin/hero", {
      method: "POST",
      csrf: false,
      body: { title_id: "HACK" },
    });
    assert.ok(res.status === 302 || res.status === 403);
  });

  it("menolak POST admin ber-JWT tanpa CSRF", async () => {
    const res = await request(ctx.base, "/admin/hero", {
      method: "POST",
      token: adminToken(),
      csrf: false,
      body: { title_id: "HACK" },
    });
    assert.equal(res.status, 403);
    assert.match(res.text, /sesi|csrf/i);
  });

  it("API JSON tidak membocorkan error database", async () => {
    const res = await request(ctx.base, "/api/public/site", {
      headers: { Accept: "application/json" },
    });
    assert.ok(res.status === 200 || res.status >= 400);
    if (res.status >= 400) {
      const body = JSON.parse(res.text);
      assert.equal(typeof body.error, "string");
      assert.doesNotMatch(body.error, /ER_|ECONN|samakan_cms|hero|SQL|stack/i);
    }
  });

  it("404 menampilkan pesan yang jelas, bukan teks mentah", async () => {
    const res = await request(ctx.base, "/admin/services/does-not-exist", { token: adminToken() });
    assert.equal(res.status, 404);
    assert.match(res.text, /tidak ditemukan/i);
    assert.doesNotMatch(res.text, /Internal Server Error/);
  });

  it("413 entity too large mengembalikan pesan file terlalu besar", async () => {
    const err = { type: "entity.too.large", status: 413, message: "request entity too large" };
    const { FILE_TOO_LARGE, explainError } = require("../utils/public-error");
    const mapped = explainError(err);
    assert.equal(mapped.status, 413);
    assert.equal(mapped.message, FILE_TOO_LARGE);
  });

  it("menolak login tanpa CSRF", async () => {
    const res = await request(ctx.base, "/auth/login", {
      method: "POST",
      csrf: false,
      body: { email: "nobody@example.com", password: "x" },
    });
    assert.equal(res.status, 403);
  });

  it("login tidak rentan SQL injection", async () => {
    const res = await request(ctx.base, "/auth/login", {
      method: "POST",
      body: { email: "' OR 1=1 --", password: "' OR 1=1 --" },
    });
    assert.ok(res.status === 401 || res.status === 400);
    assert.doesNotMatch(res.text, /ER_|SQL|syntax/i);
  });

  it("CORS menolak origin asing", async () => {
    const res = await request(ctx.base, "/api/public/site", {
      headers: { Origin: "https://evil.example" },
    });
    assert.equal(res.status, 200);
    assert.equal(res.headers.get("access-control-allow-origin"), null);
  });

  it("CORS mengizinkan origin yang didaftar", async () => {
    const res = await request(ctx.base, "/api/public/site", {
      headers: { Origin: "https://samakan.id" },
    });
    assert.equal(res.status, 200);
    assert.equal(res.headers.get("access-control-allow-origin"), "https://samakan.id");
  });

  it("API publik tidak membocorkan hash password / JWT", async () => {
    const res = await request(ctx.base, "/api/public/site");
    assert.equal(res.status, 200);
    assert.doesNotMatch(res.text, /password_hash|JWT_SECRET|DB_PASS/i);
  });

  it("path traversal ke .env ditolak", async () => {
    const tries = [
      "/uploads/../.env",
      "/uploads/../../.env",
      "/public/../.env",
      "/.env",
    ];
    for (const path of tries) {
      const res = await request(ctx.base, path);
      assert.ok(res.status === 404 || res.status === 403 || res.status === 400, path + " HTTP " + res.status);
      assert.doesNotMatch(res.text, /JWT_SECRET|DB_PASS/);
    }
  });

  it("upload HTML bernama .html ditolak", async () => {
    const boundary = "----TestBoundary7";
    const body =
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="image"; filename="xss.html"\r\n` +
      `Content-Type: image/jpeg\r\n\r\n` +
      `<script>alert(1)</script>\r\n` +
      `--${boundary}--\r\n`;
    const res = await request(ctx.base, "/admin/hero-images/add", {
      method: "POST",
      token: adminToken(),
      type: `multipart/form-data; boundary=${boundary}`,
      body,
    });
    assert.ok(res.status === 400 || res.status === 500 || res.status === 302);
    assert.doesNotMatch(res.text, /<script>alert\(1\)<\/script>/);
  });

  it("upload HTML bernama .jpg dengan MIME image/jpeg ditolak", async () => {
    const boundary = "----TestBoundary8";
    const body =
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="image"; filename="xss.jpg"\r\n` +
      `Content-Type: image/jpeg\r\n\r\n` +
      `<script>alert(1)</script>\r\n` +
      `--${boundary}--\r\n`;
    const res = await request(ctx.base, "/admin/hero-images/add", {
      method: "POST",
      token: adminToken(),
      type: `multipart/form-data; boundary=${boundary}`,
      body,
    });
    assert.equal(res.status, 400);
    assert.doesNotMatch(res.text, /<script>alert\(1\)<\/script>/);
  });

  it("mengenali magic bytes gambar dan menolak HTML", () => {
    assert.equal(
      detectImageMime(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0])),
      "image/png"
    );
    assert.equal(detectImageMime(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0])), "image/jpeg");
    const webp = Buffer.alloc(12);
    webp.write("RIFF", 0);
    webp.write("WEBP", 8);
    assert.equal(detectImageMime(webp), "image/webp");
    assert.equal(detectImageMime(Buffer.from("<script>alert(1)</script>")), null);
  });

  it("cookie CSRF dan token bersifat httpOnly", async () => {
    const res = await request(ctx.base, "/auth/login");
    const raw =
      (typeof res.headers.getSetCookie === "function"
        ? res.headers.getSetCookie().join("\n")
        : res.headers.get("set-cookie")) || "";
    assert.match(String(raw), /_csrf=/);
    assert.match(String(raw), /httponly/i);
  });
});
