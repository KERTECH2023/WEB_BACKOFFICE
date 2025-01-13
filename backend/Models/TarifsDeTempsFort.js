const mongoose = require('mongoose');

const TarifsDeTempsFortSchema = new mongoose.Schema({
  startHour: {
    type: String,
    required: true, // Obligatoire pour garantir une heure de début valide
  },
  endHour: {
    type: String,
    required: true, // Obligatoire pour garantir une heure de fin valide
  },
  baseFare: {
    type: Number,
    required: true, // Le tarif de base est obligatoire
  },
  farePerKm: {
    type: Number,
    required: true, // Le tarif par kilomètre est obligatoire
  },
  farePerMinute: {
    type: Number,
    required: true, // Le tarif par minute est obligatoire
  },
  isActive: {
    type: Boolean,
    default: true, // Indique si ce tarif est actif ou non
  },
  createdAt: {
    type: Date,
    default: Date.now, // Date de création par défaut à maintenant
  },
  updatedAt: {
    type: Date,
    default: Date.now, // Date de mise à jour par défaut à maintenant
  },
});



// Transformation JSON pour masquer les champs internes
TarifsDeTempsFortSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id; // Masque le champ `_id` lors de la conversion en JSON
  },
});

// Export du modèle
module.exports = mongoose.model('TarifsDeTempsFort', TarifsDeTempsFortSchema);
