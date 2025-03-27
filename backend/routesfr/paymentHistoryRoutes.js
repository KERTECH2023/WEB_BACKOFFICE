const express = require("express");
const router = express.Router();
const paymentHistoryController = require("../controllers/paymentHistoryController");

router.post("/payments", paymentHistoryController.addPayment);
router.get("/payments", paymentHistoryController.getPaymentsHistory);
router.get("/payments/:idFirebaseChauffeur", paymentHistoryController.getChauffeurPayments);
router.delete("/payments/:id", paymentHistoryController.deletePayment);

module.exports = router;
