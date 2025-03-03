const mongoose = require("mongoose");
const { db2france } = require("../configbasefrance"); // Importer db2
const rideRequestSchema = new mongoose.Schema({
  firebaseRiderRequestsID: {
    type: String,
  },
  driverId: {
    type: String,
  },
  driverName: {
    type: String,
  },
  driverPhone: {
    type: String,
  },
  driverPhoto: {
    type: String,
  },
  driverLocationData: {
    latitude: {
      type: String,
    },
    longitude: {
      type: String,
    },
  },
  carDetails: {
    carModel: {
      type: String,
    },
    carNumber: {
      type: String,
    },
  },
  fareAmount: {
    type: Number,
  },
  healthStatus: {
    type: String,
    default: "none",
  },
  source: {
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
  },
  sourceAddress: {
    type: String,
  },
  destination: {
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
    destinationAddress: {
      type: String,
    },
  },
  status: {
    type: String,
  },
  time: {
    type: Date,
  },
  userId: {
    type: String,

  },
  userName: {
    type: String,
  },
  userPhone: {
    type: String,
  },
}, { timestamps: true });

const RideRequest = db2france.model("RideRequest", rideRequestSchema);

module.exports = RideRequest;
