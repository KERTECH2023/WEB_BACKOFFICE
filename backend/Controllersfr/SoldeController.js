const firestoreModule = require("../servicesfr/config");
const realtimeDB = firestoreModule.firestoreApp.database();
const firestoreDB = firestoreModule.db;


const updateSolde = async (req, res) => {
  try {
    const driverId = req.params.driverId; // ID du chauffeur à mettre à jour
    const { solde } = req.body; // Nouveau solde depuis le corps de la requête

    if (!driverId) {
      return res.status(400).json({ error: "ID du chauffeur requis" });
    }

    if (solde === undefined || isNaN(solde)) {
      return res.status(400).json({ error: "Solde valide requis" });
    }

    // Référence au chauffeur dans la base de données
    const driverRef = realtimeDB.ref(`Drivers/${driverId}`);
    const snapshot = await driverRef.once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({ error: "Chauffeur non trouvé" });
    }

    // Mettre à jour le solde
    await driverRef.update({ solde: parseFloat(solde) });

    return res.status(200).json({
      message: "Solde mis à jour avec succès",
      driverId: driverId,
      solde: parseFloat(solde),
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du solde :", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};







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


const getDriverFinancialInfo = async (req, res) => {
  try {
    const driverId = req.params.driverId;

    if (!driverId) {
      return res.status(400).json({ error: "ID du chauffeur requis" });
    }

    // Récupération des données du chauffeur depuis Firebase Realtime Database
    const driverRef = realtimeDB.ref(`Drivers/${driverId}`);
    const snapshot = await driverRef.once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({ error: "Chauffeur non trouvé" });
    }

    const driverData = snapshot.val();
    const solde = driverData.solde || 0;
    const soldeCarte = driverData.soldecarte || 0;

    // Extraction de l'historique des trajets (tripHistory)
    const tripHistoryKeys = Object.keys(driverData.tripHistory || {});
    
    // Récupération des détails des trajets depuis Firestore
    const tripDetailsPromises = tripHistoryKeys.map(async (tripId) => {
      const tripDoc = await firestoreDB.collection("AllRideRequests").doc(tripId).get();
      
      if (!tripDoc.exists) {
        return { tripId, status: driverData.tripHistory[tripId], details: null };
      }

      const tripData = tripDoc.data();
      return {
        tripId,
        status: driverData.tripHistory[tripId],
        details: {
          destination: tripData.destination || {},
          destinationAddress: tripData.destinationAddress || "N/A",
          driverCarImmatriculation: tripData.driverCarImmatriculation || "N/A",
          driverCarModelle: tripData.driverCarModelle || "N/A",
          driverLocationData: tripData.driverLocationData || {},
          driverName: tripData.driverName || "N/A",
          driverPhone: tripData.driverPhone || "N/A",
          driverPhoto: tripData.driverPhoto || "N/A",
          driverToken: tripData.driverToken || "N/A",
          fareAmount: tripData.fareAmount || 0,
          healthStatus: tripData.healthStatus || "N/A",
          source: tripData.source || {},
          sourceAddress: tripData.sourceAddress || "N/A",
          status: tripData.status || "N/A",
          time: tripData.time || "N/A",
          userId: tripData.userId || "N/A",
          userName: tripData.userName || "N/A",
          userPhone: tripData.userPhone || "N/A",
        }
      };
    });

    const tripHistory = await Promise.all(tripDetailsPromises);

    return res.status(200).json({
      driverId: driverId,
      solde: solde,
      soldeCarte: soldeCarte,
      tripHistory: tripHistory,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des informations :", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};


const getTotalSolde = async (req, res) => {
  try {
    // Référence à la collection des chauffeurs
    const driversRef = realtimeDB.ref("Drivers");
    const snapshot = await driversRef.once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({ error: "Aucun chauffeur trouvé" });
    }

    const driversData = snapshot.val();
    let totalSoldeCents = 0;

    // Calcul précis du solde total en centimes
    for (const driverId in driversData) {
      const driver = driversData[driverId];
      if (driver.solde !== undefined && !isNaN(driver.solde)) {
        // Convertir en centimes pour éviter les erreurs de flottants
        totalSoldeCents += Math.round(driver.solde * 100);
      }
    }

    // Retourner le solde total en euros (ou autres unités)
    const totalSolde = totalSoldeCents / 100;

    return res.status(200).json({
      totalSolde: totalSolde.toFixed(2), // Formatage du résultat à deux décimales
    });
  } catch (error) {
    console.error("Erreur lors du calcul du solde total :", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};

module.exports = {
  getSoldeById,
  getTotalSolde,updateSolde,getDriverFinancialInfo,
};
