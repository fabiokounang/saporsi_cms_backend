"use strict";

const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { adminToken, startApp, request } = require("./test-helpers");

const PAGES = [
  ["/admin", "Dashboard"],
  ["/admin/navbar", "Navbar"],
  ["/admin/hero", "Hero"],
  ["/admin/home", "Hero"],
  ["/admin/about", "About"],
  ["/admin/services", "Services"],
  ["/admin/how-it-works", "How"],
  ["/admin/gallery", "Gallery"],
  ["/admin/locations", "Location"],
  ["/admin/partners", "Partner"],
  ["/admin/early-program", "Early"],
  ["/admin/contact", "Contact"],
  ["/admin/cta", "CTA"],
  ["/admin/footer", "Footer"],
];

describe("e2e companyprofile CMS", () => {
  let ctx;
  let token;

  before(async () => {
    ctx = await startApp();
    token = adminToken();
  });

  after(async () => {
    if (ctx) await ctx.close();
  });

  it("halaman login tampil", async () => {
    const res = await request(ctx.base, "/auth/login");
    assert.equal(res.status, 200);
    assert.match(res.text, /login|password|email/i);
  });

  it("login kosong ditolak", async () => {
    const res = await request(ctx.base, "/auth/login", {
      method: "POST",
      body: { email: "", password: "" },
    });
    assert.equal(res.status, 400);
  });

  it("login salah ditolak", async () => {
    const res = await request(ctx.base, "/auth/login", {
      method: "POST",
      body: { email: "nobody@example.com", password: "salah" },
    });
    assert.equal(res.status, 401);
  });

  for (const [path, needle] of PAGES) {
    it(`GET ${path} ter-render`, async () => {
      const res = await request(ctx.base, path, { token });
      assert.equal(res.status, 200, `${path} HTTP ${res.status}`);
      assert.doesNotMatch(res.text, /Internal Server Error/);
      assert.match(res.text, new RegExp(needle, "i"));
    });
  }

  it("API publik site mengembalikan JSON", async () => {
    const res = await request(ctx.base, "/api/public/site");
    assert.equal(res.status, 200);
    const data = JSON.parse(res.text);
    assert.ok(data && typeof data === "object");
  });

  it("simpan hero header tidak merusak judul", async () => {
    const Hero = require("../models/hero");
    const before = await Hero.getHero();
    assert.ok(before, "hero id=1 harus ada");
    const res = await request(ctx.base, "/admin/hero", {
      method: "POST",
      token,
      body: {
        title_id: before.title_id,
        title_en: before.title_en,
        subtitle_id: before.subtitle_id,
        subtitle_en: before.subtitle_en,
        badge_id: before.badge_id,
        badge_en: before.badge_en,
        cta_label_id: before.cta_label_id,
        cta_label_en: before.cta_label_en,
        cta_url: before.cta_url,
      },
    });
    assert.ok(res.status === 200 || res.status === 302);
    const after = await Hero.getHero();
    assert.equal(after.title_id, before.title_id);
  });

  it("simpan urutan hero images 1 dan 2", async () => {
    const Hero = require("../models/hero");
    const imgs = await Hero.getHeroImages();
    if (imgs.length < 2) return;
    const res = await request(ctx.base, "/admin/hero-images/save", {
      method: "POST",
      token,
      body: {
        image_id: imgs.map((i) => i.id),
        sort_order: imgs.map((_, i) => i + 1),
        is_active: imgs.filter((i) => i.is_active).map((i) => i.id),
      },
    });
    assert.equal(res.status, 302);
    const after = await Hero.getHeroImages();
    assert.deepEqual(
      after.map((i) => Number(i.sort_order)),
      imgs.map((_, i) => i + 1)
    );
    await Hero.updateHeroImages({
      image_id: imgs.map((i) => String(i.id)),
      sort_order: imgs.map((i) => String(i.sort_order)),
      is_active: imgs.filter((i) => i.is_active).map((i) => String(i.id)),
    });
  });

  it("how-it-works add lalu delete", async () => {
    const How = require("../models/howitworks");
    const before = (await How.getItems()).map((i) => i.id);
    const add = await request(ctx.base, "/admin/how-it-works/add", {
      method: "POST",
      token,
      body: {},
    });
    assert.equal(add.status, 302);
    const created = (await How.getItems()).find((i) => !before.includes(i.id));
    assert.ok(created, "item baru harus muncul");
    const del = await request(ctx.base, `/admin/how-it-works/${created.id}/delete`, {
      method: "POST",
      token,
      body: {},
    });
    assert.equal(del.status, 302);
    assert.equal(
      (await How.getItems()).some((i) => i.id === created.id),
      false
    );
  });

  it("logout menghapus sesi", async () => {
    const res = await request(ctx.base, "/auth/logout", { token });
    assert.equal(res.status, 302);
    assert.match(res.loc || "", /login/);
  });
});
