// controllers/apiPublic.js
"use strict";

const PublicSite = require("../models/api");

async function getPublicSiteData(req, res, next) {
  try {
    const data = await PublicSite.getAll();

    // Cache header (optional)
    res.setHeader("Cache-Control", "public, max-age=60"); // 1 menit
    return res.json(data);
  } catch (err) {
    return next(err);
  }
}

module.exports = { getPublicSiteData };
