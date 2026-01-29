"use strict";

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user");

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

function cookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,          // true kalau https
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
  };
}

async function renderLogin(req, res) {
  return res.render("auth/login", {
    error: null,
    email: ""
  });
}

async function login(req, res) {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).render("auth/login", {
        error: "Email dan password wajib diisi",
        email,
      });
    }

    const user = await User.findUserByEmail(email);
    if (!user || !user.is_active) {
      return res.status(401).render("auth/login", {
        error: "Email atau password salah",
        email,
      });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).render("auth/login", {
        error: "Email atau password salah",
        email,
      });
    }

    const token = signToken({
      id: user.id,
      role: user.role,
      name: user.name
    });

    res.cookie("token", token, cookieOptions());
    return res.redirect("/admin");
  } catch (err) {
    console.error(err);
    return res.status(500).render("auth/login", {
      error: "Terjadi kesalahan server",
      email: String(req.body.email || ""),
    });
  }
}

function logout(req, res) {
  res.clearCookie("token");
  return res.redirect("/auth/login");
}

// Middleware protect route (KenariTower-style)
async function requireAuthJWT(req, res, next) {
  try {
    const token = req.cookies?.token;
    if (!token) return res.redirect("/auth/login");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findUserById(decoded.id);

    if (!user || !user.is_active) {
      res.clearCookie("token");
      return res.redirect("/auth/login");
    }

    req.user = user; // biar controller/view bisa pakai user
    next();
  } catch (err) {
    res.clearCookie("token");
    return res.redirect("/auth/login");
  }
}

module.exports = {
  renderLogin,
  login,
  logout,
  requireAuthJWT,
};
