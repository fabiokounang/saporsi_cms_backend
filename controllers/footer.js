"use strict";
const Footer = require("../models/footer");

async function renderFooter(req, res) {
  const footer = await Footer.getFooter();
  const links = await Footer.getQuickLinks();

  res.render("admin/footer", {
    user: req.user,
    footer,
    links,
    saved: false,
    error: null,
  });
}

async function saveFooter(req, res) {
  try {
    await Footer.updateFooter(req.body);

    const footer = await Footer.getFooter();
    const links = await Footer.getQuickLinks();

    res.render("admin/footer", {
      user: req.user,
      footer,
      links,
      saved: true,
      error: null,
    });
  } catch (e) {
    console.error(e);
    const footer = await Footer.getFooter();
    const links = await Footer.getQuickLinks();

    res.render("admin/footer", {
      user: req.user,
      footer,
      links,
      saved: false,
      error: "Gagal menyimpan footer",
    });
  }
}

async function addQuickLink(req, res) {
  try { await Footer.addQuickLink(); } catch (e) { console.error(e); }
  return res.redirect("/admin/footer");
}

async function saveQuickLinks(req, res) {
  try {
    const ids = [].concat(req.body.item_id || []);
    const label_id = [].concat(req.body.label_id || []);
    const label_en = [].concat(req.body.label_en || []);
    const url = [].concat(req.body.url || []);
    const sort_order = [].concat(req.body.sort_order || []);
    const actives = [].concat(req.body.is_active || []);

    const payload = ids.map((id, i) => ({
      id,
      label_id: label_id[i],
      label_en: label_en[i],
      url: url[i],
      sort_order: sort_order[i],
      is_active: actives.includes(String(id)),
    }));

    await Footer.updateQuickLinks(payload);
  } catch (e) {
    console.error(e);
  }

  return res.redirect("/admin/footer");
}

async function deleteQuickLink(req, res) {
  try { await Footer.deleteQuickLink(req.params.id); } catch (e) { console.error(e); }
  return res.redirect("/admin/footer");
}

module.exports = {
  renderFooter,
  saveFooter,
  addQuickLink,
  saveQuickLinks,
  deleteQuickLink,
};
