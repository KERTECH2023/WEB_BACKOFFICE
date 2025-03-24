const firestoreModule = require("../servicesfr/config");
const realtimeDB = firestoreModule.firestoreApp.database();
const firestoreDB = firestoreModule.db;
const Facturation = require("../Modelsfr/Facturation");

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



const updateSoldecarte = async (req, res) => {
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
      soldecarte: parseFloat(solde),
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
    const tripHistoryKeys = Object.keys(driverData.tripHistory || {});

    if (tripHistoryKeys.length === 0) {
      return res.json({ message: "Aucune course trouvée", solde, soldeCarte, trips: [] });
    }

    // Récupération des courses existantes dans MongoDB
    const existingTrips = await Facturation.find({ tripId: { $in: tripHistoryKeys } });
    const existingTripIds = new Set(existingTrips.map(trip => trip.tripId));

    // Récupération et enregistrement des nouvelles courses
    const newTrips = await Promise.all(
      tripHistoryKeys.map(async (tripId) => {
        if (existingTripIds.has(tripId)) {
          return null; // Ignore si déjà existant
        }

        const tripDoc = await firestoreDB.collection("AllRideRequests").doc(tripId).get();
        if (!tripDoc.exists) {
          return null;
        }

        const tripData = tripDoc.data();
        const newTrip = new Facturation({
          tripId,
          driverId,
          destination: tripData.destination || {},
          destinationAddress: tripData.destinationAddress || "N/A",
          driverCarImmatriculation: tripData.driverCarImmatriculation || "N/A",
          driverCarModelle: tripData.driverCarModelle || "N/A",
          driverLocationData: tripData.driverLocationData || {},
          driverName: tripData.driverName || "N/A",
          driverPhone: tripData.driverPhone || "N/A",
          fareAmount: tripData.fareAmount || 0,
          healthStatus: tripData.healthStatus || "N/A",
          source: tripData.source || {},
          sourceAddress: tripData.sourceAddress || "N/A",
          status: tripData.status || "N/A",
          time: tripData.time || "N/A",
          userId: tripData.userId || "N/A",
          userName: tripData.userName || "N/A",
          userPhone: tripData.userPhone || "N/A",
          sipayer: false
        });

        await newTrip.save();
        return newTrip;
      })
    );

    // Fusionner les anciens et nouveaux trips et retirer les null
    const allTrips = [...existingTrips, ...newTrips.filter(trip => trip !== null)];

    res.json({
      solde,
      soldeCarte,
      trips: allTrips
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des informations :", error);
    res.status(500).json({ error: "Erreur serveur" });
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


const updateTripsAsPaid = async (req, res) => {
  try {
    const { tripIds } = req.body;

    if (!Array.isArray(tripIds) || tripIds.length === 0) {
      return res.status(400).json({ error: "Liste des IDs de course invalide ou vide" });
    }

    // Mettre à jour `sipayer` à true pour les trips donnés
    const updatedTrips = await Facturation.updateMany(
      { tripId: { $in: tripIds } }, 
      { $set: { sipayer: true } },
      { new: true }
    );

    // Récupérer les trips mis à jour
    const trips = await Facturation.find({ tripId: { $in: tripIds } });

    res.status(200).json({
      message: "Courses mises à jour avec succès",
      updatedCount: updatedTrips.modifiedCount,
      trips
    });

  } catch (error) {
    console.error("Erreur lors de la mise à jour des courses :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};




module.exports = {
  getSoldeById,
  getTotalSolde,updateSolde,getDriverFinancialInfo,updateTripsAsPaid,updateSoldecarte
};
