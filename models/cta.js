const { getPool } = require("../utils/db"); // sesuaikan dengan project kamu

async function getCTA() {
  const pool = getPool();
  const [rows] = await pool.query(`
    SELECT
      id,
      badge_id, badge_en,
      title_id, title_en,
      subtitle_id, subtitle_en,
      primary_label_id, primary_label_en, primary_url,
      secondary_label_id, secondary_label_en, secondary_url,
      is_active,
      updated_at
    FROM site_cta
    WHERE id = 1
    LIMIT 1
  `);

  return rows[0] || null;
}

async function upsertCTA(p) {
  const pool = getPool();
  await pool.query(
    `
    INSERT INTO site_cta (
      id,
      badge_id, badge_en,
      title_id, title_en,
      subtitle_id, subtitle_en,
      primary_label_id, primary_label_en, primary_url,
      secondary_label_id, secondary_label_en, secondary_url,
      is_active
    )
    VALUES (
      ?, ?, ?,
      ?, ?,
      ?, ?,
      ?, ?, ?,
      ?, ?, ?,
      ?
    )
    ON DUPLICATE KEY UPDATE
      badge_id = VALUES(badge_id),
      badge_en = VALUES(badge_en),
      title_id = VALUES(title_id),
      title_en = VALUES(title_en),
      subtitle_id = VALUES(subtitle_id),
      subtitle_en = VALUES(subtitle_en),
      primary_label_id = VALUES(primary_label_id),
      primary_label_en = VALUES(primary_label_en),
      primary_url = VALUES(primary_url),
      secondary_label_id = VALUES(secondary_label_id),
      secondary_label_en = VALUES(secondary_label_en),
      secondary_url = VALUES(secondary_url),
      is_active = VALUES(is_active)
    `,
    [
      p.id,
      p.badge_id, p.badge_en,
      p.title_id, p.title_en,
      p.subtitle_id, p.subtitle_en,
      p.primary_label_id, p.primary_label_en, p.primary_url,
      p.secondary_label_id, p.secondary_label_en, p.secondary_url,
      p.is_active,
    ]
  );
}

module.exports = {
  getCTA,
  upsertCTA,
};
