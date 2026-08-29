"use strict";

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { ensureCmsSchema } = require("../utils/schema");
const { closePool } = require("../utils/db");

ensureCmsSchema()
  .then(() => {
    console.log("Skema CMS siap (CREATE TABLE IF NOT EXISTS + seed id=1).");
  })
  .catch((err) => {
    console.error("Gagal menyiapkan skema:", err);
    process.exitCode = 1;
  })
  .finally(() => closePool());
