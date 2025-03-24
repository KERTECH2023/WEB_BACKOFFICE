const express = require("express");
const syncSoldeData = require("../Controllersfr/SoldeController");
const router = express.Router();

router.get("/solde/:driverId", syncSoldeData.getSoldeById);
router.get("/soldetotal", syncSoldeData.getTotalSolde);
router.get("/getDriverFinancialInfo/:driverId", syncSoldeData.getDriverFinancialInfo);
router.post("/updatesolde/:driverId", syncSoldeData.updateSolde);
router.post("/updatesoldecarte/:driverId", syncSoldeData.updateSoldecarte);
router.post("/facturepayer", syncSoldeData.updateTripsAsPaid);

module.exports = router;

