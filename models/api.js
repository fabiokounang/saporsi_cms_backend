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
  const [rows] = await pool.query(`SELECT * FROM \`${table}\` LIMIT 1`);
  return rows[0] || null;
}

async function listRows(table) {
  const pool = getPool();
  // default order by id asc (paling aman)
  const [rows] = await pool.query(`SELECT * FROM \`${table}\` ORDER BY id ASC`);
  return rows || [];
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

    gallery,
    gallery_items,

    locations,
    location_items,

    partners,
    partner_items,

    footer,
    footer_quick_links,
  ] = await Promise.all([
    oneRow("site_navbar"),
    listRows("site_navbar_items"),

    oneRow("hero"),
    listRows("hero_images"),

    oneRow("site_about"),
    listRows("site_about_cards"),
    listRows("site_about_points"),

    oneRow("site_services"),
    listRows("site_services_items"),

    oneRow("site_gallery"),
    listRows("site_gallery_items"),

    oneRow("site_locations"),
    listRows("site_location_items"),

    oneRow("site_partners"),
    listRows("site_partner_items"),

    oneRow("site_footer"),
    listRows("site_footer_quick_links"),
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

    footer: {
      ...footer,
      quick_links: footer_quick_links,
    },
  };
}

module.exports = { getAll };
