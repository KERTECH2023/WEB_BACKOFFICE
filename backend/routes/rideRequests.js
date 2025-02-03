const express = require("express");
const router = express.Router();
const RideRequests = require("../Controllers/rideRequestsController");

// Route pour récupérer toutes les demandes
router.get("/ride-requests", RideRequests.getAllRideRequests);

// Route pour mettre à jour une demande spécifique
router.put("/ride-requests/:rideRequestId", RideRequests.updateRideRequest);

// Route pour supprimer une demande spécifique
router.delete("/ride-requests/:rideRequestId", RideRequests.deleteRideRequest);

module.exports = router;
