// index.js (root)
require("dotenv").config();

const path = require("path");
const express = require("express");
const session = require('express-session');
const cookieParser = require("cookie-parser");
const cors = require("cors");
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
  "https://saporsi.com",
  "https://www.saporsi.com"
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
    console.log("[CORS BLOCKED]", { origin, normalized });
    return cb(null, false);
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
};

app.disable("x-powered-by");
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.set("trust proxy", 1);
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// ====== Parsers ======
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(express.json({ limit: "2mb" }));

// ====== Views (EJS) ======
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ====== Static ======
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

app.use(session({
  secret: process.env.SESSION_SECRET || "saporsi-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production", // true di https
    sameSite: "lax", // untuk admin di cms.kenaritower.com
  }
}));

// routes
app.use("/auth", auth);
app.use("/admin", admin);
app.use("/api", api);

// ====== 404 ======
app.use((req, res) => {
  // kalau kamu punya halaman 404, render di sini
  return res.status(404).send("404 Not Found");
});

// ====== Error Handler ======
app.use((err, req, res, next) => {
  console.error("ERROR:", err);

  // jangan bocorin error detail ke user pada production
  const isProd = process.env.NODE_ENV === "production";
  const message = isProd ? "Internal Server Error" : (err.message || "Error");

  return res.status(err.statusCode || 500).send(message);
});

// ====== Start Server ======
const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => {
  console.log(`Saporsi CMS running on ${PORT}`);
});
