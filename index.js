// index.js (root)
require("dotenv").config();

const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");
const { issueCsrf, verifyCsrf, injectCsrfHtml } = require("./middleware/csrf");
const { explainError, messageForStatus, wantsJson } = require("./utils/public-error");
const app = express();

const auth = require('./routes/auth');
const admin = require('./routes/admin');
const api = require('./routes/api');

// ====== Basic App Config ======
const ALLOWED_ORIGINS = new Set([
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://samakan.id",
  "https://cms.samakan.id",
  "https://www.samakan.id"
  // kalau kamu kadang akses FE lewat netlify subdomain:
  // "https://kenaritower.netlify.app",
]);

const corsOptions = {
  origin: (origin, cb) => {
    // allow server-to-server, curl, same-origin
    if (!origin) return cb(null, true);

    // normalize (hapus trailing slash kalau ada)
    const normalized = origin.replace(/\/$/, "");

    if (ALLOWED_ORIGINS.has(normalized)) return cb(null, true);

    // jangan throw error biar nggak spam log & nggak bikin 500
    return cb(null, false);
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "X-CSRF-Token"],
  credentials: true,
};

app.disable("x-powered-by");
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.set("trust proxy", 1);
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(express.json({ limit: "2mb" }));

// ====== Views (EJS) ======
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ====== Static ======
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/uploads", 
  (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  }, 
  express.static(path.join(__dirname, "public/uploads")));

app.use(issueCsrf);
app.use(injectCsrfHtml);
app.use(verifyCsrf);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: "Terlalu banyak percobaan login. Coba lagi nanti.",
  skip: (req) => req.method !== "POST",
});

app.get('/', (req, res) => {
  res.redirect('/auth/login');
});
app.use("/auth/login", loginLimiter);

// routes
app.use("/auth", auth);
app.use("/admin", admin);
app.use("/api", api);

function adminBackUrl(req) {
  const ref = req.get("referer");
  if (!ref) return "/admin";
  try {
    const pathName = new URL(ref).pathname;
    if (pathName.startsWith("/admin")) return pathName;
  } catch {
    /* ignore */
  }
  return "/admin";
}

function sendPublicError(req, res, status, message) {
  if (wantsJson(req)) return res.status(status).json({ error: message });
  return res.status(status).render("error", {
    status,
    message,
    backUrl: adminBackUrl(req),
  });
}

// ====== 404 ======
app.use((req, res) => {
  return sendPublicError(req, res, 404, messageForStatus(404));
});

// ====== Error Handler ======
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  console.error("ERROR:", err);
  const { status, message } = explainError(err);
  return sendPublicError(req, res, status, message);
});

// ====== Start Server ======
if (require.main === module) {
  const PORT = Number(process.env.PORT || 3000);
  const { ensureCmsSchema } = require("./utils/schema");
  ensureCmsSchema()
    .catch((err) => {
      console.error("Gagal menyiapkan skema CMS:", err.message || err);
    })
    .finally(() => {
      app.listen(PORT, () => {
        console.log(`Samakan CMS running on ${PORT}`);
      });
    });
}

module.exports = app;
