const firestoreModule = require("../services/config");
const firestore = firestoreModule.firestoreApp.firestore();
const RideRequest = require("../Models/AllRideRequest");
/**
 * Récupérer toutes les demandes de trajet
 */

/**
 * Récupérer toutes les demandes de trajet
 */
const getAllRideRequests = async (req, res) => {
  try {
    // Étape 1 : Synchroniser Firestore → MongoDB
    const rideRequestsRef = firestore.collection("AllRideRequests");
    const snapshot = await rideRequestsRef.get();

    if (!snapshot.empty) {
      for (const doc of snapshot.docs) {
        const id = doc.id;
        const firestoreData = doc.data();

        // Chercher l'existant dans MongoDB
        const mongoDoc = await RideRequest.findById(id).lean();

        if (!mongoDoc) {
          // Insert si inexistant
          await RideRequest.create({ _id: id, ...firestoreData });
        } else if (mongoDoc.status !== firestoreData.status) {
          // Update si le status est différent
          await RideRequest.updateOne({ _id: id }, { $set: firestoreData });
        }
      }
    }

    // Étape 2 : Lire directement depuis MongoDB (affichage)
    const rideRequests = await RideRequest.find().lean();

    if (!rideRequests || rideRequests.length === 0) {
      return res.status(404).json({ error: "Aucune demande de trajet trouvée" });
    }

    // Transformer en objet clé-valeur (même format que Firestore)
    const rideRequestsObj = {};
    for (const reqItem of rideRequests) {
      rideRequestsObj[reqItem._id] = reqItem;
    }

    return res.status(200).json(rideRequestsObj);
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
    const rideRequestId = req.params.rideRequestId;

    if (!rideRequestId) {
      return res.status(400).json({ error: "ID de la demande requis" });
    }

    // Vérifie si le document existe dans Firestore
    const rideRequestRef = firestore.collection("AllRideRequests").doc(rideRequestId);
    const doc = await rideRequestRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Demande de trajet non trouvée dans Firestore" });
    }

    // Supprimer de Firestore
    await rideRequestRef.delete();

    // Supprimer aussi de MongoDB
    await RideRequest.deleteOne({ _id: rideRequestId });

    return res.status(200).json({
      message: "Demande de trajet supprimée avec succès dans Firestore et MongoDB",
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



