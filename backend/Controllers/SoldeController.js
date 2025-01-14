const firestoreModule = require("../services/config");
const realtimeDB = firestoreModule.firestoreApp.database();



const getSoldeById = async (req, res) => {
  try {
    const driverId = req.params.driverId; // ID of the driver from the request parameters
    
    if (!driverId) {
      return res.status(400).json({ error: "ID du chauffeur requis" });
    }

    // Fetching driver data from Firebase Realtime Database
    const driverRef = realtimeDB.ref(`Drivers/${driverId}`);
    const snapshot = await driverRef.once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({ error: "Chauffeur non trouvé" });
    }

    const driverData = snapshot.val();

    // Extract and return the solde
    if (driverData.solde === undefined) {
      return res.status(404).json({ error: "Solde non trouvé pour ce chauffeur" });
    }

    return res.status(200).json({
      driverId: driverId,
      solde: driverData.solde,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du solde :", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};

module.exports = {
  getSoldeById,
};

