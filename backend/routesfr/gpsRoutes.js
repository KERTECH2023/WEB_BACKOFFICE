const express = require('express')
const  router = express.Router()


const gpsContro  = require('../Controllersfr/gpsController')
router.post('/getallgpsposition', gpsContro.getAllPosition);


module.exports = router
