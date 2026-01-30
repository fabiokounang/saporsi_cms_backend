"use strict";

const Services = require("../models/services");

async function renderServices(req, res) {
  const header = await Services.getServicesHeader();
  const items = await Services.getServicesItems();

  res.render("admin/services", {
    user: req.user,
    header,
    items,
    saved: false,
    error: null,
  });
}

async function saveServicesHeader(req, res) {
  try {
    await Services.updateServicesHeader({
      badge_id: req.body.badge_id,
      badge_en: req.body.badge_en,
      title_id: req.body.title_id,
      title_en: req.body.title_en,
      subtitle_id: req.body.subtitle_id,
      subtitle_en: req.body.subtitle_en,
    });

    const header = await Services.getServicesHeader();
    const items = await Services.getServicesItems();

    res.render("admin/services", {
      user: req.user,
      header,
      items,
      saved: true,
      error: null,
    });
  } catch (e) {
    console.error(e);
    const header = await Services.getServicesHeader();
    const items = await Services.getServicesItems();

    res.render("admin/services", {
      user: req.user,
      header,
      items,
      saved: false,
      error: "Gagal menyimpan header layanan",
    });
  }
}

/* items */
async function addService(req, res) {
  try { await Services.addServiceItem(); } catch (e) { console.error(e); }
  return res.redirect("/admin/services");
}

async function saveServiceItems(req, res) {
  try {
    const ids = [].concat(req.body.item_id || []);
    const title_id = [].concat(req.body.title_id || []);
    const title_en = [].concat(req.body.title_en || []);
    const desc_id = [].concat(req.body.description_id || []);
    const desc_en = [].concat(req.body.description_en || []);
    const accent = [].concat(req.body.accent || []);
    const sort_order = [].concat(req.body.sort_order || []);
    const actives = [].concat(req.body.is_active || []);
    const oldIcons = [].concat(req.body.old_icon || []);

    // req.files: [{ fieldname: "icon_12", filename: "xxx.png", ... }]
    const files = req.files || [];

    // build map: { "12": file, "15": file }
    const filesById = Object.create(null);
    for (const f of files) {
      const m = String(f.fieldname || "").match(/^icon_(\d+)$/);
      if (m) filesById[m[1]] = f;
    }

    const payload = ids.map((id, i) => {
      const idStr = String(id);
      const file = filesById[idStr];

      return {
        id,
        title_id: title_id[i],
        title_en: title_en[i],
        description_id: desc_id[i],
        description_en: desc_en[i],
        icon_key: file
          ? `/uploads/services/${file.filename}`
          : (oldIcons[i] || null),
        accent: accent[i],
        sort_order: Number(sort_order[i] ?? 0),
        is_active: actives.includes(idStr),
      };
    });

    await Services.updateServiceItems(payload);
  } catch (e) {
    console.error("saveServiceItems error:", e);
  }

  return res.redirect("/admin/services");
}


async function deleteService(req, res) {
  try { await Services.deleteServiceItem(req.params.id); } catch (e) { console.error(e); }
  return res.redirect("/admin/services");
}

module.exports = {
  renderServices,
  saveServicesHeader,
  addService,
  saveServiceItems,
  deleteService,
};
