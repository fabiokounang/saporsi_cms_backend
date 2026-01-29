"use strict";

const { getPool } = require("../utils/db");

async function getNavbarSettings() {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT id, logo_path, cta_label_id, cta_label_en, cta_url, show_language_toggle
     FROM site_navbar
     WHERE id = :id`,
    { id: 1 }
  );
  return rows[0] || null;
}

async function updateNavbarSettings(payload) {
  const pool = getPool();
  await pool.query(
    `UPDATE site_navbar
      SET
        logo_path = COALESCE(NULLIF(:logo_path, ''), logo_path),
        cta_label_id = COALESCE(NULLIF(:cta_label_id, ''), cta_label_id),
        cta_label_en = COALESCE(NULLIF(:cta_label_en, ''), cta_label_en),
        cta_url = COALESCE(NULLIF(:cta_url, ''), cta_url),
        show_language_toggle = COALESCE(NULLIF(:show_language_toggle, ''), show_language_toggle)
      WHERE id = :id;
`,
    {
      id: 1,
      logo_path: payload.logo_path || "",
      cta_label_id: payload.cta_label_id || "Pesan Mesin",
      cta_label_en: payload.cta_label_en || "Order Machine",
      cta_url: payload.cta_url || "#",
      show_language_toggle: payload.show_language_toggle ? 1 : 0,
    }
  );
}

async function getNavbarItems() {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT id, label_id, label_en, url, sort_order, is_active
     FROM site_navbar_items
     ORDER BY sort_order ASC, id ASC`
  );
  return rows;
}

async function addNavbarItem() {
  const pool = getPool();
  const [result] = await pool.query(
    `INSERT INTO site_navbar_items (label_id, label_en, url, sort_order, is_active)
     VALUES (:label_id, :label_en, :url, :sort_order, :is_active)`,
    {
      label_id: "Menu Baru",
      label_en: "New Menu",
      url: "#",
      sort_order: 999,
      is_active: 1,
    }
  );
  return result.insertId;
}

async function deleteNavbarItem(id) {
  const pool = getPool();
  await pool.query(
    `DELETE FROM site_navbar_items
     WHERE id = :id`,
    { id: Number(id) }
  );
}

async function updateNavbarItems(items) {
  const pool = getPool();

  // update satu-satu (simple & aman)
  for (const it of items) {
    await pool.query(
      `UPDATE site_navbar_items
       SET label_id = :label_id,
           label_en = :label_en,
           url = :url,
           sort_order = :sort_order,
           is_active = :is_active
       WHERE id = :id`,
      {
        id: Number(it.id),
        label_id: String(it.label_id || "").trim(),
        label_en: String(it.label_en || "").trim(),
        url: String(it.url || "").trim(),
        sort_order: Number(it.sort_order || 0),
        is_active: it.is_active ? 1 : 0,
      }
    );
  }
}

module.exports = {
  getNavbarSettings,
  updateNavbarSettings,
  getNavbarItems,
  addNavbarItem,
  deleteNavbarItem,
  updateNavbarItems,
};
