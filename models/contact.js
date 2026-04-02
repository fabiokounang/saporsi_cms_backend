// models/contact.js
const { getPool } = require("../utils/db"); // pool mysql2/promise

async function getContactHeader() {
  const pool = getPool();
  const sql = `
    SELECT
      id,
      badge_id, badge_en,
      title_id, title_en,
      subtitle_id, subtitle_en,
      steps_title_id, steps_title_en,
      button_label_id, button_label_en,
      updated_at
    FROM site_contact
    ORDER BY id ASC
  `;
  const [rows] = await pool.query(sql, []);
  return rows[0] || null;
}

async function updateContactHeader(payload) {
  const pool = getPool();
  const sql = `
    UPDATE site_contact
    SET
      badge_id = ?,
      badge_en = ?,
      title_id = ?,
      title_en = ?,
      subtitle_id = ?,
      subtitle_en = ?,
      steps_title_id = ?,
      steps_title_en = ?,
      button_label_id = ?,
      button_label_en = ?
    WHERE id = ?
  `;
  const params = [
    payload.badge_id,
    payload.badge_en,
    payload.title_id,
    payload.title_en,
    payload.subtitle_id,
    payload.subtitle_en,
    payload.steps_title_id,
    payload.steps_title_en,
    payload.button_label_id,
    payload.button_label_en,
    payload.id,
  ];
  await pool.query(sql, params);
}

async function listContactSteps(contactId) {
  const pool = getPool();
  const sql = `
    SELECT
      id, contact_id,
      text_id, text_en,
      sort_order, is_active,
      created_at
    FROM site_contact_steps
    WHERE contact_id = ?
    ORDER BY sort_order ASC, id ASC
  `;
  const [rows] = await pool.query(sql, [contactId]);
  return rows || [];
}

async function addContactStep(contactId) {
  const pool = getPool();
  const sql = `
    INSERT INTO site_contact_steps (contact_id, text_id, text_en, sort_order, is_active)
    VALUES (?, ?, ?, ?, ?)
  `;
  const params = [contactId, "New step (ID)", "New step (EN)", 999, 1];
  await pool.query(sql, params);
}

async function updateContactSteps(items) {
  const pool = getPool();
  // items: [{id, text_id, text_en, sort_order, is_active}]
  if (!items || !items.length) return;

  const sql = `
    UPDATE site_contact_steps
    SET
      text_id = ?,
      text_en = ?,
      sort_order = ?,
      is_active = ?
    WHERE id = ?
  `;

  // simple loop update (ini bukan insert, rule “no looping insert” tetap aman)
  for (const it of items) {
    await pool.query(sql, [
      it.text_id,
      it.text_en,
      Number(it.sort_order ?? 0),
      it.is_active ? 1 : 0,
      it.id,
    ]);
  }
}

async function deleteContactStep(stepId) {
  const pool = getPool();
  const sql = `DELETE FROM site_contact_steps WHERE id = ?`;
  await pool.query(sql, [stepId]);
}

/**
 * PUBLIC: untuk endpoint /api/public/site
 */
async function getContactForPublic() {
  const pool = getPool();
  const header = await getContactHeader();
  if (!header) return null;
  const steps = await listContactSteps(header.id);
  return { ...header, steps };
}

module.exports = {
  getContactHeader,
  updateContactHeader,
  listContactSteps,
  addContactStep,
  updateContactSteps,
  deleteContactStep,
  getContactForPublic,
};
