const express = require("express");
const router = express.Router();
const budgetController = require("../controllers/budget.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.use(authMiddleware);

router.post("/", budgetController.create);
router.get("/", budgetController.getAll);
router.put("/:id", budgetController.update);
router.delete("/:id", budgetController.delete);

module.exports = router;