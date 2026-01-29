"use strict";

const { getPool } = require("../utils/db");

/* ===== Header ===== */
async function getAbout() {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT * FROM site_about WHERE id = 1 LIMIT 1`
  );
  return rows[0] || null;
}

async function updateAbout(payload) {
  const pool = getPool();
  await pool.query(
    `UPDATE site_about
     SET badge_id=?, badge_en=?, title_id=?, title_en=?,
         description_id=?, description_en=?
     WHERE id=1 LIMIT 1`,
    [
      payload.badge_id || "",
      payload.badge_en || "",
      payload.title_id || "",
      payload.title_en || "",
      payload.description_id || "",
      payload.description_en || "",
    ]
  );
}

/* ===== Cards (Visi/Misi) ===== */
async function getCards() {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT * FROM site_about_cards
     ORDER BY sort_order ASC, id ASC`
  );
  return rows;
}

async function addCard() {
  const pool = getPool();
  const [res] = await pool.query(
    `INSERT INTO site_about_cards
     (card_type, title_id, title_en, description_id, description_en, theme, icon_key, sort_order, is_active)
     VALUES ('', '', '', '', '', 'orange', 'custom', 999, 1)`
  );
  return res.insertId;
}

async function updateCards(items) {
  const pool = getPool();
  for (const it of items) {
    await pool.query(
      `UPDATE site_about_cards
       SET card_type=?, title_id=?, title_en=?, description_id=?, description_en=?,
           theme=?, icon_key=?, sort_order=?, is_active=?
       WHERE id=? LIMIT 1`,
      [
        it.card_type || "",
        it.title_id || "",
        it.title_en || "",
        it.description_id || "",
        it.description_en || "",
        it.theme || "orange",
        it.icon_key || "",
        Number(it.sort_order || 0),
        it.is_active ? 1 : 0,
        Number(it.id),
      ]
    );
  }
}

async function deleteCard(id) {
  const pool = getPool();
  await pool.query(`DELETE FROM site_about_cards WHERE id=? LIMIT 1`, [Number(id)]);
}

/* ===== Points (4 kecil) ===== */
async function getPoints() {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT * FROM site_about_points
     ORDER BY sort_order ASC, id ASC`
  );
  return rows;
}

async function addPoint() {
  const pool = getPool();
  const [res] = await pool.query(
    `INSERT INTO site_about_points
     (title_id, title_en, description_id, description_en, icon_key, sort_order, is_active)
     VALUES ('', '', '', '', 'custom', 999, 1)`
  );
  return res.insertId;
}

async function updatePoints(items) {
  const pool = getPool();
  for (const it of items) {
    await pool.query(
      `UPDATE site_about_points
       SET title_id=?, title_en=?, description_id=?, description_en=?,
           icon_key=?, sort_order=?, is_active=?
       WHERE id=? LIMIT 1`,
      [
        it.title_id || "",
        it.title_en || "",
        it.description_id || "",
        it.description_en || "",
        it.icon_key || "",
        Number(it.sort_order || 0),
        it.is_active ? 1 : 0,
        Number(it.id),
      ]
    );
  }
}

async function deletePoint(id) {
  const pool = getPool();
  await pool.query(`DELETE FROM site_about_points WHERE id=? LIMIT 1`, [Number(id)]);
}

module.exports = {
  getAbout,
  updateAbout,

  getCards,
  addCard,
  updateCards,
  deleteCard,

  getPoints,
  addPoint,
  updatePoints,
  deletePoint,
};
