(function () {
  function toastError(msg) {
    if (window.SamakanLoader) window.SamakanLoader.hide(true);
    if (window.SamakanToast) window.SamakanToast.error(msg);
    else window.alert(msg);
  }

  function showLoader(label) {
    if (window.SamakanLoader) window.SamakanLoader.show(label || "Menyimpan…");
  }

  function readMessage(status, text) {
    if (window.SamakanToast) return window.SamakanToast.messageFromResponse(status, text);
    return "Gagal memproses permintaan. Coba lagi.";
  }

  function token() {
    var meta = document.querySelector('meta[name="csrf-token"]');
    return (meta && meta.getAttribute("content")) || "";
  }

  function ensureHidden(form) {
    var t = token();
    if (!t || !form || !form.querySelector) return;
    var existing = form.querySelector('input[name="_csrf"]');
    if (existing) {
      existing.value = t;
      return;
    }
    var input = document.createElement("input");
    input.type = "hidden";
    input.name = "_csrf";
    input.value = t;
    form.appendChild(input);
  }

  var origFetch = window.fetch;
  window.fetch = function (input, init) {
    init = init || {};
    var method = String(init.method || "GET").toUpperCase();
    var mutating = method !== "GET" && method !== "HEAD" && method !== "OPTIONS";
    var headers = new Headers(init.headers || {});
    if (mutating) {
      if (!headers.has("X-CSRF-Token")) headers.set("X-CSRF-Token", token());
      if (!headers.has("Accept")) headers.set("Accept", "application/json");
      if (init.loader !== false) {
        showLoader(
          window.SamakanLoader
            ? window.SamakanLoader.labelForAction(String(input || ""), null, null)
            : "Menyimpan…"
        );
      }
    }
    init.headers = headers;
    return origFetch
      .call(this, input, init)
      .then(function (res) {
        if (mutating && !res.ok) {
          res.clone().text().then(function (text) {
            toastError(readMessage(res.status, text));
          });
        }
        return res;
      })
      .catch(function (err) {
        if (mutating) toastError("Tidak bisa terhubung ke server. Cek koneksi, lalu coba lagi.");
        throw err;
      });
  };

  document.addEventListener(
    "submit",
    function (e) {
      var form = e.target;
      if (!form || form.tagName !== "FORM") return;
      if (String(form.getAttribute("method") || "get").toLowerCase() !== "post") return;
      ensureHidden(form);
      var enc = String(form.getAttribute("enctype") || form.enctype || "").toLowerCase();
      if (enc.indexOf("multipart") === -1) return;
      e.preventDefault();
      showLoader(
        window.SamakanLoader
          ? window.SamakanLoader.labelForAction(form.action, form, e.submitter)
          : "Mengunggah…"
      );
      origFetch
        .call(window, form.action, {
          method: "POST",
          headers: {
            "X-CSRF-Token": token(),
            Accept: "application/json",
          },
          body: new FormData(form),
          credentials: "same-origin",
          redirect: "manual",
        })
        .then(function (res) {
          // Jangan assign res.url: GET ke /admin/.../save tidak ada (404).
          if (res.status >= 300 && res.status < 400) {
            var loc = res.headers.get("location");
            window.location.assign(loc || form.getAttribute("action") || window.location.href);
            return;
          }
          if (res.ok) {
            window.location.reload();
            return;
          }
          return res.text().then(function (text) {
            toastError(readMessage(res.status, text));
          });
        })
        .catch(function () {
          toastError("Tidak bisa terhubung ke server. Cek koneksi, lalu coba lagi.");
        });
    },
    true
  );
})();
