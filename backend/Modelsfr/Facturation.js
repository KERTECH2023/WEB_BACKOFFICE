const mongoose = require('mongoose');
const { db2france } = require("../configbasefrance"); // Importer db2

const FacturationSchema = new mongoose.Schema({
  tripId: { type: String, required: true, unique: true },
  driverId: { type: String, required: true },
  destination: { type: Object, default: {} },
  destinationAddress: { type: String, default: "N/A" },
  driverCarImmatriculation: { type: String, default: "N/A" },
  driverCarModelle: { type: String, default: "N/A" },
  driverLocationData: { type: Object, default: {} },
  driverName: { type: String, default: "N/A" },
  driverPhone: { type: String, default: "N/A" },
  fareAmount: { type: Number, default: 0 },
  healthStatus: { type: String, default: "N/A" },
  source: { type: Object, default: {} },
  sourceAddress: { type: String, default: "N/A" },
  status: { type: String, default: "N/A" },
  time: { type: String, default: "N/A" },
  userId: { type: String, default: "N/A" },
  userName: { type: String, default: "N/A" },
  userPhone: { type: String, default: "N/A" },
  sipayer: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = db2france.model("Facturation", FacturationSchema);
