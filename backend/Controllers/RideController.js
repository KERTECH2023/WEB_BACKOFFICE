const mongoose = require("mongoose");
const RideRequest = require("../Models/AllRideRequest");
const firestoreModule = require("../services/config");
const realtimeDB = firestoreModule.firestoreApp.database();



async function saveRide(req, res) {
  try {
    const {
      firebaseRiderRequestsID, // Champ ajouté
      healthStatus,
      destination,
      destinationAddress,
      driverId,
      driverName,
      driverPhone,
      driverPhoto,
      driverLocationData,
      carDetails,
      fareAmount,
      source,
      sourceAddress,
      status,
      time,
      userId,
      userName,
      userPhone,
    } = req.body;

    // Créer une nouvelle instance de RideRequest
    const newRideRequest = new RideRequest({
      firebaseRiderRequestsID: firebaseRiderRequestsID,
      healthStatus: healthStatus || "none",
      destination: {
        latitude: destination.latitude,
        longitude: destination.longitude,
      },
      destinationAddress: destinationAddress,
      driverId: driverId,
      driverName: driverName,
      driverPhone: driverPhone,
      driverPhoto: driverPhoto,
      driverLocationData: {
        latitude: driverLocationData.latitude,
        longitude: driverLocationData.longitude,
      },
      carDetails: {
        carModel: carDetails.carModel,
        carNumber: carDetails.carNumber,
      },
      fareAmount: fareAmount,
      source: {
        latitude: source.latitude,
        longitude: source.longitude,
      },
      sourceAddress: sourceAddress,
      status: status,
      time: time,
      userId: userId,
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





async function saveRideFirebaseToMongoDB(req, res) {
  try {
    // Récupérer toutes les RideRequests depuis Firebase
    const snapshot = await realtimeDB.ref("AllRideRequests").once("value");
    const rideRequests = snapshot.val();

    if (!rideRequests) {
      console.log("Aucune donnée trouvée dans Firebase.");
      return res.status(404).json({ message: "Aucune donnée trouvée dans Firebase." });
    }

    let savedCount = 0; // Compteur pour suivre le nombre d'insertions

    // Parcourir les rideRequests et sauvegarder dans MongoDB
    for (const [firebaseRiderRequestsID, rideRequest] of Object.entries(rideRequests)) {
      // Vérifier si la rideRequest existe déjà dans MongoDB
      const existingRequest = await RideRequest.findOne({ firebaseRiderRequestsID });

      if (existingRequest) {
        console.log(`RideRequest ${firebaseRiderRequestsID} existe déjà dans MongoDB.`);
        continue; // Passer à la suivante
      }

      // Vérifier et attribuer des valeurs par défaut si les propriétés sont manquantes
      const newRideRequest = new RideRequest({
        firebaseRiderRequestsID,
        driverId: rideRequest.driverId || "",
        driverName: rideRequest.driverName || "",
        driverPhone: rideRequest.driverPhone || "",
        driverPhoto: rideRequest.driverPhoto || "",
        driverLocationData: {
          latitude: rideRequest.driverLocationData?.latitude || 0,
          longitude: rideRequest.driverLocationData?.longitude || 0,
        },
        carDetails: {
          carModel: rideRequest.carDetails?.carModel || "Unknown",
          carNumber: rideRequest.carDetails?.carNumber || "Unknown",
        },
        fareAmount: rideRequest.fareAmount || 0,
        healthStatus: rideRequest.healthStatus || "none",
        source: {
          latitude: rideRequest.source?.latitude || 0,
          longitude: rideRequest.source?.longitude || 0,
        },
        sourceAddress: rideRequest.sourceAddress || "Unknown",
        destination: {
          latitude: rideRequest.destination?.latitude || 0,
          longitude: rideRequest.destination?.longitude || 0,
        },
        destinationAddress: rideRequest.destinationAddress || "Unknown",
        status: rideRequest.status || "Pending",
        time: rideRequest.time || new Date(),
        userId: rideRequest.userId || "",
        userName: rideRequest.userName || "",
        userPhone: rideRequest.userPhone || "",
      });

      // Sauvegarder dans MongoDB
      await newRideRequest.save();
      savedCount++;
      console.log(`RideRequest ${firebaseRiderRequestsID} sauvegardée avec succès.`);
    }

    console.log("Synchronisation terminée.");
    res.status(200).json({
      message: "Synchronisation terminée.",
      savedCount,
    });
  } catch (error) {
    console.error("Erreur lors de la synchronisation des données Firebase vers MongoDB :", error);
    res.status(500).json({
      message: "Erreur lors de la synchronisation des données Firebase vers MongoDB.",
      error: error.message,
    });
  }
}

module.exports = { saveRide,saveRideFirebaseToMongoDB };
