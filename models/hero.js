"use strict";

const { getPool } = require("../utils/db");

async function getHero() {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT id, title_id, title_en, subtitle_id, subtitle_en, cta_label_id, cta_label_en, cta_url, badge_id, badge_en
     FROM hero
     WHERE id = :id`,
    { id: 1 }
  );
  return rows[0] || null;
}

async function updateHero(payload) {
  const pool = getPool();
  await pool.query(
    `UPDATE hero
     SET title_id = :title_id,
         title_en = :title_en,
         subtitle_id = :subtitle_id,
         subtitle_en = :subtitle_en,
         badge_id = :badge_id,
         badge_en = :badge_en,
         cta_label_id = :cta_label_id,
         cta_label_en = :cta_label_en,
         cta_url = :cta_url
     WHERE id = :id`,
    {
      id: 1,
      title_id: payload.title_id || "",
      title_en: payload.title_en || "",
      subtitle_id: payload.subtitle_id || "",
      subtitle_en: payload.subtitle_en || "",
      badge_id: payload.badge_id || "",
      badge_en: payload.badge_en || "",
      cta_label_id: payload.cta_label_id || "",
      cta_label_en: payload.cta_label_en || "",
      cta_url: payload.cta_url || "#",
    }
  );
}

async function getHeroImages() {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT id, image_path, sort_order, is_active
     FROM hero_images
     ORDER BY sort_order ASC, id DESC`
  );
  return rows;
}

async function addHeroImage(image_path) {
  const pool = getPool();
  const [maxRows] = await pool.query(
    `SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_order FROM hero_images`
  );
  const sort_order = Number(maxRows[0]?.next_order) || 1;
  const [result] = await pool.query(
    `INSERT INTO hero_images (image_path, sort_order, is_active)
     VALUES (:image_path, :sort_order, 1)`,
    { image_path, sort_order }
  );
  return result.insertId;
}

async function deleteHeroImage(id) {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT image_path FROM hero_images WHERE id = :id `,
    { id: Number(id) }
  );
  const imagePath = rows[0]?.image_path || null;

  await pool.query(
    `DELETE FROM hero_images WHERE id = :id LIMIT 1`,
    { id: Number(id) }
  );

  return imagePath; // buat hapus file di disk (optional di controller)
}

/** Express: 1 field = string, 2+ field dengan nama sama = array. */
function asList(value) {
  if (value == null || value === "") return [];
  return Array.isArray(value) ? value : [value];
}

async function updateHeroImages(hero) {
  const pool = getPool();
  const ids = asList(hero.image_id);
  const orders = asList(hero.sort_order);
  const activeIds = new Set(asList(hero.is_active).map((v) => String(v)));

  for (let i = 0; i < ids.length; i++) {
    const id = Number(ids[i]);
    if (!Number.isInteger(id) || id <= 0) continue;

    const rawOrder = Number(orders[i]);
    const sort_order = Number.isFinite(rawOrder) ? Math.trunc(rawOrder) : 999;
    const is_active = activeIds.has(String(id)) ? 1 : 0;

    await pool.query(
      `UPDATE hero_images SET sort_order = ?, is_active = ? WHERE id = ? LIMIT 1`,
      [sort_order, is_active, id]
    );
  }
}

module.exports = {
  getHero,
  updateHero,
  getHeroImages,
  addHeroImage,
  deleteHeroImage,
  updateHeroImages,
};
