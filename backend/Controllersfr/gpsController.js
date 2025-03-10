const firestoreModule = require("../servicesfr/config");
const realtimeDB = firestoreModule.firestoreApp.database();
const firestore = firestoreModule.firestoreApp.firestore();

const getAllPosition = async (req, res) => {
  try {
    // Récupération des chauffeurs actifs depuis Firebase Realtime Database
    const ActiveDriversRef = realtimeDB.ref("ActiveDrivers");
    const snapshot = await ActiveDriversRef.once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({ error: "Aucun chauffeur actif trouvé" });
    }

    const ActiveDriversData = snapshot.val();
    let positions = [];

    for (const driverId in ActiveDriversData) {
      const driverData = ActiveDriversData[driverId];

      if (driverData.l && driverData.l.length === 2) {
        // Récupération des informations du chauffeur depuis Firestore
        const driverDoc = await firestore.collection("Drivers").doc(driverId).get();

        if (driverDoc.exists) {
          const driverInfo = driverDoc.data();

          positions.push({
            id: driverId,
            name: driverInfo.name || "N/A",
            phone: driverInfo.phone || "N/A",
            latitude: driverData.l[0],
            longitude: driverData.l[1],
            carDetails: {
              immatriculation: driverInfo.carDetails?.immatriculation || "N/A",
              modelle: driverInfo.carDetails?.modelle || "N/A",
            },
          });
        }
      }
    }

    return res.status(200).json(positions);
  } catch (error) {
    console.error("Erreur serveur :", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};

module.exports = {
  getAllPosition,
};
