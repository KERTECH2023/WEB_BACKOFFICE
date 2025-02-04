const express = require('express')
const  router = express.Router()


const transContro  = require('../Controllers/TransfertContro')

router.get('/transfert', transContro.getAllTransfers);


module.exports = router
