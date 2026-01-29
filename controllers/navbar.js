"use strict";

const Navbar = require("../models/navbar");

async function renderNavbar(req, res) {
  const settings = await Navbar.getNavbarSettings();
  const items = await Navbar.getNavbarItems();

  res.render("admin/navbar", {
    user: req.user,
    settings,
    items,
    saved: false,
    error: null,
  });
}

async function saveNavbar(req, res) {
  try {
    const currentLogo = req.body.current_logo || "";

    const logo_path = req.file
      ? `/uploads/navbar/${req.file.filename}`
      : currentLogo;

    await Navbar.updateNavbarSettings({
      logo_path,
      cta_label_id: req.body.cta_label_id,
      cta_label_en: req.body.cta_label_en,
      cta_url: req.body.cta_url,
      show_language_toggle: req.body.show_language_toggle === "1" ,
    });

    // handle items
    const ids = Array.isArray(req.body.item_id) ? req.body.item_id : [];
    const label_ids = [].concat(req.body.label_id || []);
    const label_ens = [].concat(req.body.label_en || []);
    const urls = [].concat(req.body.url || []);
    const sort_orders = [].concat(req.body.sort_order || []);
    const actives = [].concat(req.body.is_active || []);

    const itemsPayload = ids.map((id, i) => ({
      id,
      label_id: label_ids[i],
      label_en: label_ens[i],
      url: urls[i],
      sort_order: sort_orders[i],
      is_active: actives.includes(String(id)),
    }));

    await Navbar.updateNavbarItems(itemsPayload);

    const settings = await Navbar.getNavbarSettings();
    const items = await Navbar.getNavbarItems();

    res.render("admin/navbar", {
      user: req.user,
      settings,
      items,
      saved: true,
      error: null,
    });
  } catch (err) {
    console.error(err);

    const settings = await Navbar.getNavbarSettings();
    const items = await Navbar.getNavbarItems();

    res.render("admin/navbar", {
      user: req.user,
      settings,
      items,
      saved: false,
      error: err.message || "Gagal menyimpan Navbar",
    });
  }
}


async function addNavbarItem(req, res) {
  try {
    await Navbar.addNavbarItem();
    return res.redirect("/admin/navbar");
  } catch (err) {
    console.error(err);
    return res.redirect("/admin/navbar");
  }
}

async function removeNavbarItem(req, res) {
  try {
    await Navbar.deleteNavbarItem(req.params.id);
    return res.redirect("/admin/navbar");
  } catch (err) {
    console.error(err);
    return res.redirect("/admin/navbar");
  }
}

module.exports = {
  renderNavbar,
  saveNavbar,
  addNavbarItem,
  removeNavbarItem,
};
