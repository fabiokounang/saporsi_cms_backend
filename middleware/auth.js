"use strict";
const jwt = require('jsonwebtoken')

function requireAuthJWT(req, res, next) {
  if (!req.cookies || !req.cookies.token) return res.redirect("/auth/login");
  const token = req.cookies.token;
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  req.user = {
    role: payload.role,
    name: payload.name,
    token: req.cookies.token
  }

  
  next();
}

module.exports = { requireAuthJWT };
