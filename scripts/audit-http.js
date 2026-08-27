/**
 * Uji HTTP: GET tiap halaman admin + POST simpan header (roundtrip).
 * Butuh server di PORT (default 3000).
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const jwt = require("jsonwebtoken");

const BASE = process.env.AUDIT_BASE || "http://127.0.0.1:3000";

function token() {
  return jwt.sign(
    { id: 1, role: "admin", name: "Audit" },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
}

let csrfToken = "";

async function loadCsrf() {
  const res = await fetch(BASE + "/auth/login", { redirect: "manual" });
  const text = await res.text();
  const cookies =
    typeof res.headers.getSetCookie === "function"
      ? res.headers.getSetCookie()
      : [res.headers.get("set-cookie")].filter(Boolean);
  for (const raw of cookies) {
    const match = String(raw).match(/(?:^|, )?_csrf=([^;]+)/);
    if (match) csrfToken = match[1];
  }
  if (!csrfToken) {
    csrfToken = (text.match(/name="csrf-token" content="([a-f0-9]{64})"/) || [])[1] || "";
  }
}

async function req(path, { method = "GET", body, type } = {}) {
  const headers = { Cookie: `token=${token()}` };
  if (csrfToken) {
    headers.Cookie += `; _csrf=${csrfToken}`;
    headers["X-CSRF-Token"] = csrfToken;
  }
  const opts = { method, headers, redirect: "manual" };
  if (body) {
    headers["Content-Type"] = type || "application/x-www-form-urlencoded";
    opts.body =
      csrfToken && type !== "application/json" && !String(body).includes("_csrf=")
        ? String(body) + "&_csrf=" + encodeURIComponent(csrfToken)
        : body;
  }
  const res = await fetch(BASE + path, opts);
  const text = await res.text();
  return { status: res.status, loc: res.headers.get("location"), text };
}

function form(obj) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(obj)) {
    if (Array.isArray(v)) {
      v.forEach((item) => p.append(k, item == null ? "" : String(item)));
    } else {
      p.append(k, v == null ? "" : String(v));
    }
  }
  return p.toString();
}

const results = [];
function ok(name, extra) {
  results.push({ name, ok: true, extra });
  console.log(`  OK   ${name}${extra ? " — " + extra : ""}`);
}
function fail(name, extra) {
  results.push({ name, ok: false, extra });
  console.log(`  FAIL ${name} — ${extra}`);
}

async function getPage(path, mustInclude) {
  const r = await req(path);
  if (r.status !== 200) return fail("GET " + path, "HTTP " + r.status);
  if (r.text.includes("Cannot GET") || r.text.includes("Internal Server Error")) {
    return fail("GET " + path, "error page");
  }
  if (mustInclude && !r.text.includes(mustInclude)) {
    return fail("GET " + path, "tidak berisi: " + mustInclude);
  }
  return ok("GET " + path);
}

async function postOk(path, body, expectLoc) {
  const r = await req(path, { method: "POST", body: form(body) });
  const loc = r.loc || "";
  if (r.status !== 302 && r.status !== 200) {
    return fail("POST " + path, "HTTP " + r.status + " " + r.text.slice(0, 160));
  }
  if (expectLoc && !loc.includes(expectLoc) && r.status === 302) {
    return fail("POST " + path, "redirect ke " + loc);
  }
  return ok("POST " + path, "HTTP " + r.status + (loc ? " → " + loc : ""));
}

async function main() {
  const ping = await fetch(BASE + "/auth/login").catch((e) => ({ ok: false, error: e }));
  if (!ping || ping.ok === false) {
    console.error("Server tidak merespons di", BASE);
    process.exit(1);
  }
  await loadCsrf();

  console.log("=== GET halaman ===");
  await getPage("/admin", "Dashboard");
  await getPage("/admin/navbar", "Navbar");
  await getPage("/admin/hero", "Hero");
  await getPage("/admin/about", "About");
  await getPage("/admin/services", "Services");
  await getPage("/admin/how-it-works", "How");
  await getPage("/admin/gallery", "Gallery");
  await getPage("/admin/locations", "Location");
  await getPage("/admin/partners", "Partner");
  await getPage("/admin/early-program", "Early");
  await getPage("/admin/contact", "Contact");
  await getPage("/admin/cta", "CTA");
  await getPage("/admin/footer", "Footer");

  console.log("\n=== POST simpan (data uji, lalu dikembalikan) ===");

  const Hero = require("../models/hero");
  const About = require("../models/about");
  const Services = require("../models/services");
  const How = require("../models/howitworks");
  const Gallery = require("../models/gallery");
  const Locations = require("../models/locations");
  const Partners = require("../models/partners");
  const Early = require("../models/earlyprogram");
  const Contact = require("../models/contact");
  const CTA = require("../models/cta");
  const Footer = require("../models/footer");
  const Navbar = require("../models/navbar");

  const hero = await Hero.getHero();
  await postOk("/admin/hero", { ...hero, title_id: hero.title_id }, "/admin");
  const heroAfter = await Hero.getHero();
  if (heroAfter.title_id !== hero.title_id) {
    await Hero.updateHero(hero);
    fail("hero header persist", "title berubah tak terduga");
  } else ok("hero header persist");

  const imgs = await Hero.getHeroImages();
  if (imgs.length >= 2) {
    await postOk(
      "/admin/hero-images/save",
      {
        image_id: imgs.map((i) => i.id),
        sort_order: imgs.map((_, i) => i + 1),
        is_active: imgs.filter((i) => i.is_active).map((i) => i.id),
      },
      "/admin/hero"
    );
    const after = await Hero.getHeroImages();
    const orders = after.map((i) => Number(i.sort_order));
    if (orders.includes(999) && imgs.every((i) => Number(i.sort_order) !== 999)) {
      fail("hero images order", "ada 999 setelah save");
    } else ok("hero images order", orders.join(","));
    // restore
    await Hero.updateHeroImages({
      image_id: imgs.map((i) => String(i.id)),
      sort_order: imgs.map((i) => String(i.sort_order)),
      is_active: imgs.filter((i) => i.is_active).map((i) => String(i.id)),
    });
  }

  const about = await About.getAbout();
  await postOk("/admin/about", about, "/admin");

  const svc = await Services.getServicesHeader();
  await postOk("/admin/services/header", svc, "/admin");

  const hiw = await How.getHeader();
  await postOk("/admin/how-it-works/header", hiw, "/admin/how-it-works");

  const gal = await Gallery.getGalleryHeader();
  await postOk("/admin/gallery/header", gal, "/admin");

  const loc = await Locations.getLocationsHeader();
  await postOk("/admin/locations/header", loc, "/admin");

  const par = await Partners.getPartnerHeader();
  await postOk("/admin/partners/header", par, "/admin");

  const ep = await Early.getHeader();
  await postOk("/admin/early-program/header", ep, "/admin/early-program");

  const contact = await Contact.getContactHeader();
  await postOk("/admin/contact/header", contact, "/admin/contact");

  const cta = await CTA.getCTA();
  await postOk("/admin/cta/save", { ...cta, is_active: "1" }, "/admin/cta");

  const footer = await Footer.getFooter();
  await postOk("/admin/footer", footer, "/admin");

  const nav = await Navbar.getNavbarSettings();
  const navItems = await Navbar.getNavbarItems();
  await postOk(
    "/admin/navbar",
    {
      current_logo: nav.logo_path || "",
      cta_label_id: nav.cta_label_id,
      cta_label_en: nav.cta_label_en,
      cta_url: nav.cta_url,
      show_language_toggle: nav.show_language_toggle ? "1" : "0",
    },
    "/admin"
  );
  const navAfterSettings = await Navbar.getNavbarSettings();
  if (navAfterSettings.cta_label_id !== nav.cta_label_id) {
    fail("navbar settings persist", "CTA berubah");
  } else ok("navbar settings persist");

  if (navItems.length) {
    const first = navItems[0];
    await postOk(
      "/admin/navbar",
      {
        item_id: first.id,
        label_id: first.label_id,
        label_en: first.label_en,
        url: first.url,
        sort_order: first.sort_order,
        is_active: first.is_active ? first.id : "",
      },
      "/admin"
    );
    const afterItems = await Navbar.getNavbarItems();
    const still = afterItems.find((x) => x.id === first.id);
    const settingsStill = await Navbar.getNavbarSettings();
    if (!still || still.label_id !== first.label_id) fail("navbar 1 item save", "label berubah");
    else ok("navbar 1 item save");
    if (settingsStill.cta_label_id !== nav.cta_label_id) {
      fail("navbar items tidak menimpa settings", "CTA berubah saat simpan 1 item");
    } else ok("navbar items tidak menimpa settings");
  }

  // How it works add + delete
  const beforeHiw = (await How.getItems()).map((i) => i.id);
  await postOk("/admin/how-it-works/add", {}, "/admin/how-it-works");
  const afterAdd = await How.getItems();
  const created = afterAdd.find((i) => !beforeHiw.includes(i.id));
  if (!created) fail("how-it-works add", "baris baru tidak muncul");
  else {
    ok("how-it-works add", "id=" + created.id);
    await postOk("/admin/how-it-works/" + created.id + "/delete", {}, "/admin/how-it-works");
    const gone = (await How.getItems()).find((i) => i.id === created.id);
    if (gone) fail("how-it-works delete", "baris masih ada");
    else ok("how-it-works delete");
  }

  const { getPool } = require("../utils/db");
  const pool = getPool();
  await pool.end();

  const failed = results.filter((r) => !r.ok);
  console.log(`\n=== RINGKASAN HTTP: ${results.length - failed.length}/${results.length} lolos ===`);
  if (failed.length) {
    failed.forEach((f) => console.log("  - " + f.name + ": " + f.extra));
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
