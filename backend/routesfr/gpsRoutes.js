const express = require('express')
const  router = express.Router()


const gpsContro  = require('../Controllersfr/gpsController')
router.get('/getallgpsposition', gpsContro.getAllPosition);


module.exports = router
