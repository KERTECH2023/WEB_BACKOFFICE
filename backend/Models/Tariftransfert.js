// models/Tariftransfert.js
const mongoose = require('mongoose');

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

module.exports = mongoose.model('Tariftransfert', TariftSchema);
