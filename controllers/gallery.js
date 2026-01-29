"use strict";

const Gallery = require("../models/gallery");

/* Render */
async function renderGallery(req, res) {
  const header = await Gallery.getGalleryHeader();
  const items = await Gallery.getGalleryItems();

  res.render("admin/gallery", {
    user: req.user,
    header,
    items,
    saved: false,
    error: null,
  });
}

/* Save header */
async function saveGalleryHeader(req, res) {
  try {
    await Gallery.updateGalleryHeader({
      badge_id: req.body.badge_id,
      badge_en: req.body.badge_en,
      title_id: req.body.title_id,
      title_en: req.body.title_en,
      subtitle_id: req.body.subtitle_id,
      subtitle_en: req.body.subtitle_en,
    });

    const header = await Gallery.getGalleryHeader();
    const items = await Gallery.getGalleryItems();

    res.render("admin/gallery", {
      user: req.user,
      header,
      items,
      saved: true,
      error: null,
    });
  } catch (e) {
    console.error(e);
    const header = await Gallery.getGalleryHeader();
    const items = await Gallery.getGalleryItems();

    res.render("admin/gallery", {
      user: req.user,
      header,
      items,
      saved: false,
      error: "Gagal menyimpan header gallery",
    });
  }
}

/* Add item (upload required) */
async function addGalleryItem(req, res) {
  try {
    const imagePath = req.file ? `/uploads/gallery/${req.file.filename}` : "";
    await Gallery.addGalleryItem({
      label_id: req.body.label_id,
      label_en: req.body.label_en,
      image_path: imagePath,
      sort_order: req.body.sort_order || 999,
      is_active: true,
    });
  } catch (e) {
    console.error(e);
  }
  return res.redirect("/admin/gallery");
}

/* Update item (optional replace image) */
async function saveGalleryItem(req, res) {
  try {
    const imagePath = req.file
      ? `/uploads/gallery/${req.file.filename}`
      : (req.body.current_image_path || "");

    await Gallery.updateGalleryItem({
      id: req.params.id,
      label_id: req.body.label_id,
      label_en: req.body.label_en,
      image_path: imagePath,
      sort_order: req.body.sort_order,
      is_active: req.body.is_active === "1",
    });
  } catch (e) {
    console.error(e);
  }
  return res.redirect("/admin/gallery");
}

/* Delete */
async function deleteGalleryItem(req, res) {
  try {
    await Gallery.deleteGalleryItem(req.params.id);
  } catch (e) {
    console.error(e);
  }
  return res.redirect("/admin/gallery");
}

module.exports = {
  renderGallery,
  saveGalleryHeader,
  addGalleryItem,
  saveGalleryItem,
  deleteGalleryItem,
};
