"use strict";

const Dashboard = require("../models/dashboard");
const { userErrorMessage } = require("../utils/public-error");

const emptyStats = {
  totalItems: 0,
  activeItems: 0,
  media: 0,
  completeness: 0,
  readyCount: 0,
  emptyCount: 0,
  modules: [],
  readiness: [],
  needsWork: [],
};

async function renderDashboard(req, res) {
  let stats = emptyStats;
  let error = null;
  try {
    stats = await Dashboard.getDashboardStats();
  } catch (err) {
    console.error("dashboard stats:", err);
    error = userErrorMessage(err, "Ringkasan dashboard belum bisa dimuat.");
  }

  res.render("admin/dashboard", {
    user: req.user,
    stats,
    error,
  });
}

module.exports = { renderDashboard };
