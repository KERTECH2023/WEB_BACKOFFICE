const mongoose = require("mongoose");

const rideRequestSchema = new mongoose.Schema({
  firebaseRiderRequestsID: {
    type: String,
    required: true,
  },
  driverId: {
    type: String,
    required: true,
  },
  driverName: {
    type: String,
    required: true,
  },
  driverPhone: {
    type: String,
    required: true,
  },
  driverPhoto: {
    type: String,
    required: true,
  },
  driverLocationData: {
    latitude: {
      type: String,
      required: true,
    },
    longitude: {
      type: String,
      required: true,
    },
  },
  carDetails: {
    carModel: {
      type: String,
      required: true,
    },
    carNumber: {
      type: String,
      required: true,
    },
  },
  fareAmount: {
    type: Number,
    required: true,
  },
  healthStatus: {
    type: String,
    required: true,
    default: "none",
  },
  source: {
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
  },
  sourceAddress: {
    type: String,
    required: true,
  },
  destination: {
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    destinationAddress: {
      type: String,
      required: true,
    },
  },
  status: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  userPhone: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const RideRequest = mongoose.model("RideRequest", rideRequestSchema);

module.exports = RideRequest;
