const router = require("express").Router();
const { renderLogin, login, logout } = require("../controllers/auth");

router.get("/login", renderLogin);
router.post("/login", login);
router.get("/logout", logout);

module.exports = router;
