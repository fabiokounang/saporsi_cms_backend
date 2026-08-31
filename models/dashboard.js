"use strict";

const { getPool } = require("../utils/db");

const COUNTS = [
  { key: "navbar", label: "Navbar", href: "/admin/navbar", table: "site_navbar_items", active: "is_active" },
  { key: "home", label: "Home", href: "/admin/home", table: "hero_images", active: "is_active" },
  { key: "about", label: "About", href: "/admin/about", table: "site_about_cards", active: "is_active" },
  { key: "services", label: "Services", href: "/admin/services", table: "site_services_items", active: "is_active" },
  { key: "hiw", label: "How It Works", href: "/admin/how-it-works", table: "site_how_it_works_items", active: "is_active" },
  { key: "gallery", label: "Gallery", href: "/admin/gallery", table: "site_gallery_items", active: "is_active" },
  { key: "locations", label: "Location", href: "/admin/locations", table: "site_location_items", active: "is_active" },
  { key: "partners", label: "Partners", href: "/admin/partners", table: "site_partner_items", active: "is_active" },
  { key: "early", label: "Early Program", href: "/admin/early-program", table: "site_early_program_benefits", active: "is_active" },
  { key: "contact", label: "Contact", href: "/admin/contact", table: "site_contact_steps", active: "is_active" },
  { key: "footer", label: "Footer", href: "/admin/footer", table: "site_footer_quick_links", active: "is_active" },
];

const HEADERS = [
  { key: "navbar", label: "Navbar", href: "/admin/navbar", table: "site_navbar", fields: ["cta_label_id", "logo_path"] },
  { key: "home", label: "Home", href: "/admin/home", table: "hero", fields: ["title_id", "title_en"] },
  { key: "about", label: "About", href: "/admin/about", table: "site_about", fields: ["title_id", "title_en"] },
  { key: "services", label: "Services", href: "/admin/services", table: "site_services", fields: ["title_id", "title_en"] },
  { key: "hiw", label: "How It Works", href: "/admin/how-it-works", table: "site_how_it_works", fields: ["title_id", "title_en"] },
  { key: "gallery", label: "Gallery", href: "/admin/gallery", table: "site_gallery", fields: ["title_id", "title_en"] },
  { key: "locations", label: "Location", href: "/admin/locations", table: "site_locations", fields: ["title_id", "title_en"] },
  { key: "partners", label: "Partners", href: "/admin/partners", table: "site_partners", fields: ["title_id", "title_en"] },
  { key: "early", label: "Early Program", href: "/admin/early-program", table: "site_early_program", fields: ["title_id", "title_en"] },
  { key: "contact", label: "Contact", href: "/admin/contact", table: "site_contact", fields: ["title_id", "title_en"] },
  { key: "cta", label: "CTA", href: "/admin/cta", table: "site_cta", fields: ["title_id", "title_en"] },
  { key: "footer", label: "Footer", href: "/admin/footer", table: "site_footer", fields: ["desc_id", "copyright_id"] },
];

async function countRows(table, activeCol) {
  const pool = getPool();
  try {
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS total,
              COALESCE(SUM(CASE WHEN \`${activeCol}\` = 1 THEN 1 ELSE 0 END), 0) AS active
         FROM \`${table}\``
    );
    return {
      total: Number(rows[0].total) || 0,
      active: Number(rows[0].active) || 0,
    };
  } catch {
    return { total: 0, active: 0 };
  }
}

async function headerReady(table, fields) {
  const pool = getPool();
  try {
    const [rows] = await pool.query(`SELECT * FROM \`${table}\` LIMIT 1`);
    const row = rows[0];
    if (!row) return false;
    return fields.some((field) => String(row[field] || "").trim());
  } catch {
    return false;
  }
}

async function getDashboardStats() {
  const counted = await Promise.all(
    COUNTS.map(async (item) => {
      const counts = await countRows(item.table, item.active);
      return {
        key: item.key,
        label: item.label,
        href: item.href,
        total: counts.total,
        active: counts.active,
      };
    })
  );
  const modules = counted;

  const readiness = await Promise.all(
    HEADERS.map(async (header) => {
      const filled = await headerReady(header.table, header.fields);
      const items = modules.find((m) => m.key === header.key);
      const hasItems = !items || items.total > 0;
      return {
        key: header.key,
        label: header.label,
        href: header.href,
        ready: filled && hasItems,
      };
    })
  );

  const totalItems = modules.reduce((sum, m) => sum + m.total, 0);
  const activeItems = modules.reduce((sum, m) => sum + m.active, 0);
  const readyCount = readiness.filter((m) => m.ready).length;
  const emptyCount = readiness.length - readyCount;
  const completeness = readiness.length ? Math.round((readyCount / readiness.length) * 100) : 0;
  const media =
    (modules.find((m) => m.key === "home")?.total || 0) +
    (modules.find((m) => m.key === "gallery")?.total || 0);
  const needsWork = readiness.filter((m) => !m.ready);

  return {
    totalItems,
    activeItems,
    media,
    completeness,
    readyCount,
    emptyCount,
    modules,
    readiness,
    needsWork,
  };
}

module.exports = { getDashboardStats };
