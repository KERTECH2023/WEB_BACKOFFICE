// routes/rideRequests.js
const express = require('express');
const router = express.Router();
const ReservationTaxi = require('../Controllers/ReservationTaxiContro');

router.post('/rides', ReservationTaxi.createRideRequest);

module.exports = router;
