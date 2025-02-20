const firestoreModule = require("../services/config");
const realtimeDB = firestoreModule.firestoreApp.database();

const stripe = require("stripe")("sk_test_51QuAbpQFlhR6CoMtocz2YCH80ULE8hY5412hALJsZxXDDfJ6QovCfivUPH1W9EagiflIa7EHzgDzCn0QVJaJ7K8Z00I37p2IO8"); // Remplace "sk_test_xxx" par ta vraie clé
exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      payment_method_types: ["card"],
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
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
