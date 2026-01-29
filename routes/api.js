const router = require("express").Router();
const apiController = require('../controllers/api');

router.get('/public/site', apiController.getPublicSiteData);

module.exports = router;
