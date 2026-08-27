"use strict";
const jwt = require('jsonwebtoken')

function requireAuthJWT(req, res, next) {
  if (!req.cookies || !req.cookies.token) return res.redirect("/auth/login");
  try {
    const payload = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
    req.user = {
      role: payload.role,
      name: payload.name || "Admin",
      token: req.cookies.token,
    };
    return next();
  } catch (err) {
    res.clearCookie("token");
    return res.redirect("/auth/login");
  }
}

module.exports = { requireAuthJWT };
