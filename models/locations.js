"use strict";

const { getPool } = require("../utils/db");

/* ===== Header ===== */
async function getLocationsHeader() {
  const pool = getPool();
  const [rows] = await pool.query(`SELECT * FROM site_locations WHERE id=1 LIMIT 1`);
  return rows[0] || null;
}

async function updateLocationsHeader(payload) {
  const pool = getPool();
  await pool.query(
    `UPDATE site_locations
     SET badge_id=?, badge_en=?, title_id=?, title_en=?,
         subtitle_id=?, subtitle_en=?
     WHERE id=1 LIMIT 1`,
    [
      payload.badge_id || "",
      payload.badge_en || "",
      payload.title_id || "",
      payload.title_en || "",
      payload.subtitle_id || "",
      payload.subtitle_en || "",
    ]
  );
}

/* ===== Items ===== */
async function getLocationItems() {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT * FROM site_location_items
     ORDER BY sort_order ASC, id ASC`
  );
  return rows;
}

async function addLocationItem() {
  const pool = getPool();
  const [res] = await pool.query(
    `INSERT INTO site_location_items
     (title_id, title_en, icon_key, accent, sort_order, is_active)
     VALUES ('', '', 'custom', 'orange', 999, 1)`
  );
  return res.insertId;
}

async function updateLocationItems(items) {
  const pool = getPool();
  for (const it of items) {
    await pool.query(
      `UPDATE site_location_items
       SET title_id=?, title_en=?, icon_key=?, accent=?, sort_order=?, is_active=?
       WHERE id=? LIMIT 1`,
      [
        it.title_id || "",
        it.title_en || "",
        it.icon_key || "custom",
        it.accent || "orange",
        Number(it.sort_order || 0),
        it.is_active ? 1 : 0,
        Number(it.id),
      ]
    );
  }
}

async function deleteLocationItem(id) {
  const pool = getPool();
  await pool.query(`DELETE FROM site_location_items WHERE id=? LIMIT 1`, [Number(id)]);
}

module.exports = {
  getLocationsHeader,
  updateLocationsHeader,
  getLocationItems,
  addLocationItem,
  updateLocationItems,
  deleteLocationItem,
};
