const firestoreModule = require("../services/config");
const realtimeDB = firestoreModule.firestoreApp.database();

exports.createRideRequest = async (req, res) => {
  try {
    const {
      source,
      destination,
      destinationAddress,
      fareAmount,
      sourceAddress,
      time,
      driverid,
      driverToken,
      userName,
      userPhone,
      userId,
      driverCarImmatriculation,
      driverCarModelle,
    } = req.body;

    // Créer une nouvelle référence avec une clé unique
    const rideRequestRef = realtimeDB.ref("AllRideRequests").push();
   

    const rideData = {
      source: {
        latitude: source.latitude,
        longitude: source.longitude
      },
      destination: {
        latitude: destination.latitude,
        longitude: destination.longitude
      },
      healthStatus: "none",
      status: "pending",
      destinationAddress,
      fareAmount,
      sourceAddress,
      time,
      driverId: "waiting",
      driverid,
      driverToken,
      userName,
      userPhone,
      userId,
      driverCarImmatriculation,
      driverCarModelle
    };

    // Sauvegarder les données
    await rideRequestRef.set(rideData);
   

     const updatechauffRef = realtimeDB.ref("Drivers/" + driverid);
          await updatechauffRef.update({
            'lastcourse': rideRequestRef.key
          });

    if (rideRequestRef.key) {
     

      res.status(201).json({
        success: true,
        rideId: rideRequestRef.key
      });
    } else {
      throw new Error('Failed to generate ride request key');
    }

  } catch (error) {
    console.error('Error creating ride request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create ride request'
    });
  }
};
