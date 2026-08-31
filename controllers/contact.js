// controllers/contact.js
const { validationResult } = require("express-validator");
const Contact = require("../models/contact");
const { userErrorMessage } = require("../utils/public-error");

function safeFlash(raw) {
  const t = String(raw || "").replace(/[<>]/g, "").trim();
  if (!t || t.length > 160) return "";
  if (/https?:|ER_|ECONN|SELECT |Table '|site_|SQL/i.test(t)) return "Gagal memproses permintaan. Coba lagi.";
  return t;
}

function failRedirect(err, fallback) {
  return `/admin/contact?error=${encodeURIComponent(userErrorMessage(err, fallback))}`;
}

async function renderContact(req, res) {
  try {
    const header = await Contact.getContactHeader();
    if (!header) {
      return res.render("admin/contact", {
        user: req.user,
        header: null,
        steps: [],
        saved: 0,
        error: "Data kontak belum siap. Coba lagi, atau hubungi admin teknis.",
      });
    }

    const steps = await Contact.listContactSteps(header.id);

    return res.render("admin/contact", {
      user: req.user,
      header,
      steps,
      saved: String(req.query.saved || "") === "1" ? 1 : 0,
      error: safeFlash(req.query.error),
    });
  } catch (e) {
    console.error("renderContact error:", e);
    return res.render("admin/contact", {
      user: req.user,
      header: null,
      steps: [],
      saved: 0,
      error: userErrorMessage(e, "Gagal memuat halaman kontak"),
    });
  }
}

async function saveContactHeader(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const msg = errors.array()[0]?.msg || "Isian tidak valid. Periksa form, lalu coba lagi.";
      return res.redirect(`/admin/contact?error=${encodeURIComponent(msg)}`);
    }

    const header = await Contact.getContactHeader();
    if (!header) {
      return res.redirect(
        `/admin/contact?error=${encodeURIComponent("Data kontak belum siap. Coba lagi, atau hubungi admin teknis.")}`
      );
    }

    await Contact.updateContactHeader({
      id: header.id,
      badge_id: req.body.badge_id || "",
      badge_en: req.body.badge_en || "",
      title_id: req.body.title_id || "",
      title_en: req.body.title_en || "",
      subtitle_id: req.body.subtitle_id || "",
      subtitle_en: req.body.subtitle_en || "",
      steps_title_id: req.body.steps_title_id || "",
      steps_title_en: req.body.steps_title_en || "",
      button_label_id: req.body.button_label_id || "",
      button_label_en: req.body.button_label_en || "",
    });

    return res.redirect("/admin/contact?saved=1");
  } catch (e) {
    console.error("saveContactHeader error:", e);
    return res.redirect(failRedirect(e, "Gagal menyimpan kontak"));
  }
}

async function addContactStep(req, res) {
  try {
    const header = await Contact.getContactHeader();
    if (!header) {
      return res.redirect(
        `/admin/contact?error=${encodeURIComponent("Data kontak belum siap. Coba lagi, atau hubungi admin teknis.")}`
      );
    }

    await Contact.addContactStep(header.id);
    return res.redirect("/admin/contact?saved=1");
  } catch (e) {
    console.error("addContactStep error:", e);
    return res.redirect(failRedirect(e, "Gagal menyimpan kontak"));
  }
}

async function saveContactSteps(req, res) {
  try {
    const ids = [].concat(req.body.step_id || []);
    const text_id = [].concat(req.body.text_id || []);
    const text_en = [].concat(req.body.text_en || []);
    const sort_order = [].concat(req.body.sort_order || []);
    const actives = [].concat(req.body.is_active || []);

    const payload = ids.map((id, i) => ({
      id,
      text_id: text_id[i] || "",
      text_en: text_en[i] || "",
      sort_order: sort_order[i] ?? 0,
      is_active: actives.includes(String(id)),
    }));

    await Contact.updateContactSteps(payload);
    return res.redirect("/admin/contact?saved=1");
  } catch (e) {
    console.error("saveContactSteps error:", e);
    return res.redirect(failRedirect(e, "Gagal menyimpan kontak"));
  }
}

async function deleteContactStep(req, res) {
  try {
    const id = req.params.id;
    await Contact.deleteContactStep(id);
    return res.redirect("/admin/contact?saved=1");
  } catch (e) {
    console.error("deleteContactStep error:", e);
    return res.redirect(failRedirect(e, "Gagal menyimpan kontak"));
  }
}

module.exports = {
  renderContact,
  saveContactHeader,
  addContactStep,
  saveContactSteps,
  deleteContactStep,
};
