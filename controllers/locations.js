"use strict";

const Locations = require("../models/locations");

async function renderLocations(req, res) {
  const header = await Locations.getLocationsHeader();
  const items = await Locations.getLocationItems();

  res.render("admin/locations", {
    user: req.user,
    header,
    items,
    saved: false,
    error: null,
  });
}

async function saveLocationsHeader(req, res) {
  try {
    await Locations.updateLocationsHeader({
      badge_id: req.body.badge_id,
      badge_en: req.body.badge_en,
      title_id: req.body.title_id,
      title_en: req.body.title_en,
      subtitle_id: req.body.subtitle_id,
      subtitle_en: req.body.subtitle_en,
    });

    const header = await Locations.getLocationsHeader();
    const items = await Locations.getLocationItems();

    res.render("admin/locations", {
      user: req.user,
      header,
      items,
      saved: true,
      error: null,
    });
  } catch (e) {
    console.error(e);
    const header = await Locations.getLocationsHeader();
    const items = await Locations.getLocationItems();

    res.render("admin/locations", {
      user: req.user,
      header,
      items,
      saved: false,
      error: "Gagal menyimpan header lokasi",
    });
  }
}

async function addLocation(req, res) {
  try { await Locations.addLocationItem(); } catch (e) { console.error(e); }
  return res.redirect("/admin/locations");
}

async function saveLocations(req, res) {
  try {
    const ids = [].concat(req.body.item_id || []);
    const title_id = [].concat(req.body.title_id || []);
    const title_en = [].concat(req.body.title_en || []);
    const icon_key = [].concat(req.body.icon_key || []);
    const accent = [].concat(req.body.accent || []);
    const sort_order = [].concat(req.body.sort_order || []);
    const actives = [].concat(req.body.is_active || []);

    const payload = ids.map((id, i) => ({
      id,
      title_id: title_id[i],
      title_en: title_en[i],
      icon_key: icon_key[i],
      accent: accent[i],
      sort_order: sort_order[i],
      is_active: actives.includes(String(id)),
    }));

    await Locations.updateLocationItems(payload);
  } catch (e) {
    console.error(e);
  }
  return res.redirect("/admin/locations");
}

async function deleteLocation(req, res) {
  try { await Locations.deleteLocationItem(req.params.id); } catch (e) { console.error(e); }
  return res.redirect("/admin/locations");
}

module.exports = {
  renderLocations,
  saveLocationsHeader,
  addLocation,
  saveLocations,
  deleteLocation,
};
