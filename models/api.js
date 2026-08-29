// models/publicSite.js
"use strict";

const { getPool } = require("../utils/db");

/**
 * NOTE:
 * - Pakai SELECT * supaya tidak salah nama kolom.
 * - Kalau kamu punya kolom sorting (misal order_no / sort_order), nanti bisa kita ganti ORDER BY nya.
 * - Untuk table “single row config”, asumsi ambil row pertama (LIMIT 1).
 */

async function oneRow(table) {
  const pool = getPool();
  const [rows] = await pool.query(`SELECT * FROM \`${table}\` LIMIT ?`, [1]);
  return rows[0] || null;
}

async function listRows(table) {
  const pool = getPool();
  // default order by id asc (paling aman)
  const [rows] = await pool.query(`SELECT * FROM \`${table}\` ORDER BY id ASC`);
  return rows || [];
}

async function safeOne(table) {
  try {
    return await oneRow(table);
  } catch (err) {
    console.error(`public site: ${table}:`, err.message);
    return null;
  }
}

async function safeList(table) {
  try {
    return await listRows(table);
  } catch (err) {
    console.error(`public site: ${table}:`, err.message);
    return [];
  }
}

async function getAll() {
  const [
    navbar,
    navbar_items,

    hero,
    hero_images,

    about,
    about_cards,
    about_points,

    services,
    services_items,

    howitworks,
    howitworksitems,

    gallery,
    gallery_items,

    locations,
    location_items,

    partners,
    partner_items,

    earlyprogram,
    earlyprogram_items,

    contact,
    contact_steps,

    cta,

    footer,
    footer_quick_links,
  ] = await Promise.all([
    safeOne("site_navbar"),
    safeList("site_navbar_items"),

    safeOne("hero"),
    safeList("hero_images"),

    safeOne("site_about"),
    safeList("site_about_cards"),
    safeList("site_about_points"),

    safeOne("site_services"),
    safeList("site_services_items"),

    safeOne("site_how_it_works"),
    safeList("site_how_it_works_items"),

    safeOne("site_gallery"),
    safeList("site_gallery_items"),

    safeOne("site_locations"),
    safeList("site_location_items"),

    safeOne("site_partners"),
    safeList("site_partner_items"),

    safeOne("site_early_program"),
    safeList("site_early_program_benefits"),

    safeOne("site_contact"),
    safeList("site_contact_steps"),

    safeOne("site_cta"),

    safeOne("site_footer"),
    safeList("site_footer_quick_links"),
  ]);

  return {
    navbar: {
      ...navbar,
      items: navbar_items,
    },

    hero: {
      ...hero,
      images: hero_images,
    },

    about: {
      ...about,
      cards: about_cards,
      points: about_points,
    },

    services: {
      ...services,
      items: services_items,
    },

    howitworks: {
      ...howitworks,
      items: howitworksitems
    },

    gallery: {
      ...gallery,
      items: gallery_items,
    },

    locations: {
      ...locations,
      items: location_items,
    },

    partners: {
      ...partners,
      items: partner_items,
    },

    earlyprogram: {
      ...earlyprogram,
      items: earlyprogram_items,
    },

    contact: {
      ...contact,
      items: contact_steps
    },
    cta: cta,

    footer: {
      ...footer,
      quick_links: footer_quick_links,
    },
  };
}

module.exports = { getAll };
