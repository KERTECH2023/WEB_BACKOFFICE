const express = require('express');
const router = express.Router();
const tarifsTempsFortController  = require('../Controllers/TarifsDeTempsFortController');




router.get('/show', tarifsTempsFortController.showtarifs);
router.post('/tarif', tarifsTempsFortController.addTarifAndUpdateChauffeurs);
router.put('/update',tarifsTempsFortController.updateTarifAndMajoration);
module.exports = router;
