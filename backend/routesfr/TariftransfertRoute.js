const express = require('express');
const router = express.Router();
const tarifController = require('../Controllersfr/TariftransfertConto');


router.get('/', tarifController.getAllTarifs);
router.post('/add', tarifController.addTarif);
router.put('/:id', tarifController.updateTarif);

module.exports = router;
