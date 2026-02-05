const { getPool } = require("../utils/db");

async function getHeader() {
  const pool = getPool();
  const [rows] = await pool.execute(
    `SELECT
      id,
      label_id, label_en,
      title_id, title_en,
      desc_id, desc_en,

      highlight_title_id, highlight_title_en,
      highlight_desc_id, highlight_desc_en,

      benefits_title_id, benefits_title_en,

      cta_primary_id, cta_primary_en, cta_primary_url,
      cta_secondary_id, cta_secondary_en, cta_secondary_url,

      right_title_id, right_title_en,
      right_badge_id, right_badge_en,
      right_desc_id, right_desc_en,

      kpi1_label_id, kpi1_label_en, kpi1_value_id, kpi1_value_en,
      kpi2_label_id, kpi2_label_en, kpi2_value_id, kpi2_value_en,
      kpi3_label_id, kpi3_label_en, kpi3_value_id, kpi3_value_en,
      kpi4_label_id, kpi4_label_en, kpi4_value_id, kpi4_value_en,

      note_title_id, note_title_en, note_desc_id, note_desc_en,

      right_cta_primary_id, right_cta_primary_en, right_cta_primary_url,

      whatsapp_url,

      float_title_id, float_title_en,
      float_sub_id, float_sub_en,

      updated_at
    FROM site_early_program
    WHERE id = ?`,
    [1]
  );
  return rows[0] || null;
}

async function updateHeader(p) {
  const pool = getPool();
  await pool.execute(
    `UPDATE site_early_program SET
      label_id=?, label_en=?,
      title_id=?, title_en=?,
      desc_id=?, desc_en=?,

      highlight_title_id=?, highlight_title_en=?,
      highlight_desc_id=?, highlight_desc_en=?,

      benefits_title_id=?, benefits_title_en=?,

      cta_primary_id=?, cta_primary_en=?, cta_primary_url=?,
      cta_secondary_id=?, cta_secondary_en=?, cta_secondary_url=?,

      right_title_id=?, right_title_en=?,
      right_badge_id=?, right_badge_en=?,
      right_desc_id=?, right_desc_en=?,

      kpi1_label_id=?, kpi1_label_en=?, kpi1_value_id=?, kpi1_value_en=?,
      kpi2_label_id=?, kpi2_label_en=?, kpi2_value_id=?, kpi2_value_en=?,
      kpi3_label_id=?, kpi3_label_en=?, kpi3_value_id=?, kpi3_value_en=?,
      kpi4_label_id=?, kpi4_label_en=?, kpi4_value_id=?, kpi4_value_en=?,

      note_title_id=?, note_title_en=?, note_desc_id=?, note_desc_en=?,

      right_cta_primary_id=?, right_cta_primary_en=?, right_cta_primary_url=?,

      whatsapp_url=?,

      float_title_id=?, float_title_en=?,
      float_sub_id=?, float_sub_en=?
    WHERE id = ?`,
    [
      p.label_id, p.label_en,
      p.title_id, p.title_en,
      p.desc_id, p.desc_en,

      p.highlight_title_id, p.highlight_title_en,
      p.highlight_desc_id, p.highlight_desc_en,

      p.benefits_title_id, p.benefits_title_en,

      p.cta_primary_id, p.cta_primary_en, p.cta_primary_url,
      p.cta_secondary_id, p.cta_secondary_en, p.cta_secondary_url,

      p.right_title_id, p.right_title_en,
      p.right_badge_id, p.right_badge_en,
      p.right_desc_id, p.right_desc_en,

      p.kpi1_label_id, p.kpi1_label_en, p.kpi1_value_id, p.kpi1_value_en,
      p.kpi2_label_id, p.kpi2_label_en, p.kpi2_value_id, p.kpi2_value_en,
      p.kpi3_label_id, p.kpi3_label_en, p.kpi3_value_id, p.kpi3_value_en,
      p.kpi4_label_id, p.kpi4_label_en, p.kpi4_value_id, p.kpi4_value_en,

      p.note_title_id, p.note_title_en, p.note_desc_id, p.note_desc_en,

      p.right_cta_primary_id, p.right_cta_primary_en, p.right_cta_primary_url,

      p.whatsapp_url,

      p.float_title_id, p.float_title_en,
      p.float_sub_id, p.float_sub_en,

      1
    ]
  );
}

async function listBenefits() {
  const pool = getPool();
  const [rows] = await pool.execute(
    `SELECT
      id, program_id,
      title_id, title_en,
      description_id, description_en,
      icon_path,
      accent,
      sort_order,
      is_active,
      created_at
    FROM site_early_program_benefits
    WHERE program_id = ?
    ORDER BY sort_order ASC, id ASC`,
    [1]
  );
  return rows;
}

async function addBenefit() {
  const pool = getPool();
  const [result] = await pool.execute(
    `INSERT INTO site_early_program_benefits
      (program_id, title_id, title_en, description_id, description_en, icon_path, accent, sort_order, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [1, "", "", "", "", null, "orange", 999, 1]
  );
  return result.insertId;
}

// bulk upsert (no looping insert)
async function upsertBenefits(items) {
  const pool = getPool();
  if (!items || !items.length) return;

  const values = items.map((it) => [
    Number(it.id),
    1,
    it.title_id ?? "",
    it.title_en ?? "",
    it.description_id ?? "",
    it.description_en ?? "",
    it.icon_path ?? null,
    it.accent ?? "orange",
    Number(it.sort_order ?? 999),
    it.is_active ? 1 : 0,
  ]);

  await pool.query(
    `INSERT INTO site_early_program_benefits
      (id, program_id, title_id, title_en, description_id, description_en, icon_path, accent, sort_order, is_active)
     VALUES ?
     ON DUPLICATE KEY UPDATE
      title_id=VALUES(title_id),
      title_en=VALUES(title_en),
      description_id=VALUES(description_id),
      description_en=VALUES(description_en),
      icon_path=VALUES(icon_path),
      accent=VALUES(accent),
      sort_order=VALUES(sort_order),
      is_active=VALUES(is_active)`,
    [values]
  );
}

async function getBenefitById(id) {
  const pool = getPool();
  const [rows] = await pool.execute(
    `SELECT id, icon_path FROM site_early_program_benefits WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function deleteBenefit(id) {
  const pool = getPool();
  await pool.execute(`DELETE FROM site_early_program_benefits WHERE id = ?`, [id]);
}

module.exports = {
  getHeader,
  updateHeader,
  listBenefits,
  addBenefit,
  upsertBenefits,
  getBenefitById,
  deleteBenefit,
};
