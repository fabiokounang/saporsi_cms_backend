const CTA = require("../models/cta");

async function pageCTA(req, res) {
  try {
    const data = await CTA.getCTA();
    return res.render("admin/cta", {
      user: req.user,
      cta: data,
    });
  } catch (e) {
    console.error("pageCTA error:", e);
    return res.redirect("/admin");
  }
}

async function saveCTA(req, res) {
  try {
    const payload = {
      id: 1,
      badge_id: req.body.badge_id || null,
      badge_en: req.body.badge_en || null,

      title_id: req.body.title_id || null,
      title_en: req.body.title_en || null,

      subtitle_id: req.body.subtitle_id || null,
      subtitle_en: req.body.subtitle_en || null,

      primary_label_id: req.body.primary_label_id || null,
      primary_label_en: req.body.primary_label_en || null,
      primary_url: req.body.primary_url || null,

      secondary_label_id: req.body.secondary_label_id || null,
      secondary_label_en: req.body.secondary_label_en || null,
      secondary_url: req.body.secondary_url || null,

      is_active: req.body.is_active ? 1 : 0,
    };

    await CTA.upsertCTA(payload);
  } catch (e) {
    console.error("saveCTA error:", e);
  }
  return res.redirect("/admin/cta");
}

module.exports = {
  pageCTA,
  saveCTA,
};
