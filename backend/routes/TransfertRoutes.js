const express = require("express");
const router = express.Router();
const transContro = require("../Controllers/TransfertContro");

// ✅ Récupérer tous les transferts
router.get("/transfert", transContro.getAllTransfers);

// ✅ Créer un nouveau transfert
router.post("/transfert", transContro.createTransfer);

// ✅ Mettre à jour un transfert et envoyer un email
router.put("/transfert/:id", transContro.updatetransfertandsendmail);

// ✅ Supprimer un transfert
router.delete("/transfert/:id", transContro.deleteTransfer);

module.exports = router;
