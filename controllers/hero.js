"use strict";

const path = require("path");
const fs = require("fs");
const Hero = require("../models/hero");

function safeUnlink(publicPath) {
  // publicPath contoh: /public/uploads/hero/xxx.png
  if (!publicPath) return;

  const rel = publicPath.replace(/^\/public\//, "public/"); // -> public/uploads/...
  const abs = path.join(__dirname, "..", rel);

  fs.unlink(abs, (err) => {
    // ignore error (file mungkin sudah tidak ada)
    if (err) console.warn("UNLINK WARN:", err.message);
  });
}

async function renderHero(req, res) {
  const data = await Hero.getHero();
  const images = await Hero.getHeroImages();

  res.render("admin/hero", {
    user: req.user,
    data,
    images,
    saved: false,
    error: null,
  });
}

async function saveHero(req, res) {
  try {
    await Hero.updateHero({
      title_id: req.body.title_id,
      title_en: req.body.title_en,
      subtitle_id: req.body.subtitle_id,
      subtitle_en: req.body.subtitle_en,
      badge_id: req.body.badge_id,
      badge_en: req.body.badge_en,
      cta_label_id: req.body.cta_label_id,
      cta_label_en: req.body.cta_label_en,
      cta_url: req.body.cta_url,
    });

    const data = await Hero.getHero();
    const images = await Hero.getHeroImages();

    res.render("admin/hero", {
      user: req.user,
      data,
      images,
      saved: true,
      error: null,
    });
  } catch (err) {
    console.error(err);
    const data = await Hero.getHero();
    const images = await Hero.getHeroImages();

    res.render("admin/hero", {
      user: req.user,
      data,
      images,
      saved: false,
      error: "Gagal menyimpan Hero content",
    });
  }
}

async function addHeroImage(req, res) {
  try {
    if (!req.file) return res.redirect("/admin/hero");

    const image_path = `/uploads/hero/${req.file.filename}`;
    await Hero.addHeroImage(image_path);

    return res.redirect("/admin/hero");
  } catch (err) {
    return res.redirect("/admin/hero");
  }
}

async function saveHeroImages(req, res) {
  try {
    const id = req.body.image_id;
    const sort_order = req.body.sort_order;
    const is_active = req.body.is_active; // checkbox value = id
    await Hero.updateHeroImages(req.body);
    return res.redirect("/admin/hero");
  } catch (err) {
    return res.redirect("/admin/hero");
  }
}

async function removeHeroImage(req, res) {
  try {
    const imagePath = await Hero.deleteHeroImage(req.params.id);
    safeUnlink(imagePath);
    return res.redirect("/admin/hero");
  } catch (err) {
    console.error(err);
    return res.redirect("/admin/hero");
  }
}

module.exports = {
  renderHero,
  saveHero,
  addHeroImage,
  saveHeroImages,
  removeHeroImage,
};
