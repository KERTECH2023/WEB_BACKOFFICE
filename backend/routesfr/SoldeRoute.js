const express = require("express");
const syncSoldeData = require("../Controllersfr/SoldeController");
const router = express.Router();

router.get("/solde/:driverId", syncSoldeData.getSoldeById);
router.get("/soldetotal", syncSoldeData.getTotalSolde);
router.get("/getDriverFinancialInfo", syncSoldeData.getDriverFinancialInfo);
router.put("/update/:driverId", syncSoldeData.updateSolde);

module.exports = router;

