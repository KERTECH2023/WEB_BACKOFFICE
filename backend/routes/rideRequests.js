const express = require("express");
const router = express.Router();
const RideRequests = require("../Controllers/rideRequestsController");

// Route pour récupérer toutes les demandes
router.get("/ride-requests", RideRequests.getAllRideRequests);


// Route pour supprimer une demande spécifique
router.delete("/ride-requests/:rideRequestId", RideRequests.deleteRideRequest);

module.exports = router;
