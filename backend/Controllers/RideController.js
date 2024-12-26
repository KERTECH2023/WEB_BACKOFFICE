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

async function getAllRideRequests(req, res) {
  try {
    // Récupérer toutes les demandes de trajet depuis MongoDB
    const rideRequests = await RideRequest.find();

    if (!rideRequests || rideRequests.length === 0) {
      return res.status(404).json({
        message: "Aucune demande de trajet trouvée.",
      });
    }

    res.status(200).json({
      message: "Toutes les demandes de trajet récupérées avec succès.",
      rideRequests,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des demandes de trajet :", error);
    res.status(500).json({
      message: "Erreur lors de la récupération des demandes de trajet.",
      error: error.message,
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
// Fonction pour récupérer les demandes de trajet par userId
async function getRideRequestsByUserId(req, res) {
  try {
    const { userId } = req.params;

    // Rechercher les demandes de trajet associées à l'userId
    const rideRequests = await RideRequest.find({ userId });

    if (!rideRequests || rideRequests.length === 0) {
      return res.status(404).json({
        message: `Aucune demande de trajet trouvée pour l'utilisateur avec l'ID ${userId}.`,
      });
    }

    res.status(200).json({
      message: `Demandes de trajet récupérées avec succès pour l'utilisateur ${userId}.`,
      rideRequests,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des demandes de trajet :", error);
    res.status(500).json({
      message: "Erreur lors de la récupération des demandes de trajet.",
    });
  }
}
async function getRideRequestsByStatus(req, res) {
  try {
    const { status } = req.params;

    // Rechercher les demandes de trajet ayant le statut spécifié
    const rideRequests = await RideRequest.find({ status });

    if (!rideRequests || rideRequests.length === 0) {
      return res.status(404).json({
        message: `Aucune demande de trajet trouvée avec le statut "${status}".`,
      });
    }

    res.status(200).json({
      message: `Demandes de trajet récupérées avec succès pour le statut "${status}".`,
      rideRequests,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des demandes de trajet :", error);
    res.status(500).json({
      message: "Erreur lors de la récupération des demandes de trajet.",
      error: error.message,
    });
  }
}
async function updateRideRequestStatus(req, res) {
  try {
    const { rideRequestId } = req.params; // ID de la demande de trajet
    const { status } = req.body; // Nouveau statut

    // Vérifier si le statut est fourni
    if (!status) {
      return res.status(400).json({ message: "Le champ 'status' est requis." });
    }

    // Mettre à jour le statut dans la base de données
    const updatedRideRequest = await RideRequest.findByIdAndUpdate(
      rideRequestId,
      { status },
      { new: true } // Retourner le document mis à jour
    );

    if (!updatedRideRequest) {
      return res.status(404).json({
        message: `Aucune demande de trajet trouvée avec l'ID ${rideRequestId}.`,
      });
    }

    res.status(200).json({
      message: "Le statut de la demande de trajet a été mis à jour avec succès.",
      rideRequest: updatedRideRequest,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut :", error);
    res.status(500).json({
      message: "Erreur lors de la mise à jour du statut.",
      error: error.message,
    });
  }
}

module.exports = { saveRide,saveRideFirebaseToMongoDB,getRideRequestsByUserId,getAllRideRequests,getRideRequestsByStatus,updateRideRequestStatus,};
