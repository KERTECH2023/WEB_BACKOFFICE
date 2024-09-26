const mongoose = require("mongoose");
const cron = require("node-cron");
const RideRequest = require("../Models/AllRideRequest");
const Facture = require("../Models/Facture");
const GlobalCounter = require("../Models/GlobalCounter");

async function saveRide(req, res) {
  try {
    const {
      HealthStatus,

      destination,

      driverLocation,
      fareAmount,
      driverName,
      driverPhone,
      source,
      status,
      time,
      userName,
      userPhone,
    } = req.body;

    // Créer une nouvelle instance de RideRequest
    const newRideRequest = new RideRequest({
      HealthStatus: HealthStatus,
      destination: {
        latitude: destination.latitude,
        longitude: destination.longitude,
      },
      driverLocationData: {
        latitude: driverLocation.latitude,
        longitude: driverLocation.longitude,
      },
      fareAmount: fareAmount,
      driverPhone: driverPhone,
      source: {
        latitude: source.latitude,
        longitude: source.longitude,
      },
      status: status,
      time: time,
      userName: userName,
      userPhone: userPhone,
    });

    // Sauvegarder la demande de trajet dans la base de données
    await newRideRequest.save();

    res
      .status(201)
      .json({ message: "Demande de trajet sauvegardée avec succès." });
  } catch (error) {
    console.error(
      "Erreur lors de la sauvegarde de la demande de trajet :",
      error
    );
    res.status(500).json({
      message: "Erreur lors de la sauvegarde de la demande de trajet.",
    });
  }
}

module.exports = { saveRide };
