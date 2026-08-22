const router = require("express").Router();
const ctrl = require("../controllers/productController");
const auth = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");
const upload = require("../middlewares/upload");

router.get("/", ctrl.getAll);
router.get("/:id", ctrl.getOne);
router.post("/", auth, requireRole("admin"), ctrl.create);
router.put("/:id", auth, requireRole("admin"), ctrl.update);
router.delete("/:id", auth, requireRole("admin"), ctrl.remove);
router.post(
  "/:id/images",
  auth,
  requireRole("admin"),
  upload.array("images", 5),
  ctrl.uploadImages
);

module.exports = router;