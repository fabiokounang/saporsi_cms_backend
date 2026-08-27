(function () {
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
    if (method !== "GET" && method !== "HEAD" && method !== "OPTIONS") {
      var headers = new Headers(init.headers || {});
      if (!headers.has("X-CSRF-Token")) headers.set("X-CSRF-Token", token());
      init.headers = headers;
    }
    return origFetch.call(this, input, init);
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
      origFetch
        .call(window, form.action, {
          method: "POST",
          headers: { "X-CSRF-Token": token() },
          body: new FormData(form),
          credentials: "same-origin",
          redirect: "follow",
        })
        .then(function (res) {
          if (res.url) window.location.assign(res.url);
          else window.location.reload();
        });
    },
    true
  );
})();
