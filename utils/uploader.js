const multer = require("multer");
const path = require("path");
const fs = require("fs");
const fsp = require("fs/promises");

const ALLOWED_EXT = new Set([".png", ".jpg", ".jpeg", ".webp"]);
const ALLOWED_MIME = new Set(["image/png", "image/jpeg", "image/webp"]);

function detectImageMime(buf) {
  if (!buf || buf.length < 12) return null;
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  ) {
    return "image/png";
  }
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return "image/jpeg";
  }
  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") {
    return "image/webp";
  }
  return null;
}

function extForMime(mime) {
  if (mime === "image/png") return ".png";
  if (mime === "image/webp") return ".webp";
  return ".jpg";
}

function safeExt(originalname, mimetype) {
  const ext = path.extname(originalname || "").toLowerCase();
  if (ALLOWED_EXT.has(ext)) return ext;
  if (mimetype === "image/png") return ".png";
  if (mimetype === "image/webp") return ".webp";
  return ".jpg";
}

function collectFiles(req) {
  const files = [];
  if (req.file) files.push(req.file);
  if (Array.isArray(req.files)) files.push(...req.files);
  else if (req.files && typeof req.files === "object") {
    for (const value of Object.values(req.files)) {
      if (Array.isArray(value)) files.push(...value);
      else if (value) files.push(value);
    }
  }
  return files;
}

async function assertImageFiles(files) {
  for (const file of files) {
    const buf = file.buffer || (file.path ? await fsp.readFile(file.path) : null);
    const mime = detectImageMime(buf);
    if (!mime) {
      if (file.path) await fsp.unlink(file.path).catch(() => {});
      const err = new Error("File harus berupa gambar png/jpg/webp");
      err.statusCode = 400;
      throw err;
    }
    const ext = extForMime(mime);
    if (file.path && path.extname(file.path).toLowerCase() !== ext) {
      const nextPath = file.path.slice(0, file.path.length - path.extname(file.path).length) + ext;
      await fsp.rename(file.path, nextPath);
      file.path = nextPath;
      file.filename = path.basename(nextPath);
    }
    file.mimetype = mime;
  }
}

function verifyUploadedFiles(req, res, next) {
  assertImageFiles(collectFiles(req)).then(() => next(), next);
}

function wrapUploader(uploader) {
  const after = (mw) => (req, res, next) => {
    mw(req, res, (err) => {
      if (err) return next(err);
      verifyUploadedFiles(req, res, next);
    });
  };
  return {
    single: (field) => after(uploader.single(field)),
    array: (field, maxCount) => after(uploader.array(field, maxCount)),
    fields: (fields) => after(uploader.fields(fields)),
    any: () => after(uploader.any()),
    none: () => after(uploader.none()),
  };
}

function makeUploader(folder) {
  const uploadPath = path.join(__dirname, "../public/uploads", folder);
  fs.mkdirSync(uploadPath, { recursive: true });

  const storage = multer.diskStorage({
    destination: uploadPath,
    filename: (_, file, cb) => {
      const name = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, name + safeExt(file.originalname, file.mimetype));
    },
  });

  return wrapUploader(
    multer({
      storage,
      limits: { fileSize: 3 * 1024 * 1024 },
      fileFilter: (_, file, cb) => {
        const ext = path.extname(file.originalname || "").toLowerCase();
        const mimeOk = ALLOWED_MIME.has(file.mimetype);
        const extOk = !ext || ALLOWED_EXT.has(ext);
        if (!mimeOk || !extOk) {
          return cb(new Error("File harus berupa gambar png/jpg/webp"));
        }
        cb(null, true);
      },
    })
  );
}

module.exports = {
  navbarUpload: makeUploader("navbar"),
  heroUpload: makeUploader("hero"),
  aboutUpload: makeUploader("about"),
  serviceUpload: makeUploader("services"),
  howItWorksUpload: makeUploader("how-it-works"),
  galleryUpload: makeUploader("gallery"),
  partnerUpload: makeUploader("partners"),
  detectImageMime,
  assertImageFiles,
  verifyUploadedFiles,
};
