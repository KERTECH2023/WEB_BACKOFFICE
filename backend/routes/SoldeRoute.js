const express = require("express");
const { syncSoldeData } = require("../controllers/SoldeController");
const router = express.Router();

router.get("/solde", syncSoldeData.syncSoldeData);

module.exports = router;

