const firestoreModule = require("../services/config");
const firestore = firestoreModule.firestoreApp.firestore();

/**
 * Récupérer toutes les demandes de trajet
 */
const getAllRideRequests = async (req, res) => {
  try {
    const rideRequestsRef = firestore.collection("AllRideRequests");
    const snapshot = await rideRequestsRef.get();

    if (snapshot.empty) {
      return res.status(404).json({ error: "Aucune demande de trajet trouvée" });
    }

    const rideRequests = {};
    snapshot.forEach(doc => {
      rideRequests[doc.id] = doc.data();
    });
    
    return res.status(200).json(rideRequests);
  } catch (error) {
    console.error("Erreur lors de la récupération des demandes de trajet :", error);
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

    const rideRequestRef = firestore.collection("AllRideRequests").doc(rideRequestId);
    const doc = await rideRequestRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Demande de trajet non trouvée" });
    }

    // Supprimer la demande
    await rideRequestRef.delete();

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
  deleteRideRequest,
}
