/**
 * Audit CRUD companyprofile — baca skema lalu uji write/read tiap modul.
 * Tidak menyentuh HTTP. Rollback setiap perubahan uji.
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { getPool } = require("../utils/db");

const results = [];
function ok(mod, op, extra) {
  results.push({ mod, op, ok: true, extra: extra || "" });
  console.log(`  OK   ${mod} · ${op}${extra ? " — " + extra : ""}`);
}
function fail(mod, op, err) {
  const extra = err && err.message ? err.message : String(err);
  results.push({ mod, op, ok: false, extra });
  console.log(`  FAIL ${mod} · ${op} — ${extra}`);
}

async function describe(pool, table) {
  const [cols] = await pool.query(`SHOW COLUMNS FROM \`${table}\``);
  return cols.map((c) => `${c.Field}:${c.Type}${c.Null === "NO" ? "!" : ""}`).join(", ");
}

async function main() {
  const pool = getPool();
  const conn = await pool.getConnection();

  const tables = [
    "site_navbar",
    "site_navbar_items",
    "hero",
    "hero_images",
    "site_about",
    "site_about_cards",
    "site_about_points",
    "site_services",
    "site_services_items",
    "site_how_it_works",
    "site_how_it_works_items",
    "site_gallery",
    "site_gallery_items",
    "site_locations",
    "site_location_items",
    "site_partners",
    "site_partner_items",
    "site_early_program",
    "site_early_program_benefits",
    "site_contact",
    "site_contact_steps",
    "site_cta",
    "site_footer",
    "site_footer_quick_links",
  ];

  console.log("=== SKEMA ===");
  for (const t of tables) {
    try {
      const [[{ c }]] = await conn.query(`SELECT COUNT(*) AS c FROM \`${t}\``);
      console.log(`\n${t} (${c} baris)`);
      console.log("  " + (await describe(conn, t)));
    } catch (e) {
      console.log(`\n${t} — TIDAK ADA: ${e.message}`);
    }
  }

  console.log("\n=== UJI MODEL ===");

  const Navbar = require("../models/navbar");
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

  await conn.beginTransaction();
  try {
    // NAVBAR
    console.log("\n[navbar]");
    try {
      const settings = await Navbar.getNavbarSettings();
      if (!settings) throw new Error("site_navbar id=1 tidak ada");
      const before = settings.cta_label_id;
      await Navbar.updateNavbarSettings({
        ...settings,
        cta_label_id: "AUDIT-NAV",
        show_language_toggle: settings.show_language_toggle,
      });
      const after = await Navbar.getNavbarSettings();
      if (after.cta_label_id !== "AUDIT-NAV") throw new Error("update settings tidak tersimpan");
      await Navbar.updateNavbarSettings({ ...settings, cta_label_id: before, show_language_toggle: settings.show_language_toggle });
      ok("navbar", "update settings");
    } catch (e) {
      fail("navbar", "update settings", e);
    }

    try {
      const id = await Navbar.addNavbarItem();
      const items = await Navbar.getNavbarItems();
      if (!items.find((x) => x.id === id)) throw new Error("item baru tidak muncul");
      await Navbar.updateNavbarItems([
        { id, label_id: "Satu", label_en: "One", url: "/satu", sort_order: 2, is_active: 1 },
      ]);
      const one = (await Navbar.getNavbarItems()).find((x) => x.id === id);
      if (one.sort_order !== 2 || one.label_id !== "Satu") throw new Error("update item tidak tersimpan");
      await Navbar.deleteNavbarItem(id);
      if ((await Navbar.getNavbarItems()).find((x) => x.id === id)) throw new Error("delete gagal");
      ok("navbar", "add/update/delete item");
    } catch (e) {
      fail("navbar", "add/update/delete item", e);
    }

    // HERO
    console.log("\n[hero]");
    try {
      const data = await Hero.getHero();
      if (!data) throw new Error("hero id=1 tidak ada");
      const prev = data.title_id;
      await Hero.updateHero({ ...data, title_id: "AUDIT-HERO" });
      if ((await Hero.getHero()).title_id !== "AUDIT-HERO") throw new Error("update hero tidak tersimpan");
      await Hero.updateHero({ ...data, title_id: prev });
      ok("hero", "update header");
    } catch (e) {
      fail("hero", "update header", e);
    }

    try {
      const idA = await Hero.addHeroImage("/uploads/hero/audit-a.png");
      const idB = await Hero.addHeroImage("/uploads/hero/audit-b.png");
      await Hero.updateHeroImages({
        image_id: [String(idA), String(idB)],
        sort_order: ["1", "2"],
        is_active: [String(idA)],
      });
      const imgs = await Hero.getHeroImages();
      const a = imgs.find((x) => x.id === idA);
      const b = imgs.find((x) => x.id === idB);
      if (!a || Number(a.sort_order) !== 1) throw new Error("sort A bukan 1");
      if (!b || Number(b.sort_order) !== 2) throw new Error(`sort B = ${b && b.sort_order}, diharapkan 2`);
      if (Number(a.is_active) !== 1) throw new Error("A harus active");
      if (Number(b.is_active) !== 0) throw new Error("B harus inactive");
      await Hero.deleteHeroImage(idA);
      await Hero.deleteHeroImage(idB);
      ok("hero", "add/update-banyak/delete images");
    } catch (e) {
      fail("hero", "images CRUD", e);
    }

    // ABOUT
    console.log("\n[about]");
    try {
      const data = await About.getAbout();
      if (!data) throw new Error("site_about id=1 tidak ada");
      const prev = data.title_id;
      await About.updateAbout({ ...data, title_id: "AUDIT-ABOUT" });
      if ((await About.getAbout()).title_id !== "AUDIT-ABOUT") throw new Error("header tidak tersimpan");
      await About.updateAbout({ ...data, title_id: prev });
      ok("about", "update header");
    } catch (e) {
      fail("about", "update header", e);
    }

    try {
      const cardId = await About.addCard();
      await About.updateCards([
        {
          id: cardId,
          card_type: "visi",
          title_id: "Visi",
          title_en: "Vision",
          description_id: "d",
          description_en: "d",
          theme: "orange",
          icon_key: "custom",
          sort_order: 3,
          is_active: 1,
        },
      ]);
      const card = (await About.getCards()).find((x) => x.id === cardId);
      if (!card || card.title_id !== "Visi" || Number(card.sort_order) !== 3) throw new Error("card tidak tersimpan");
      await About.deleteCard(cardId);
      ok("about", "add/update/delete card");
    } catch (e) {
      fail("about", "cards CRUD", e);
    }

    try {
      const pointId = await About.addPoint();
      await About.updatePoints([
        {
          id: pointId,
          title_id: "Poin",
          title_en: "Point",
          description_id: "d",
          description_en: "d",
          icon_key: "custom",
          sort_order: 4,
          is_active: 1,
        },
      ]);
      const point = (await About.getPoints()).find((x) => x.id === pointId);
      if (!point || point.title_id !== "Poin" || Number(point.sort_order) !== 4) throw new Error("point tidak tersimpan");
      await About.deletePoint(pointId);
      ok("about", "add/update/delete point");
    } catch (e) {
      fail("about", "points CRUD", e);
    }

    // SERVICES
    console.log("\n[services]");
    try {
      const header = await Services.getServicesHeader();
      if (!header) throw new Error("site_services id=1 tidak ada");
      const prev = header.title_id;
      await Services.updateServicesHeader({ ...header, title_id: "AUDIT-SVC" });
      if ((await Services.getServicesHeader()).title_id !== "AUDIT-SVC") throw new Error("header tidak tersimpan");
      await Services.updateServicesHeader({ ...header, title_id: prev });
      ok("services", "update header");
    } catch (e) {
      fail("services", "update header", e);
    }

    try {
      const id = await Services.addServiceItem();
      await Services.updateServiceItems([
        {
          id,
          title_id: "Layanan",
          title_en: "Service",
          description_id: "d",
          description_en: "d",
          icon_key: "custom",
          accent: "orange",
          sort_order: 2,
          is_active: 1,
        },
      ]);
      const row = (await Services.getServicesItems()).find((x) => x.id === id);
      if (!row || row.title_id !== "Layanan" || Number(row.sort_order) !== 2) throw new Error("item tidak tersimpan");
      await Services.deleteServiceItem(id);
      ok("services", "add/update/delete item");
    } catch (e) {
      fail("services", "items CRUD", e);
    }

    // HOW IT WORKS
    console.log("\n[how-it-works]");
    try {
      const header = await How.getHeader();
      if (!header) throw new Error("site_how_it_works id=1 tidak ada");
      const prev = header.title_id;
      await How.updateHeader({ ...header, title_id: "AUDIT-HIW" });
      if ((await How.getHeader()).title_id !== "AUDIT-HIW") throw new Error("header tidak tersimpan");
      await How.updateHeader({ ...header, title_id: prev });
      ok("how-it-works", "update header");
    } catch (e) {
      fail("how-it-works", "update header", e);
    }

    try {
      await How.addItem();
      const items = await How.getItems();
      const newest = items[items.length - 1];
      if (!newest) throw new Error("addItem tidak menambah baris");
      await How.updateItems([
        {
          id: newest.id,
          title_id: "Langkah",
          title_en: "Step",
          description_id: "d",
          description_en: "d",
          icon_path: null,
          sort_order: 2,
          is_active: 1,
        },
      ]);
      const row = (await How.getItems()).find((x) => x.id === newest.id);
      if (!row || row.title_id !== "Langkah") throw new Error("update item tidak tersimpan");
      await How.deleteItem(newest.id);
      ok("how-it-works", "add/update/delete item");
    } catch (e) {
      fail("how-it-works", "items CRUD", e);
    }

    // GALLERY
    console.log("\n[gallery]");
    try {
      const header = await Gallery.getGalleryHeader();
      if (!header) throw new Error("site_gallery id=1 tidak ada");
      const prev = header.title_id;
      await Gallery.updateGalleryHeader({ ...header, title_id: "AUDIT-GAL" });
      if ((await Gallery.getGalleryHeader()).title_id !== "AUDIT-GAL") throw new Error("header tidak tersimpan");
      await Gallery.updateGalleryHeader({ ...header, title_id: prev });
      ok("gallery", "update header");
    } catch (e) {
      fail("gallery", "update header", e);
    }

    try {
      const id = await Gallery.addGalleryItem({
        label_id: "Foto",
        label_en: "Photo",
        image_path: "/uploads/gallery/audit.png",
        sort_order: 2,
        is_active: 1,
      });
      await Gallery.updateGalleryItem({
        id,
        label_id: "Foto2",
        label_en: "Photo2",
        image_path: "/uploads/gallery/audit.png",
        sort_order: 3,
        is_active: 1,
      });
      const row = (await Gallery.getGalleryItems()).find((x) => x.id === id);
      if (!row || row.label_id !== "Foto2" || Number(row.sort_order) !== 3) throw new Error("item tidak tersimpan");
      await Gallery.deleteGalleryItem(id);
      ok("gallery", "add/update/delete item");
    } catch (e) {
      fail("gallery", "items CRUD", e);
    }

    // LOCATIONS
    console.log("\n[locations]");
    try {
      const header = await Locations.getLocationsHeader();
      if (!header) throw new Error("site_locations id=1 tidak ada");
      const prev = header.title_id;
      await Locations.updateLocationsHeader({ ...header, title_id: "AUDIT-LOC" });
      if ((await Locations.getLocationsHeader()).title_id !== "AUDIT-LOC") throw new Error("header tidak tersimpan");
      await Locations.updateLocationsHeader({ ...header, title_id: prev });
      ok("locations", "update header");
    } catch (e) {
      fail("locations", "update header", e);
    }

    try {
      const id = await Locations.addLocationItem();
      await Locations.updateLocationItems([
        { id, title_id: "Lokasi", title_en: "Loc", icon_key: "custom", accent: "orange", sort_order: 2, is_active: 1 },
      ]);
      const row = (await Locations.getLocationItems()).find((x) => x.id === id);
      if (!row || row.title_id !== "Lokasi" || Number(row.sort_order) !== 2) throw new Error("item tidak tersimpan");
      await Locations.deleteLocationItem(id);
      ok("locations", "add/update/delete item");
    } catch (e) {
      fail("locations", "items CRUD", e);
    }

    // PARTNERS
    console.log("\n[partners]");
    try {
      const header = await Partners.getPartnerHeader();
      if (!header) throw new Error("site_partners id=1 tidak ada");
      const prev = header.title_id;
      await Partners.updatePartnerHeader({ ...header, title_id: "AUDIT-PAR" });
      if ((await Partners.getPartnerHeader()).title_id !== "AUDIT-PAR") throw new Error("header tidak tersimpan");
      await Partners.updatePartnerHeader({ ...header, title_id: prev });
      ok("partners", "update header");
    } catch (e) {
      fail("partners", "update header", e);
    }

    try {
      await Partners.addPartnerItem({
        name_id: "Mitra",
        name_en: "Partner",
        logo_path: "/uploads/partners/audit.png",
        sort_order: 2,
      });
      const items = await Partners.getPartnerItems();
      const row = items.find((x) => x.name_id === "Mitra");
      if (!row) throw new Error("item baru tidak muncul");
      await Partners.updatePartnerItem({
        id: row.id,
        name_id: "Mitra2",
        name_en: "Partner2",
        logo_path: row.logo_path,
        sort_order: 3,
        is_active: 1,
      });
      const after = (await Partners.getPartnerItems()).find((x) => x.id === row.id);
      if (!after || after.name_id !== "Mitra2") throw new Error("update tidak tersimpan");
      await Partners.deletePartnerItem(row.id);
      ok("partners", "add/update/delete item");
    } catch (e) {
      fail("partners", "items CRUD", e);
    }

    // EARLY PROGRAM
    console.log("\n[early-program]");
    try {
      const header = await Early.getHeader();
      if (!header) throw new Error("site_early_program id=1 tidak ada");
      const prev = header.title_id;
      await Early.updateHeader({ ...header, title_id: "AUDIT-EP" });
      if ((await Early.getHeader()).title_id !== "AUDIT-EP") throw new Error("header tidak tersimpan");
      await Early.updateHeader({ ...header, title_id: prev });
      ok("early-program", "update header");
    } catch (e) {
      fail("early-program", "update header", e);
    }

    try {
      const id = await Early.addBenefit();
      await Early.upsertBenefits([
        {
          id,
          title_id: "Manfaat",
          title_en: "Benefit",
          description_id: "d",
          description_en: "d",
          icon_path: null,
          accent: "orange",
          sort_order: 2,
          is_active: 1,
        },
      ]);
      const row = (await Early.listBenefits()).find((x) => x.id === id);
      if (!row || row.title_id !== "Manfaat") throw new Error("benefit tidak tersimpan");
      await Early.deleteBenefit(id);
      ok("early-program", "add/update/delete benefit");
    } catch (e) {
      fail("early-program", "benefits CRUD", e);
    }

    // CONTACT
    console.log("\n[contact]");
    try {
      const header = await Contact.getContactHeader();
      if (!header) throw new Error("site_contact tidak ada");
      const prev = header.title_id;
      await Contact.updateContactHeader({ ...header, title_id: "AUDIT-CON" });
      if ((await Contact.getContactHeader()).title_id !== "AUDIT-CON") throw new Error("header tidak tersimpan");
      await Contact.updateContactHeader({ ...header, title_id: prev });
      ok("contact", "update header");
    } catch (e) {
      fail("contact", "update header", e);
    }

    try {
      const header = await Contact.getContactHeader();
      await Contact.addContactStep(header.id);
      const steps = await Contact.listContactSteps(header.id);
      const newest = steps[steps.length - 1];
      await Contact.updateContactSteps([
        { id: newest.id, text_id: "Langkah", text_en: "Step", sort_order: 2, is_active: 1 },
      ]);
      const row = (await Contact.listContactSteps(header.id)).find((x) => x.id === newest.id);
      if (!row || row.text_id !== "Langkah") throw new Error("step tidak tersimpan");
      await Contact.deleteContactStep(newest.id);
      ok("contact", "add/update/delete step");
    } catch (e) {
      fail("contact", "steps CRUD", e);
    }

    // CTA
    console.log("\n[cta]");
    try {
      const data = await CTA.getCTA();
      const prev = data ? data.title_id : "";
      await CTA.upsertCTA({
        id: 1,
        badge_id: data?.badge_id || "",
        badge_en: data?.badge_en || "",
        title_id: "AUDIT-CTA",
        title_en: data?.title_en || "",
        subtitle_id: data?.subtitle_id || "",
        subtitle_en: data?.subtitle_en || "",
        primary_label_id: data?.primary_label_id || "",
        primary_label_en: data?.primary_label_en || "",
        primary_url: data?.primary_url || "#",
        secondary_label_id: data?.secondary_label_id || "",
        secondary_label_en: data?.secondary_label_en || "",
        secondary_url: data?.secondary_url || "#",
        is_active: 1,
      });
      if ((await CTA.getCTA()).title_id !== "AUDIT-CTA") throw new Error("cta tidak tersimpan");
      if (data) {
        await CTA.upsertCTA({ ...data, is_active: data.is_active ? 1 : 0, title_id: prev });
      }
      ok("cta", "upsert");
    } catch (e) {
      fail("cta", "upsert", e);
    }

    // FOOTER
    console.log("\n[footer]");
    try {
      const footer = await Footer.getFooter();
      if (!footer) throw new Error("site_footer id=1 tidak ada");
      const prev = footer.desc_id;
      await Footer.updateFooter({ ...footer, desc_id: "AUDIT-FT" });
      if ((await Footer.getFooter()).desc_id !== "AUDIT-FT") throw new Error("footer tidak tersimpan");
      await Footer.updateFooter({ ...footer, desc_id: prev });
      ok("footer", "update header");
    } catch (e) {
      fail("footer", "update header", e);
    }

    try {
      const id = await Footer.addQuickLink();
      await Footer.updateQuickLinks([
        { id, label_id: "Link", label_en: "Link", url: "/x", sort_order: 2, is_active: 1 },
      ]);
      const row = (await Footer.getQuickLinks()).find((x) => x.id === id);
      if (!row || row.label_id !== "Link") throw new Error("link tidak tersimpan");
      await Footer.deleteQuickLink(id);
      ok("footer", "add/update/delete link");
    } catch (e) {
      fail("footer", "links CRUD", e);
    }

    await conn.rollback();
    console.log("\nSemua perubahan uji di-rollback.");
  } catch (e) {
    await conn.rollback();
    console.error("Audit terhenti:", e);
  } finally {
    conn.release();
    await pool.end();
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n=== RINGKASAN: ${results.length - failed.length}/${results.length} lolos ===`);
  if (failed.length) {
    failed.forEach((f) => console.log(`  - ${f.mod} ${f.op}: ${f.extra}`));
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
