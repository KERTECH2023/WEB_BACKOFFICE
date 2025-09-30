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
    // --- Étape 1 : Récupérer tous les docs Firestore ---
    const snapshot = await firestore.collection("AllRideRequests").get();
    const firestoreDocs = snapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }));
    const firestoreIds = firestoreDocs.map(doc => doc.id);

    // --- Étape 2 : Synchroniser Firestore → MongoDB ---
    await Promise.all(
      firestoreDocs.map(async ({ id, data }) => {
        // 🔹 Conversion sécurisée du champ time
        if (data.time && typeof data.time === 'object') {
          data.time = {
            _seconds: data.time.seconds || data.time._seconds || 0,
            _nanoseconds: data.time.nanoseconds || data.time._nanoseconds || 0
          };
        } else {
          data.time = { _seconds: 0, _nanoseconds: 0 };
        }

        // Vérifier si le doc existe déjà
        const mongoDoc = await RideRequest.findOne({ firestoreId: id, archived: false }).lean();

        if (!mongoDoc) {
          // Création dans MongoDB
          await RideRequest.create({ firestoreId: id, ...data });
        } else {
          // Mise à jour si existant
          await RideRequest.updateOne({ firestoreId: id, archived: false }, { $set: data });
        }
      })
    );

    // --- Étape 3 : Créer une version historique si FirestoreId supprimé ---
    const mongoDocs = await RideRequest.find({ archived: false }).lean();

    await Promise.all(
      mongoDocs.map(async (mongoDoc) => {
        if (!firestoreIds.includes(mongoDoc.firestoreId)) {
          // FirestoreId supprimé → créer une copie avec nouvel _id et archived=true
          const newDoc = { ...mongoDoc, archived: true };
          delete newDoc._id; // MongoDB génère un nouvel _id
          await RideRequest.create(newDoc);
        }
      })
    );

    // --- Étape 4 : Retourner tous les docs depuis MongoDB ---
    await RideRequest.deleteMany({ status: "Cancelled" });
    const rideRequests = await RideRequest.find().lean();
    

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
    const rideRequestId = req.params.rideRequestId;

    if (!rideRequestId) {
      return res.status(400).json({ error: "ID de la demande requis" });
    }

    // 🔹 Référence Firestore
    const rideRequestRef = firestore.collection("AllRideRequests").doc(rideRequestId);
    const doc = await rideRequestRef.get();

    if (doc.exists) {
      // Supprimer de Firestore
      await rideRequestRef.delete();
    } else {
      console.warn(`La course ${rideRequestId} n'existe pas dans Firestore`);
    }

    // 🔹 Supprimer de MongoDB
    const mongoResult = await RideRequest.deleteOne({ firestoreId: rideRequestId });
    if (mongoResult.deletedCount === 0) {
      console.warn(`La course ${rideRequestId} n'existe pas dans MongoDB`);
    }

    return res.status(200).json({
      message: "Demande de trajet supprimée avec succès (Firestore et MongoDB si existants)",
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












