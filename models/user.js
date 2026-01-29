"use strict";

const { getPool } = require("../utils/db");

async function findUserByEmail(email) {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT id, name, email, password_hash, role, is_active
     FROM users
     WHERE email = :email
     LIMIT 1`,
    { email }
  );
  return rows[0] || null;
}

async function findUserById(id) {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT id, name, email, role, is_active
     FROM users
     WHERE id = :id
     LIMIT 1`,
    { id: Number(id) }
  );
  return rows[0] || null;
}

module.exports = {
  findUserByEmail,
  findUserById,
};
