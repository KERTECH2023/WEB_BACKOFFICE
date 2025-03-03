// models/Tariftransfert.js
const mongoose = require('mongoose');
const { db2france } = require("../configbasefrance"); // Importer db2
const TariftSchema = new mongoose.Schema({
  prixdepersonne: { 
    type: Number, 
    required: true 
  },
  prixdebase: { 
    type: Number, 
    required: true 
  }
}, {
  timestamps: true
});

module.exports = db2france.model('Tariftransfert', TariftSchema);
