const mongoose = require("mongoose");

const rideRequestSchema = new mongoose.Schema({
  // 🔑 ID Firestore pour garder la trace et synchroniser
  firestoreId: { type: String, required: true },

  destination: {
    latitude: Number,
    longitude: Number
  },
  destinationAddress: String,

  driverCarImmatriculation: String,
  driverCarModelle: String,
  driverId: String,
  driverid: String, // (⚠️ à voir si doublon avec driverId)
  driverName: String,
  driverPhone: String,
  driverToken: String,

  fareAmount: Number,
  healthStatus: String,

  source: {
    latitude: Number,
    longitude: Number
  },
  sourceAddress: String,

  status: String,

  userId: String,
  userName: String,
  userPhone: String,

  time: {
    _seconds: Number,
    _nanoseconds: Number
  },

  // 🔹 Pour marquer si c’est une ancienne version (archivée)
  archived: { type: Boolean, default: false }

}, { timestamps: true });

// Index pour éviter plusieurs docs avec le même firestoreId + archived=false
rideRequestSchema.index({ firestoreId: 1, archived: 1 });

module.exports = mongoose.model("RideRequest", rideRequestSchema);
