const express = require('express')
const  router = express.Router()


const RideContro  = require('../Controllers/RideController')
router.post('/postRide', RideContro.saveRide);
router.post('/firebaseToMongoDB', RideContro.saveRideFirebaseToMongoDB);
router.get('/ride-requests/:userId', RideContro.getRideRequestsByUserId);

module.exports = router
