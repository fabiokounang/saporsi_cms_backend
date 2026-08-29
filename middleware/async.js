"use strict";

/**
 * Express 4 tidak menangkap rejected Promise dari handler async.
 * Tanpa wrapper ini, GET /admin/hero bisa loading terus saat query DB gagal.
 */
function asyncRoute(fn) {
  if (typeof fn !== "function") return fn;
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

function wrapRouter(router) {
  for (const method of ["get", "post", "put", "patch", "delete"]) {
    const orig = router[method].bind(router);
    router[method] = (path, ...handlers) => orig(path, ...handlers.map(asyncRoute));
  }
  return router;
}

module.exports = { asyncRoute, wrapRouter };
