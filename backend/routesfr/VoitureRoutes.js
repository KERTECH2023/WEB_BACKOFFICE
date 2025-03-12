const express = require('express')
const  router = express.Router()


const VoitureCon  = require('../Controllersfr/VoitureContro')

const UploadImage = require ("../servicesfr/firebase");



const multer = require('multer')

const Multer = multer({
  storage:multer.memoryStorage(),
  limits:1024 * 1024,
})


router.post('/addvoiture/:id',Multer.fields([
    { name: "cartegrise", maxCount: 1  },
    { name: "assurance", maxCount: 1  },
  
  ]),UploadImage,VoitureCon.addvoiture)

  router.get('/getvoi/:id', VoitureCon.getBychauff);

  router.put(
    "/updatevoi/:id",
    Multer.fields([
      { name: "cartegrise", maxCount: 1 },
      { name: "assurance", maxCount: 1 },
  
    ]),
    UploadImage,
    VoitureCon.updateVoiture
  );
  
  module.exports = router
