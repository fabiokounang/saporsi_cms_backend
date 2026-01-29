"use strict";

const About = require("../models/about");

async function renderAbout(req, res) {
  const data = await About.getAbout();
  const cards = await About.getCards();
  const points = await About.getPoints();

  res.render("admin/about", {
    user: req.user,
    data,
    cards,
    points,
    saved: false,
    error: null,
  });
}

async function saveAbout(req, res) {
  try {
    await About.updateAbout({
      badge_id: req.body.badge_id,
      badge_en: req.body.badge_en,
      title_id: req.body.title_id,
      title_en: req.body.title_en,
      description_id: req.body.description_id,
      description_en: req.body.description_en,
    });

    const data = await About.getAbout();
    const cards = await About.getCards();
    const points = await About.getPoints();

    res.render("admin/about", {
      user: req.user,
      data,
      cards,
      points,
      saved: true,
      error: null,
    });
  } catch (err) {
    console.error(err);
    const data = await About.getAbout();
    const cards = await About.getCards();
    const points = await About.getPoints();

    res.render("admin/about", {
      user: req.user,
      data,
      cards,
      points,
      saved: false,
      error: "Gagal menyimpan About header",
    });
  }
}

/* ===== Cards ===== */
async function addAboutCard(req, res) {
  try { await About.addCard(); } catch (e) { console.error(e); }
  return res.redirect("/admin/about");
}

async function saveAboutCards(req, res) {
  try {
    const ids = [].concat(req.body.card_id || []);
    const types = [].concat(req.body.card_type || []);
    const tId = [].concat(req.body.title_id || []);
    const tEn = [].concat(req.body.title_en || []);
    const dId = [].concat(req.body.description_id || []);
    const dEn = [].concat(req.body.description_en || []);
    const themes = [].concat(req.body.theme || []);
    const icons = [].concat(req.body.icon_key || []);
    const orders = [].concat(req.body.sort_order || []);
    const actives = [].concat(req.body.is_active || []);

    const payload = ids.map((id, i) => ({
      id,
      card_type: types[i],
      title_id: tId[i],
      title_en: tEn[i],
      description_id: dId[i],
      description_en: dEn[i],
      theme: themes[i],
      icon_key: icons[i],
      sort_order: orders[i],
      is_active: actives.includes(String(id)),
    }));

    await About.updateCards(payload);
  } catch (e) {
    console.error(e);
  }
  return res.redirect("/admin/about");
}

async function deleteAboutCard(req, res) {
  try { await About.deleteCard(req.params.id); } catch (e) { console.error(e); }
  return res.redirect("/admin/about");
}

/* ===== Points ===== */
async function addAboutPoint(req, res) {
  try { await About.addPoint(); } catch (e) { console.error(e); }
  return res.redirect("/admin/about");
}

async function saveAboutPoints(req, res) {
  try {
    const ids = [].concat(req.body.point_id || []);
    const tId = [].concat(req.body.title_id || []);
    const tEn = [].concat(req.body.title_en || []);
    const dId = [].concat(req.body.description_id || []);
    const dEn = [].concat(req.body.description_en || []);
    const icons = [].concat(req.body.icon_key || []);
    const orders = [].concat(req.body.sort_order || []);
    const actives = [].concat(req.body.is_active || []);

    const payload = ids.map((id, i) => ({
      id,
      title_id: tId[i],
      title_en: tEn[i],
      description_id: dId[i],
      description_en: dEn[i],
      icon_key: icons[i],
      sort_order: orders[i],
      is_active: actives.includes(String(id)),
    }));

    await About.updatePoints(payload);
  } catch (e) {
    console.error(e);
  }
  return res.redirect("/admin/about");
}

async function deleteAboutPoint(req, res) {
  try { await About.deletePoint(req.params.id); } catch (e) { console.error(e); }
  return res.redirect("/admin/about");
}

module.exports = {
  renderAbout,
  saveAbout,

  addAboutCard,
  saveAboutCards,
  deleteAboutCard,

  addAboutPoint,
  saveAboutPoints,
  deleteAboutPoint,
};
