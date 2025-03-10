const express = require('express')
const  router = express.Router()


const gpsContro  = require('../Controllers/gpsController')
router.get('/getallgpsposition', gpsContro.getAllPosition);


module.exports = router
