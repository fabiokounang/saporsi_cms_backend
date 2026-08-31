(function () {
  var TECHNICAL =
    /https?:\/\/|ECONN|ETIMEDOUT|ENOTFOUND|ER_|LIMIT_|ENOENT|SQL|syntax|stack|at\s+\w+\(|entity too large|File too large|Unexpected token|Table '|Unknown column|Access denied/i;

  function messageForStatus(status) {
    if (status === 400) return "Data tidak valid. Periksa isian dan file, lalu coba lagi.";
    if (status === 401 || status === 403) {
      return "Sesi tidak valid atau kedaluwarsa. Muat ulang halaman, lalu coba lagi.";
    }
    if (status === 404) return "Halaman atau aksi tidak ditemukan. Kembali ke dashboard lalu coba lagi.";
    if (status === 408 || status === 504) return "Server lama merespons. Coba lagi.";
    if (status === 409) return "Data itu sudah ada. Periksa isian, lalu coba lagi.";
    if (status === 413) {
      return "File terlalu besar untuk diunggah. Perkecil gambar (maksimal 3 MB) lalu coba lagi.";
    }
    if (status === 415) return "File harus berupa gambar PNG, JPG, atau WEBP.";
    if (status === 429) return "Terlalu banyak percobaan. Tunggu sebentar, lalu coba lagi.";
    if (status === 503) return "Tidak bisa terhubung ke server data. Coba lagi beberapa saat.";
    if (status >= 500) return "Server sedang bermasalah. Coba lagi beberapa saat.";
    return "Gagal memproses permintaan. Coba lagi.";
  }

  function sanitize(msg, status) {
    var t = String(msg || "").trim();
    if (!t || t.length > 180 || TECHNICAL.test(t)) return messageForStatus(status || 500);
    return t;
  }

  function messageFromResponse(status, text) {
    var raw = String(text || "");
    try {
      var data = JSON.parse(raw);
      if (data && typeof data.error === "string" && data.error.trim()) {
        return sanitize(data.error, status);
      }
    } catch (e) {
      /* nginx / HTML */
    }
    if (/too large|entity too large|413/i.test(raw)) return messageForStatus(413);
    return messageForStatus(status);
  }

  function host() {
    var el = document.getElementById("samakan-toasts");
    if (el) return el;
    el = document.createElement("div");
    el.id = "samakan-toasts";
    el.setAttribute("aria-live", "polite");
    document.body.appendChild(el);
    return el;
  }

  function show(message, type) {
    var kind = type === "success" ? "success" : "error";
    var text =
      kind === "success"
        ? String(message || "Tersimpan").trim().slice(0, 120)
        : sanitize(message, 500);
    if (!text) return;
    var item = document.createElement("div");
    item.className = "samakan-toast is-" + kind;
    item.setAttribute("role", "status");
    item.innerHTML =
      '<span class="samakan-toast-bar"></span>' +
      '<div class="samakan-toast-body">' +
      '<p class="samakan-toast-title">' +
      (kind === "success" ? "Berhasil" : "Perhatian") +
      "</p>" +
      '<p class="samakan-toast-text"></p>' +
      "</div>" +
      '<button type="button" class="samakan-toast-close" aria-label="Tutup">×</button>';
    item.querySelector(".samakan-toast-text").textContent = text;
    host().appendChild(item);

    var hide = function () {
      if (item.classList.contains("is-out")) return;
      item.classList.add("is-out");
      setTimeout(function () {
        if (item.parentNode) item.parentNode.removeChild(item);
      }, 200);
    };
    item.querySelector(".samakan-toast-close").addEventListener("click", hide);
    setTimeout(hide, kind === "success" ? 3200 : 6500);
  }

  function showFlash() {
    var nodes = document.querySelectorAll("[data-flash]");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var kind = el.getAttribute("data-flash") === "ok" ? "success" : "error";
      var msg = (el.getAttribute("data-flash-text") || el.textContent || "").trim();
      if (msg) show(msg, kind);
      el.setAttribute("hidden", "hidden");
    }
  }

  window.SamakanToast = {
    show: show,
    error: function (msg) {
      show(msg, "error");
    },
    success: function (msg) {
      show(msg, "success");
    },
    sanitize: sanitize,
    messageFromResponse: messageFromResponse,
    messageForStatus: messageForStatus,
  };

  var loadDepth = 0;
  var loadTimer = 0;
  var locked = [];

  function loaderBox() {
    var el = document.getElementById("samakan-loader");
    if (el) return el;
    el = document.createElement("div");
    el.id = "samakan-loader";
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "assertive");
    el.innerHTML =
      '<div class="samakan-loader-card">' +
      '<div class="samakan-loader-spin" aria-hidden="true"></div>' +
      '<p class="samakan-loader-text">Menyimpan…</p>' +
      '<p class="samakan-loader-sub">Mohon tunggu, jangan tutup halaman</p>' +
      "</div>";
    document.body.appendChild(el);
    return el;
  }

  function lockControls(form) {
    if (!form || !form.querySelectorAll) return;
    var nodes = form.querySelectorAll("button, input[type=submit], input[type=file]");
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].disabled) continue;
      nodes[i].disabled = true;
      locked.push(nodes[i]);
    }
  }

  function unlockControls() {
    for (var i = 0; i < locked.length; i++) locked[i].disabled = false;
    locked = [];
  }

  function labelForAction(url, form, submitter) {
    var hint = String(
      (submitter && (submitter.getAttribute("data-loading") || submitter.textContent)) ||
        (form && form.getAttribute("data-loading")) ||
        url ||
        ""
    )
      .toLowerCase()
      .replace(/\s+/g, " ");
    if (/login|masuk/.test(hint)) return "Sedang masuk…";
    if (/delete|hapus/.test(hint)) return "Menghapus…";
    if (/upload|unggah|image|icon|logo|multipart/.test(hint)) return "Mengunggah…";
    return "Menyimpan…";
  }

  function showLoader(label) {
    loadDepth += 1;
    var el = loaderBox();
    var text = el.querySelector(".samakan-loader-text");
    if (text) text.textContent = label || "Menyimpan…";
    el.classList.add("is-on");
    document.body.style.overflow = "hidden";
    clearTimeout(loadTimer);
    loadTimer = setTimeout(function () {
      hideLoader(true);
    }, 20000);
  }

  function hideLoader(force) {
    loadDepth = force ? 0 : Math.max(0, loadDepth - 1);
    if (loadDepth > 0) return;
    clearTimeout(loadTimer);
    var el = document.getElementById("samakan-loader");
    if (el) el.classList.remove("is-on");
    document.body.style.overflow = "";
    unlockControls();
  }

  window.SamakanLoader = {
    show: showLoader,
    hide: hideLoader,
    labelForAction: labelForAction,
  };

  window.samakanPost = function (url, opts) {
    opts = opts || {};
    if (window.SamakanLoader) {
      window.SamakanLoader.show(labelForAction(url, null, null));
    }
    return fetch(url, {
      method: opts.method || "POST",
      headers: opts.headers || {},
      body: opts.body,
      credentials: "same-origin",
    }).then(function (res) {
      if (res.ok) window.location.reload();
      else if (window.SamakanLoader) window.SamakanLoader.hide();
      return res;
    });
  };

  document.addEventListener(
    "submit",
    function (e) {
      var form = e.target;
      if (!form || form.tagName !== "FORM") return;
      if (String(form.getAttribute("method") || "get").toLowerCase() !== "post") return;
      if (form.getAttribute("data-no-loader") === "1") return;
      lockControls(form);
      showLoader(labelForAction(form.action, form, e.submitter));
    },
    true
  );

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", showFlash);
  } else {
    showFlash();
  }
})();
