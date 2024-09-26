const mongoose = require("mongoose");

const globalCounterSchema = new mongoose.Schema({
  year: Number,
  count: Number,
});

const GlobalCounter = mongoose.model("GlobalCounter", globalCounterSchema);

module.exports = GlobalCounter;
