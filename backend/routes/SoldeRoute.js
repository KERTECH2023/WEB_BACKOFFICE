const express = require("express");
const syncSoldeData = require("../Controllers/SoldeController");
const router = express.Router();

router.get("/solde/:driverId", syncSoldeData.getSoldeById);
router.get("/soldetotal", syncSoldeData.getTotalSolde);
router.put("/solde/:driverId", syncSoldeData.updateSolde);

module.exports = router;

