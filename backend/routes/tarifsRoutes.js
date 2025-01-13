const express = require('express');
const router = express.Router();
const TarifsDeTempsFortController = require('../Controllers/TarifsDeTempsFortController');

router.get('/show', tarifsTempsFortController.showtarifs);

// Route pour ajouter ou mettre à jour un tarif et mettre à jour les chauffeurs
router.post('/tarif', tarifsTempsFortController.addTarifAndUpdateChauffeurs);

// Route pour mettre à jour un tarif existant
router.put('/update', tarifsTempsFortController.updateTarifAndMajoration);
module.exports = router;
