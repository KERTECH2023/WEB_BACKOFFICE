const firestoreModule = require("../services/config");
const realtimeDB = firestoreModule.firestoreApp.database();

const getAllPosition = async (req, res) => {
  try {
    const ActiveDriversRef = realtimeDB.ref("ActiveDrivers");
    const snapshot = await ActiveDriversRef.once("value");

    let positions = [];

    // Si aucun chauffeur actif, on retourne un tableau vide avec status 200
    if (!snapshot.exists()) {
      return res.status(200).json(positions); // ✅ positions est []
    }

    const ActiveDriversData = snapshot.val();

    for (const driverId in ActiveDriversData) {
      const driverData = ActiveDriversData[driverId];

      if (driverData.l && driverData.l.length === 2) {
        const driverRef = realtimeDB.ref("Drivers/" + driverId);
        const driverSnapshot = await driverRef.once("value");

        if (driverSnapshot.exists()) {
          const driverInfo = driverSnapshot.val();
          if (driverInfo.Status === "Free") {
            positions.push({
              id: driverId,
              name: driverInfo.name || "N/A",
              phone: driverInfo.phone || "N/A",
              latitude: driverData.l[0],
              longitude: driverData.l[1]
            });
          }
        }
      }
    }

    // ✅ Toujours retourner un tableau (vide ou non)
    return res.status(200).json(positions);
  } catch (error) {
    console.error("Erreur serveur :", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};

module.exports = {
  getAllPosition,
};
