const router = require("express").Router();
const { requireAuthJWT } = require("../middleware/auth");
const { body } = require("express-validator");

const {
  renderNavbar,
  saveNavbar,
  addNavbarItem,
  removeNavbarItem
} = require("../controllers/navbar");
const {
  renderHero,
  saveHero,
  addHeroImage,
  saveHeroImages,
  removeHeroImage
} = require("../controllers/hero");
const {
  renderAbout, saveAbout,
  addAboutCard, saveAboutCards, deleteAboutCard,
  addAboutPoint, saveAboutPoints, deleteAboutPoint,
} = require("../controllers/about");

const {
  renderServices,
  saveServicesHeader,
  addService,
  saveServiceItems,
  deleteService,
} = require("../controllers/services");
const {
  renderGallery,
  saveGalleryHeader,
  addGalleryItem,
  saveGalleryItem,
  deleteGalleryItem,
} = require("../controllers/gallery");
const {
  renderLocations,
  saveLocationsHeader,
  addLocation,
  saveLocations,
  deleteLocation,
} = require("../controllers/locations");

const {
  renderPartners,
  savePartnerHeader,
  addPartner,
  savePartner,
  deletePartner
} = require("../controllers/partners");

const {
  renderFooter,
  saveFooter,
  addQuickLink,
  saveQuickLinks,
  deleteQuickLink,
} = require("../controllers/footer");
const { pageCTA, saveCTA } = require("../controllers/cta");

const {
  renderHowItWorks,
  saveHeader,
  addItem,
  saveItems,
  deleteItem,
} = require("../controllers/howitworks");
;
const early = require("../controllers/earlyprogram");

const ContactCtrl = require("../controllers/contact");
const { navbarUpload, heroUpload, galleryUpload, partnerUpload, serviceUpload, howItWorksUpload } = require("../utils/uploader");


router.get("/", requireAuthJWT, (req, res) => {
  res.render("admin/dashboard", { user: req.user });
});

router.get("/navbar", requireAuthJWT, renderNavbar);
router.post(
  "/navbar",
  requireAuthJWT,
  navbarUpload.single("logo"), // ⬅️ ini penting
  saveNavbar
);
router.post("/navbar/add", requireAuthJWT, addNavbarItem);
router.post("/navbar/:id/delete", requireAuthJWT, removeNavbarItem);

// Hero CMS
router.get("/hero", requireAuthJWT, renderHero);
router.post("/hero", requireAuthJWT, saveHero);

// Images
router.post("/hero-images/add", requireAuthJWT, heroUpload.single("image"), addHeroImage);
router.post("/hero-images/save", requireAuthJWT, saveHeroImages);
router.post("/hero-images/:id/delete", requireAuthJWT, removeHeroImage);

// ABOUT
router.get("/about", requireAuthJWT, renderAbout);
router.post("/about", requireAuthJWT, saveAbout);

/* 2 card besar */
router.post("/about-cards/add", requireAuthJWT, addAboutCard);
router.post("/about-cards/save", requireAuthJWT, saveAboutCards);
router.post("/about-cards/:id/delete", requireAuthJWT, deleteAboutCard);

/* 4 point kecil */
router.post("/about-points/add", requireAuthJWT, addAboutPoint);
router.post("/about-points/save", requireAuthJWT, saveAboutPoints);
router.post("/about-points/:id/delete", requireAuthJWT, deleteAboutPoint);


// SERVICES
router.get("/services", requireAuthJWT, renderServices);
router.post("/services/header", requireAuthJWT, saveServicesHeader);

router.post("/services/add", requireAuthJWT, addService);
router.post("/services/save", requireAuthJWT, serviceUpload.any(), saveServiceItems);
router.post("/services/:id/delete", requireAuthJWT, deleteService);

// HOW IT WORKS
router.get("/how-it-works", requireAuthJWT, renderHowItWorks);
router.post("/how-it-works/header", requireAuthJWT, saveHeader);
router.post("/how-it-works/add", requireAuthJWT, addItem);
router.post(
  "/how-it-works/save",
  requireAuthJWT,
  howItWorksUpload.any(),
  saveItems
);
router.post("/how-it-works/:id/delete", requireAuthJWT, deleteItem);

// GALLERY
router.get("/gallery", requireAuthJWT, renderGallery);
router.post("/gallery/header", requireAuthJWT, saveGalleryHeader);

router.post("/gallery/add", requireAuthJWT, galleryUpload.single("image"), addGalleryItem);
router.post("/gallery/:id", requireAuthJWT, galleryUpload.single("image"), saveGalleryItem);
router.post("/gallery/:id/delete", requireAuthJWT, deleteGalleryItem);

// LOCATION
router.get("/locations", requireAuthJWT, renderLocations);
router.post("/locations/header", requireAuthJWT, saveLocationsHeader);

router.post("/locations/add", requireAuthJWT, addLocation);
router.post("/locations/save", requireAuthJWT, saveLocations);
router.post("/locations/:id/delete", requireAuthJWT, deleteLocation);

// PARTNERS
router.get("/partners", requireAuthJWT, renderPartners);
router.post("/partners/header", requireAuthJWT, savePartnerHeader);
router.post("/partners/add", requireAuthJWT, partnerUpload.single("logo"), addPartner);
router.post("/partners/:id", requireAuthJWT, partnerUpload.single("logo"), savePartner);
router.post("/partners/:id/delete", requireAuthJWT, deletePartner);

// EARLY PROGRAM
router.get("/early-program", requireAuthJWT, early.page);
router.post("/early-program/header", requireAuthJWT, early.saveHeader);
router.post("/early-program/benefits/add", requireAuthJWT, early.addBenefit);
router.post("/early-program/benefits/save", requireAuthJWT, early.saveBenefits);
router.post("/early-program/benefits/delete/:id", requireAuthJWT, early.deleteBenefit);

// contact
router.get("/contact", requireAuthJWT, ContactCtrl.renderContact);
router.post(
  "/contact/header",
  requireAuthJWT,
  body("badge_id").trim().notEmpty().withMessage("Badge (ID) wajib diisi"),
  body("badge_en").trim().notEmpty().withMessage("Badge (EN) wajib diisi"),
  body("title_id").trim().notEmpty().withMessage("Title (ID) wajib diisi"),
  body("title_en").trim().notEmpty().withMessage("Title (EN) wajib diisi"),
  body("steps_title_id").trim().notEmpty().withMessage("Steps title (ID) wajib diisi"),
  body("steps_title_en").trim().notEmpty().withMessage("Steps title (EN) wajib diisi"),
  body("button_label_id").trim().notEmpty().withMessage("Button label (ID) wajib diisi"),
  body("button_label_en").trim().notEmpty().withMessage("Button label (EN) wajib diisi"),
  ContactCtrl.saveContactHeader
);
router.post("/contact/steps/add", requireAuthJWT, ContactCtrl.addContactStep);
router.post("/contact/steps/save", requireAuthJWT, ContactCtrl.saveContactSteps);
router.post("/contact/steps/:id/delete", requireAuthJWT, ContactCtrl.deleteContactStep);

// CTA 
router.get("/cta", requireAuthJWT, pageCTA);
router.post("/cta/save", requireAuthJWT, saveCTA);

// FOOTER
router.get("/footer", requireAuthJWT, renderFooter);
router.post("/footer", requireAuthJWT, saveFooter);

router.post("/footer/links/add", requireAuthJWT, addQuickLink);
router.post("/footer/links/save", requireAuthJWT, saveQuickLinks);
router.post("/footer/links/:id/delete", requireAuthJWT, deleteQuickLink);


module.exports = router;
