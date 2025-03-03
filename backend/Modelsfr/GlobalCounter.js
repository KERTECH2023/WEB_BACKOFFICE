const mongoose = require("mongoose");
const { db2france } = require("../configbasefrance"); // Importer db2

const globalCounterSchema = new mongoose.Schema({
  year: Number,
  count: Number,
});

const GlobalCounter = db2france.model("GlobalCounter", globalCounterSchema);

module.exports = GlobalCounter;
