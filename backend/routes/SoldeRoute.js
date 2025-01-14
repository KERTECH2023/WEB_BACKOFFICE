const express = require("express");
const syncSoldeDat = require("../controllers/SoldeController");
const router = express.Router();

router.get("/solde", syncSoldeDat.syncSoldeData);

module.exports = router;

