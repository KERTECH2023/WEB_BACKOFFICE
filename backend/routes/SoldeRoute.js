const express = require("express");
const syncSoldeData = require("../Controllers/SoldeController");
const router = express.Router();

router.get("/solde", syncSoldeData.getSoldeById);

module.exports = router;

