"use strict";
const { getPool } = require("../utils/db");

async function getFooter() {
  const pool = getPool();
  const [rows] = await pool.query(`SELECT * FROM site_footer WHERE id=1 LIMIT 1`);
  return rows[0] || null;
}

async function updateFooter(payload) {
  const pool = getPool();
  await pool.query(
    `UPDATE site_footer SET
      desc_id=?, desc_en=?,
      contact_email=?, contact_phone=?,
      contact_location_id=?, contact_location_en=?,
      copyright_id=?, copyright_en=?
     WHERE id=1 LIMIT 1`,
    [
      payload.desc_id || "",
      payload.desc_en || "",
      payload.contact_email || "",
      payload.contact_phone || "",
      payload.contact_location_id || "",
      payload.contact_location_en || "",
      payload.copyright_id || "",
      payload.copyright_en || "",
    ]
  );
}

async function getQuickLinks() {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT * FROM site_footer_quick_links
     ORDER BY sort_order ASC, id ASC`
  );
  return rows;
}

async function addQuickLink() {
  const pool = getPool();
  const [res] = await pool.query(
    `INSERT INTO site_footer_quick_links
     (label_id,label_en,url,sort_order,is_active)
     VALUES ('','','#',999,1)`
  );
  return res.insertId;
}

async function updateQuickLinks(items) {
  const pool = getPool();
  for (const it of items) {
    await pool.query(
      `UPDATE site_footer_quick_links
       SET label_id=?, label_en=?, url=?, sort_order=?, is_active=?
       WHERE id=? LIMIT 1`,
      [
        it.label_id || "",
        it.label_en || "",
        it.url || "#",
        Number(it.sort_order || 0),
        it.is_active ? 1 : 0,
        Number(it.id),
      ]
    );
  }
}

async function deleteQuickLink(id) {
  const pool = getPool();
  await pool.query(`DELETE FROM site_footer_quick_links WHERE id=? LIMIT 1`, [Number(id)]);
}

module.exports = {
  getFooter,
  updateFooter,
  getQuickLinks,
  addQuickLink,
  updateQuickLinks,
  deleteQuickLink,
};
