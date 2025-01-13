const express = require('express');
const router = express.Router();
const TarifsDeTempsFortController = require('../Controllers/TarifsDeTempsFortController');

router.get('/show', TarifsDeTempsFortController.showPeakTarifs);
router.post('/add', TarifsDeTempsFortController.addPeakTarifAndUpdateChauffeurs);
router.put('/update/:id', TarifsDeTempsFortController.updatePeakTarif);
module.exports = router;
