const express = require('express')
const  router = express.Router()


const Tarif  = require('../Controllersfr/TarifsCnuit')


router.get('/show', Tarif.showtarifs)
router.post('/tarif', Tarif.addTarifAndUpdateChauffeurs);
router.put('/update',Tarif.updateTarifAndMajoration)


module.exports = router