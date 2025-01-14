const firestoreModule = require("../services/config");
const realtimeDB = firestoreModule.firestoreApp.database();
const mongoose = require("mongoose");

// Définir le schéma et le modèle MongoDB pour le solde
const soldeSchema = new mongoose.Schema({
  driverId: { type: String, required: true, unique: true },
  solde: { type: Number, required: true },
});

const SoldeModel = mongoose.model("Solde", soldeSchema);

// Fonction pour récupérer les données depuis Firebase et les sauvegarder dans MongoDB
const syncSoldeData = async (req, res) => {
  try {
    // Récupérer les données de la table Drivers dans Firebase
    const driversSnapshot = await realtimeDB.ref("Drivers").once("value");

    if (!driversSnapshot.exists()) {
      return res.status(404).json({ message: "Aucune donnée trouvée dans Drivers." });
    }

    const driversData = driversSnapshot.val();
    const soldeData = [];

    // Parcourir les données des chauffeurs
    for (const driverId in driversData) {
      if (driversData.hasOwnProperty(driverId)) {
        const { solde } = driversData[driverId];
        if (typeof solde === "number") {
          soldeData.push({ driverId, solde });
        }
      }
    }

    // Sauvegarder ou mettre à jour les données dans MongoDB
    for (const data of soldeData) {
      await SoldeModel.updateOne(
        { driverId: data.driverId },
        { $set: { solde: data.solde } },
        { upsert: true }
      );
    }

    return res.status(200).json({ message: "Synchronisation réussie.", data: soldeData });
  } catch (error) {
    console.error("Erreur lors de la synchronisation :", error);
    return res.status(500).json({ message: "Erreur lors de la synchronisation des données." });
  }
};



