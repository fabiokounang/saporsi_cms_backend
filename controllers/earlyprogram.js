const path = require("path");
const fs = require("fs/promises");
const multer = require("multer");

const Early = require("../models/earlyprogram");

const UPLOAD_DIR = path.join(process.cwd(), "public/uploads/early-program");

function isSafeUploadPath(p) {
  return typeof p === "string" && p.startsWith("/uploads/early-program/");
}

async function ensureDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await ensureDir();
      cb(null, UPLOAD_DIR);
    } catch (e) {
      cb(e);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safeExt = [".png", ".jpg", ".jpeg", ".webp"].includes(ext) ? ext : ".png";
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 1 * 1024 * 1024 }, // 1MB
  fileFilter: (req, file, cb) => {
    const ok = ["image/png", "image/jpeg", "image/webp"].includes(file.mimetype);
    if (!ok) return cb(new Error("Only image files (png/jpg/webp) are allowed"));
    cb(null, true);
  },
});

// upload middleware: accept any fields (icon_file_<id>)
const uploadAny = upload.any();

function arr(v) {
  return [].concat(v || []);
}

async function page(req, res) {
  const header = await Early.getHeader();
  const benefits = await Early.listBenefits();
  return res.render("admin/early-program", {
    user: req.user,
    header,
    benefits,
  });
}

async function saveHeader(req, res) {
  try {
    await Early.updateHeader({
      label_id: req.body.label_id,
      label_en: req.body.label_en,
      title_id: req.body.title_id,
      title_en: req.body.title_en,
      desc_id: req.body.desc_id,
      desc_en: req.body.desc_en,

      highlight_title_id: req.body.highlight_title_id,
      highlight_title_en: req.body.highlight_title_en,
      highlight_desc_id: req.body.highlight_desc_id,
      highlight_desc_en: req.body.highlight_desc_en,

      benefits_title_id: req.body.benefits_title_id,
      benefits_title_en: req.body.benefits_title_en,

      cta_primary_id: req.body.cta_primary_id,
      cta_primary_en: req.body.cta_primary_en,
      cta_primary_url: req.body.cta_primary_url,

      cta_secondary_id: req.body.cta_secondary_id,
      cta_secondary_en: req.body.cta_secondary_en,
      cta_secondary_url: req.body.cta_secondary_url,

      right_title_id: req.body.right_title_id,
      right_title_en: req.body.right_title_en,
      right_badge_id: req.body.right_badge_id,
      right_badge_en: req.body.right_badge_en,
      right_desc_id: req.body.right_desc_id,
      right_desc_en: req.body.right_desc_en,

      kpi1_label_id: req.body.kpi1_label_id,
      kpi1_label_en: req.body.kpi1_label_en,
      kpi1_value_id: req.body.kpi1_value_id,
      kpi1_value_en: req.body.kpi1_value_en,

      kpi2_label_id: req.body.kpi2_label_id,
      kpi2_label_en: req.body.kpi2_label_en,
      kpi2_value_id: req.body.kpi2_value_id,
      kpi2_value_en: req.body.kpi2_value_en,

      kpi3_label_id: req.body.kpi3_label_id,
      kpi3_label_en: req.body.kpi3_label_en,
      kpi3_value_id: req.body.kpi3_value_id,
      kpi3_value_en: req.body.kpi3_value_en,

      kpi4_label_id: req.body.kpi4_label_id,
      kpi4_label_en: req.body.kpi4_label_en,
      kpi4_value_id: req.body.kpi4_value_id,
      kpi4_value_en: req.body.kpi4_value_en,

      note_title_id: req.body.note_title_id,
      note_title_en: req.body.note_title_en,
      note_desc_id: req.body.note_desc_id,
      note_desc_en: req.body.note_desc_en,

      right_cta_primary_id: req.body.right_cta_primary_id,
      right_cta_primary_en: req.body.right_cta_primary_en,
      right_cta_primary_url: req.body.right_cta_primary_url,

      whatsapp_url: req.body.whatsapp_url,

      float_title_id: req.body.float_title_id,
      float_title_en: req.body.float_title_en,
      float_sub_id: req.body.float_sub_id,
      float_sub_en: req.body.float_sub_en,
    });
  } catch (e) {
    console.error("saveHeader error:", e);
  }
  return res.redirect("/admin/early-program");
}

async function addBenefit(req, res) {
  try {
    await Early.addBenefit();
  } catch (e) {
    console.error("addBenefit error:", e);
  }
  return res.redirect("/admin/early-program");
}

async function saveBenefits(req, res) {
  uploadAny(req, res, async (err) => {
    if (err) {
      console.error("upload error:", err.message || err);
      return res.redirect("/admin/early-program");
    }

    try {
      const ids = arr(req.body.benefit_id);
      const title_id = arr(req.body.title_id);
      const title_en = arr(req.body.title_en);
      const description_id = arr(req.body.description_id);
      const description_en = arr(req.body.description_en);
      const accent = arr(req.body.accent);
      const sort_order = arr(req.body.sort_order);
      const actives = arr(req.body.is_active);
      const old_icon = arr(req.body.old_icon); // hidden

      // map uploaded files by fieldname => icon_file_<id>
      const fileMap = new Map();
      (req.files || []).forEach((f) => fileMap.set(f.fieldname, f));

      // prepare payload
      const payload = [];

      for (let i = 0; i < ids.length; i++) {
        const id = String(ids[i]);
        const f = fileMap.get(`icon_file_${id}`);

        let icon_path = old_icon[i] || null;

        // if new upload
        if (f) {
          icon_path = `/uploads/early-program/${f.filename}`;

          // delete old file if exists and different
          const old = old_icon[i];
          if (old && isSafeUploadPath(old) && old !== icon_path) {
            const abs = path.join(process.cwd(), "public", old);
            try { await fs.unlink(abs); } catch (_) {}
          }
        }

        payload.push({
          id,
          title_id: title_id[i],
          title_en: title_en[i],
          description_id: description_id[i],
          description_en: description_en[i],
          icon_path,
          accent: accent[i],
          sort_order: sort_order[i],
          is_active: actives.includes(id),
        });
      }

      await Early.upsertBenefits(payload);
    } catch (e) {
      console.error("saveBenefits error:", e);
    }

    return res.redirect("/admin/early-program");
  });
}

async function deleteBenefit(req, res) {
  try {
    const id = Number(req.params.id);
    const row = await Early.getBenefitById(id);

    if (row?.icon_path && isSafeUploadPath(row.icon_path)) {
      const abs = path.join(process.cwd(), "public", row.icon_path);
      try { await fs.unlink(abs); } catch (_) {}
    }

    await Early.deleteBenefit(id);
  } catch (e) {
    console.error("deleteBenefit error:", e);
  }

  return res.redirect("/admin/early-program");
}

module.exports = {
  page,
  saveHeader,
  addBenefit,
  saveBenefits,
  deleteBenefit,
};
