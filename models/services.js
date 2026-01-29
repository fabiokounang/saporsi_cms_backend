"use strict";

const { getPool } = require("../utils/db");

/* ===== Header ===== */
async function getServicesHeader() {
  const pool = getPool();
  const [rows] = await pool.query(`SELECT * FROM site_services WHERE id=1 LIMIT 1`);
  return rows[0] || null;
}

async function updateServicesHeader(payload) {
  const pool = getPool();
  await pool.query(
    `UPDATE site_services
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
async function getServicesItems() {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT * FROM site_services_items
     ORDER BY sort_order ASC, id ASC`
  );
  return rows;
}

async function addServiceItem() {
  const pool = getPool();
  const [res] = await pool.query(
    `INSERT INTO site_services_items
     (title_id, title_en, description_id, description_en, icon_key, accent, sort_order, is_active)
     VALUES ('', '', '', '', 'custom', 'orange', 999, 1)`
  );
  return res.insertId;
}

async function updateServiceItems(items) {
  const pool = getPool();
  for (const it of items) {
    await pool.query(
      `UPDATE site_services_items
       SET title_id=?, title_en=?, description_id=?, description_en=?,
           icon_key=?, accent=?, sort_order=?, is_active=?
       WHERE id=? LIMIT 1`,
      [
        it.title_id || "",
        it.title_en || "",
        it.description_id || "",
        it.description_en || "",
        it.icon_key || "custom",
        it.accent || "orange",
        Number(it.sort_order || 0),
        it.is_active ? 1 : 0,
        Number(it.id),
      ]
    );
  }
}

async function deleteServiceItem(id) {
  const pool = getPool();
  await pool.query(`DELETE FROM site_services_items WHERE id=? LIMIT 1`, [Number(id)]);
}

module.exports = {
  getServicesHeader,
  updateServicesHeader,

  getServicesItems,
  addServiceItem,
  updateServiceItems,
  deleteServiceItem,
};
