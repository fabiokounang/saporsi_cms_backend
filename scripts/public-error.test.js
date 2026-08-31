"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const {
  FILE_TOO_LARGE,
  BAD_IMAGE,
  DB_NOT_READY,
  DB_UNAVAILABLE,
  DB_DUPLICATE,
  explainError,
  messageForStatus,
  wantsJson,
} = require("../utils/public-error");

describe("public-error CMS", () => {
  it("413 / entity too large jadi pesan file terlalu besar", () => {
    assert.equal(explainError({ type: "entity.too.large", status: 413 }).status, 413);
    assert.equal(explainError({ type: "entity.too.large" }).message, FILE_TOO_LARGE);
    assert.equal(explainError({ code: "LIMIT_FILE_SIZE", message: "File too large" }).message, FILE_TOO_LARGE);
    assert.equal(explainError({ message: "request entity too large", status: 413 }).message, FILE_TOO_LARGE);
    assert.equal(messageForStatus(413), FILE_TOO_LARGE);
  });

  it("file bukan gambar jadi 400 yang jelas", () => {
    const out = explainError({ statusCode: 400, message: "File harus berupa gambar png/jpg/webp" });
    assert.equal(out.status, 400);
    assert.equal(out.message, BAD_IMAGE);
  });

  it("tidak meneruskan stack / SQL ke user", () => {
    const out = explainError({
      statusCode: 500,
      message: "ER_NO_SUCH_TABLE: Table 'samakan_cms.hero' doesn't exist",
    });
    assert.equal(out.status, 500);
    assert.equal(out.message, DB_NOT_READY);
    assert.doesNotMatch(out.message, /ER_|samakan_cms|hero/);
  });

  it("error koneksi DB tidak menyebut host/kredensial", () => {
    const out = explainError({ code: "ECONNREFUSED", message: "connect ECONNREFUSED 127.0.0.1:3306" });
    assert.equal(out.status, 503);
    assert.equal(out.message, DB_UNAVAILABLE);
    assert.doesNotMatch(out.message, /127\.0\.0\.1|3306|root/);
  });

  it("duplikat jadi pesan aman", () => {
    const out = explainError({ code: "ER_DUP_ENTRY", message: "Duplicate entry 'admin' for key 'email'" });
    assert.equal(out.status, 409);
    assert.equal(out.message, DB_DUPLICATE);
    assert.doesNotMatch(out.message, /admin|email/);
  });

  it("path /api selalu dianggap JSON", () => {
    assert.equal(wantsJson({ originalUrl: "/api/public/site", get: () => "" }), true);
  });
});
