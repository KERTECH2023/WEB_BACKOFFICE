const mongoose = require("mongoose");

const rideRequestSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Firestore ID utilisé comme ID MongoDB
  destination: {
    latitude: Number,
    longitude: Number
  },
  destinationAddress: String,
  driverCarImmatriculation: String,
  driverCarModelle: String,
  driverId: String,
  driverid: String,
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
  }
}, { timestamps: true });

module.exports = mongoose.model("RideRequest", rideRequestSchema);
