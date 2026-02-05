"use strict";
const { getPool } = require("../utils/db");

async function getHeader() {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT id, badge_id, badge_en, title_id, title_en, subtitle_id, subtitle_en
     FROM site_how_it_works
     WHERE id = ?
     LIMIT ?`,
    [1, 1]
  );
  return rows[0] || null;
}

async function updateHeader(payload) {
  const pool = getPool();
  await pool.query(
    `UPDATE site_how_it_works
     SET badge_id=?, badge_en=?, title_id=?, title_en=?, subtitle_id=?, subtitle_en=?
     WHERE id=? LIMIT ?`,
    [
      payload.badge_id,
      payload.badge_en,
      payload.title_id,
      payload.title_en,
      payload.subtitle_id,
      payload.subtitle_en,
      1,
      1,
    ]
  );
}

async function getItems() {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT id, title_id, title_en, description_id, description_en,
            icon_path, sort_order, is_active
     FROM site_how_it_works_items
     ORDER BY sort_order ASC`,
    [1]
  );
  return rows;
}

async function addItem() {
  const pool = getPool();
  await pool.query(
    `INSERT INTO site_how_it_works_items (id)
     VALUES (?)`,
    [1]
  );
}

async function updateItems(items) {
  const pool = getPool();

  for (const it of items) {
    await pool.query(
      `UPDATE site_how_it_works_items
       SET title_id=?, title_en=?, description_id=?, description_en=?,
           icon_path=?, sort_order=?, is_active=?
       WHERE id=?`,
      [
        it.title_id,
        it.title_en,
        it.description_id,
        it.description_en,
        it.icon_path,
        it.sort_order,
        it.is_active ? 1 : 0,
        it.id,
      ]
    );
  }
}

async function deleteItem(id) {
  const pool = getPool();
  await pool.query(
    `DELETE FROM site_how_it_works_items WHERE id=? LIMIT ?`,
    [id, 1]
  );
}

module.exports = {
  getHeader,
  updateHeader,
  getItems,
  addItem,
  updateItems,
  deleteItem,
};
