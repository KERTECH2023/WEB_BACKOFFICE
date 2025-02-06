// models/Tariftransfert.js
const mongoose = require('mongoose');

const TarifSchema = new mongoose.Schema({
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

module.exports = mongoose.model('Tariftransfert', TarifSchema);
