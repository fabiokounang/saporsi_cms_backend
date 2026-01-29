"use strict";
const Partners = require("../models/partners");

async function renderPartners(req, res) {
  res.render("admin/partners", {
    user: req.user,
    header: await Partners.getPartnerHeader(),
    items: await Partners.getPartnerItems(),
    saved: false
  });
}

async function savePartnerHeader(req, res) {
  await Partners.updatePartnerHeader(req.body);
  return renderPartners(req, res);
}

async function addPartner(req, res) {
  const logo = req.file
    ? `/uploads/partners/${req.file.filename}`
    : "";

  await Partners.addPartnerItem({
    name_id: req.body.name_id,
    name_en: req.body.name_en,
    logo_path: logo,
    sort_order: req.body.sort_order || 999
  });

  return res.redirect("/admin/partners");
}

async function savePartner(req, res) {
  const logo = req.file
    ? `/uploads/partners/${req.file.filename}`
    : req.body.current_logo_path;

  await Partners.updatePartnerItem({
    id: req.params.id,
    name_id: req.body.name_id,
    name_en: req.body.name_en,
    logo_path: logo,
    sort_order: req.body.sort_order,
    is_active: req.body.is_active === "1"
  });

  return res.redirect("/admin/partners");
}

async function deletePartner(req, res) {
  await Partners.deletePartnerItem(req.params.id);
  return res.redirect("/admin/partners");
}

module.exports = {
  renderPartners,
  savePartnerHeader,
  addPartner,
  savePartner,
  deletePartner
};
