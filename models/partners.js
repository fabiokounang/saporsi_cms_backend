"use strict";
const { getPool } = require("../utils/db");

/* HEADER */
async function getPartnerHeader() {
  const pool = getPool();
  const [rows] = await pool.query(
    "SELECT * FROM site_partners WHERE id=1 LIMIT 1"
  );
  return rows[0];
}

async function updatePartnerHeader(data) {
  const pool = getPool();
  await pool.query(
    `UPDATE site_partners SET
      badge_id=?, badge_en=?, title_id=?, title_en=?,
      subtitle_id=?, subtitle_en=?,
      cta_label_id=?, cta_label_en=?, cta_url=?
     WHERE id=1 LIMIT 1`,
    [
      data.badge_id, data.badge_en,
      data.title_id, data.title_en,
      data.subtitle_id, data.subtitle_en,
      data.cta_label_id, data.cta_label_en,
      data.cta_url
    ]
  );
}

/* ITEMS */
async function getPartnerItems() {
  const pool = getPool();
  const [rows] = await pool.query(
    "SELECT * FROM site_partner_items ORDER BY sort_order ASC"
  );
  return rows;
}

async function addPartnerItem(data) {
  const pool = getPool();
  await pool.query(
    `INSERT INTO site_partner_items
     (name_id, name_en, logo_path, sort_order, is_active)
     VALUES (?,?,?,?,1)`,
    [data.name_id, data.name_en, data.logo_path, data.sort_order]
  );
}

async function updatePartnerItem(data) {
  const pool = getPool();
  await pool.query(
    `UPDATE site_partner_items SET
     name_id=?, name_en=?, logo_path=?, sort_order=?, is_active=?
     WHERE id=? LIMIT 1`,
    [
      data.name_id, data.name_en, data.logo_path,
      data.sort_order, data.is_active, data.id
    ]
  );
}

async function deletePartnerItem(id) {
  const pool = getPool();
  await pool.query("DELETE FROM site_partner_items WHERE id=? LIMIT 1", [id]);
}

module.exports = {
  getPartnerHeader,
  updatePartnerHeader,
  getPartnerItems,
  addPartnerItem,
  updatePartnerItem,
  deletePartnerItem
};
