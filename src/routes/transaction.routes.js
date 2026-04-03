const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transaction.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.use(authMiddleware); // All transaction routes require authentication

router.post("/", transactionController.create);
router.get("/", transactionController.getAll);
router.get("/stats", transactionController.getStats);
router.get("/:id", transactionController.getOne);
router.put("/:id", transactionController.update);
router.delete("/:id", transactionController.delete);

module.exports = router;