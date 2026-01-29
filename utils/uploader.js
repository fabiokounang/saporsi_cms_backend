const multer = require("multer");
const path = require("path");
const fs = require("fs");

function makeUploader(folder) {
  const uploadPath = path.join(__dirname, "../public/uploads", folder);
  fs.mkdirSync(uploadPath, { recursive: true });

  const storage = multer.diskStorage({
    destination: uploadPath,
    filename: (_, file, cb) => {
      const ext = path.extname(file.originalname);
      const name = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, name + ext);
    }
  });

  return multer({
    storage,
    limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
    fileFilter: (_, file, cb) => {
      if (!file.mimetype.startsWith("image/")) {
        return cb(new Error("File harus berupa gambar"));
      }
      cb(null, true);
    }
  });
}

module.exports = {
  navbarUpload: makeUploader("navbar"),
  heroUpload: makeUploader("hero"),
  aboutUpload: makeUploader("about"),
  galleryUpload: makeUploader("gallery"),
  partnerUpload: makeUploader("partners")
};
