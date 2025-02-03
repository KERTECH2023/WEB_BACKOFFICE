const firestoreModule = require("../services/config");
const realtimeDB = firestoreModule.firestoreApp.database();

/**
 * Récupérer toutes les demandes de trajet
 */
const getAllRideRequests = async (req, res) => {
  try {
    const rideRequestsRef = realtimeDB.ref("AllRideRequests");
    const snapshot = await rideRequestsRef.once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({ error: "Aucune demande de trajet trouvée" });
    }

    const rideRequests = snapshot.val();
    return res.status(200).json(rideRequests);
  } catch (error) {
    console.error("Erreur lors de la récupération des demandes de trajet :", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};

/**
 * Mettre à jour une demande de trajet spécifique
 */
const updateRideRequest = async (req, res) => {
  try {
    const rideRequestId = req.params.rideRequestId; // ID de la demande à mettre à jour
    const updatedData = req.body; // Données à mettre à jour

    if (!rideRequestId) {
      return res.status(400).json({ error: "ID de la demande requis" });
    }

    const rideRequestRef = realtimeDB.ref(`AllRideRequests/${rideRequestId}`);
    const snapshot = await rideRequestRef.once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({ error: "Demande de trajet non trouvée" });
    }

    // Mettre à jour les données
    await rideRequestRef.update(updatedData);

    return res.status(200).json({
      message: "Demande de trajet mise à jour avec succès",
      rideRequestId: rideRequestId,
      updatedData: updatedData,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la demande de trajet :", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};

/**
 * Supprimer une demande de trajet spécifique
 */
const deleteRideRequest = async (req, res) => {
  try {
    const rideRequestId = req.params.rideRequestId; // ID de la demande à supprimer

    if (!rideRequestId) {
      return res.status(400).json({ error: "ID de la demande requis" });
    }

    const rideRequestRef = realtimeDB.ref(`AllRideRequests/${rideRequestId}`);
    const snapshot = await rideRequestRef.once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({ error: "Demande de trajet non trouvée" });
    }

    // Supprimer la demande
    await rideRequestRef.remove();

    return res.status(200).json({
      message: "Demande de trajet supprimée avec succès",
      rideRequestId: rideRequestId,
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de la demande de trajet :", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};

module.exports = {
  getAllRideRequests,
  updateRideRequest,
  deleteRideRequest,
};