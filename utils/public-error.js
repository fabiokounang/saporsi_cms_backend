"use strict";

const FILE_TOO_LARGE =
  "File terlalu besar untuk diunggah. Perkecil gambar (maksimal 3 MB) lalu coba lagi.";
const BAD_IMAGE = "File harus berupa gambar PNG, JPG, atau WEBP.";
const CSRF_INVALID = "Sesi tidak valid atau kedaluwarsa. Muat ulang halaman, lalu coba lagi.";
const DB_UNAVAILABLE = "Tidak bisa terhubung ke server data. Coba lagi beberapa saat.";
const DB_NOT_READY = "Data belum bisa dimuat. Coba lagi, atau hubungi admin teknis.";
const DB_BUSY = "Server sedang sibuk. Tunggu sebentar, lalu coba lagi.";
const DB_DUPLICATE = "Data itu sudah ada. Periksa isian, lalu coba lagi.";

const CONNECT_CODES = new Set([
  "ECONNREFUSED",
  "ETIMEDOUT",
  "ENOTFOUND",
  "EAI_AGAIN",
  "PROTOCOL_CONNECTION_LOST",
  "PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR",
]);
const SCHEMA_CODES = new Set(["ER_NO_SUCH_TABLE", "ER_BAD_FIELD_ERROR", "ER_BAD_TABLE_ERROR"]);
const BUSY_CODES = new Set(["ER_LOCK_WAIT_TIMEOUT", "ER_LOCK_DEADLOCK", "ER_CON_COUNT_ERROR"]);
const DUP_CODES = new Set(["ER_DUP_ENTRY", "ER_DUP_ENTRY_WITH_KEY_NAME"]);

function messageForStatus(status) {
  const code = Number(status);
  if (code === 400) return "Data tidak valid. Periksa isian dan file, lalu coba lagi.";
  if (code === 401 || code === 403) return CSRF_INVALID;
  if (code === 404) return "Halaman atau aksi tidak ditemukan. Kembali ke dashboard lalu coba lagi.";
  if (code === 408 || code === 504) return "Server lama merespons. Coba lagi.";
  if (code === 413) return FILE_TOO_LARGE;
  if (code === 415) return BAD_IMAGE;
  if (code === 429) return "Terlalu banyak percobaan. Tunggu sebentar, lalu coba lagi.";
  if (code >= 500) return "Server sedang bermasalah. Coba lagi beberapa saat.";
  return "Gagal memproses permintaan. Coba lagi.";
}

function looksTechnical(msg) {
  const t = String(msg || "").trim();
  if (!t || t.length > 180) return true;
  return /https?:\/\/|ECONN|ETIMEDOUT|ENOTFOUND|ER_|LIMIT_|ENOENT|SQL|syntax|stack|at\s+\w+\(|entity too large|File too large|Unexpected token|Table '|Unknown column|Access denied/i.test(
    t
  );
}

function explainError(err) {
  if (!err) return { status: 500, message: messageForStatus(500) };

  const code = String(err.code || err.type || "");
  const raw = String(err.message || "");
  const hinted = Number(err.statusCode || err.status || 0);

  if (CONNECT_CODES.has(code) || /ECONNREFUSED|ETIMEDOUT|ENOTFOUND|PROTOCOL_CONNECTION_LOST/i.test(code + raw)) {
    return { status: 503, message: DB_UNAVAILABLE };
  }
  if (SCHEMA_CODES.has(code) || /ER_NO_SUCH_TABLE|ER_BAD_FIELD|doesn't exist|Unknown column/i.test(code + raw)) {
    return { status: 500, message: DB_NOT_READY };
  }
  if (BUSY_CODES.has(code)) {
    return { status: 503, message: DB_BUSY };
  }
  if (DUP_CODES.has(code) || /ER_DUP_ENTRY/i.test(code + raw)) {
    return { status: 409, message: DB_DUPLICATE };
  }

  if (
    code === "LIMIT_FILE_SIZE" ||
    err.type === "entity.too.large" ||
    hinted === 413 ||
    /entity too large|file too large|request entity too large/i.test(raw)
  ) {
    return { status: 413, message: FILE_TOO_LARGE };
  }

  if (code === "LIMIT_UNEXPECTED_FILE" || code === "LIMIT_FILE_COUNT" || code === "LIMIT_PART_COUNT") {
    return { status: 400, message: "Jumlah atau jenis file tidak sesuai. Coba unggah ulang." };
  }

  if (/png\/jpg\/webp|berupa gambar/i.test(raw)) {
    return { status: 400, message: BAD_IMAGE };
  }

  const status = hinted >= 400 ? hinted : 500;
  const message = looksTechnical(raw) ? messageForStatus(status) : raw;
  return { status, message };
}

function userErrorMessage(err, fallback) {
  const out = explainError(err);
  if (out.message && !looksTechnical(out.message)) return out.message;
  return fallback || messageForStatus(out.status || 500);
}

function wantsJson(req) {
  const url = String((req && (req.originalUrl || req.path || req.url)) || "");
  if (url.startsWith("/api")) return true;
  const accept = String((req && req.get && req.get("accept")) || "");
  return Boolean(req && (req.xhr || accept.includes("application/json")));
}

module.exports = {
  FILE_TOO_LARGE,
  BAD_IMAGE,
  CSRF_INVALID,
  DB_UNAVAILABLE,
  DB_NOT_READY,
  DB_BUSY,
  DB_DUPLICATE,
  messageForStatus,
  explainError,
  userErrorMessage,
  wantsJson,
};
