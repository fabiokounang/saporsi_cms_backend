"use strict";

const { getPool } = require("../utils/db");

/* ===== Header ===== */
async function getGalleryHeader() {
  const pool = getPool();
  const [rows] = await pool.query(`SELECT * FROM site_gallery WHERE id=1 LIMIT 1`);
  return rows[0] || null;
}

async function updateGalleryHeader(payload) {
  const pool = getPool();
  await pool.query(
    `UPDATE site_gallery
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
async function getGalleryItems() {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT * FROM site_gallery_items
     ORDER BY sort_order ASC, id ASC`
  );
  return rows;
}

async function addGalleryItem(payload) {
  const pool = getPool();
  const [res] = await pool.query(
    `INSERT INTO site_gallery_items
     (label_id, label_en, image_path, sort_order, is_active)
     VALUES (?, ?, ?, ?, ?)`,
    [
      payload.label_id || "",
      payload.label_en || "",
      payload.image_path || "",
      Number(payload.sort_order || 999),
      payload.is_active ? 1 : 0,
    ]
  );
  return res.insertId;
}

async function updateGalleryItem(payload) {
  const pool = getPool();
  await pool.query(
    `UPDATE site_gallery_items
     SET label_id=?, label_en=?, image_path=?, sort_order=?, is_active=?
     WHERE id=? LIMIT 1`,
    [
      payload.label_id || "",
      payload.label_en || "",
      payload.image_path || "",
      Number(payload.sort_order || 0),
      payload.is_active ? 1 : 0,
      Number(payload.id),
    ]
  );
}

async function deleteGalleryItem(id) {
  const pool = getPool();
  await pool.query(`DELETE FROM site_gallery_items WHERE id=? LIMIT 1`, [Number(id)]);
}

module.exports = {
  getGalleryHeader,
  updateGalleryHeader,

  getGalleryItems,
  addGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
};
