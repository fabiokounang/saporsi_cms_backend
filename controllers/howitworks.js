"use strict";

const fs = require("fs");
const path = require("path");
const HowItWorks = require("../models/howitworks");

async function renderHowItWorks(req, res) {
  const header = await HowItWorks.getHeader();
  const items = await HowItWorks.getItems();

  res.render("admin/how-it-works", {
    user: req.user,
    header,
    items,
    saved: false,
  });
}

async function saveHeader(req, res) {
  await HowItWorks.updateHeader(req.body);
  return res.redirect("/admin/how-it-works");
}

async function addItem(req, res) {
  await HowItWorks.addItem();
  return res.redirect("/admin/how-it-works");
}

async function saveItems(req, res) {
  const ids = [].concat(req.body.item_id || []);
  const title_id = [].concat(req.body.title_id || []);
  const title_en = [].concat(req.body.title_en || []);
  const desc_id = [].concat(req.body.description_id || []);
  const desc_en = [].concat(req.body.description_en || []);
  const sort_order = [].concat(req.body.sort_order || []);
  const actives = [].concat(req.body.is_active || []);
  const oldIcons = [].concat(req.body.old_icon || []);
  const files = req.files || [];

  const payload = ids.map((id, i) => {
    const file = files.find(f => f.fieldname === `icon_${id}`);

    // delete old icon if replaced
    if (file && oldIcons[i]) {
      const oldPath = path.join(__dirname, "../public", oldIcons[i]);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    return {
      id,
      title_id: title_id[i],
      title_en: title_en[i],
      description_id: desc_id[i],
      description_en: desc_en[i],
      icon_path: file
        ? `/uploads/how-it-works/${file.filename}`
        : oldIcons[i] || null,
      sort_order: sort_order[i],
      is_active: actives.includes(String(id)),
    };
  });

  await HowItWorks.updateItems(payload);
  return res.redirect("/admin/how-it-works");
}

async function deleteItem(req, res) {
  await HowItWorks.deleteItem(req.params.id);
  return res.redirect("/admin/how-it-works");
}

module.exports = {
  renderHowItWorks,
  saveHeader,
  addItem,
  saveItems,
  deleteItem,
};
