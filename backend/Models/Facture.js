const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const FactureSchema = new Schema(
  {
    numero: {
      type: String,
      required: true,
      unique: true,
      // Format: YYYY_XXX (e.g., 2024_001)
    },
    mois: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    annee: {
      type: Number,
      required: true,
    },
    nbTrajet: {
      type: Number,
      required: true,
      min: 0,
    },
    montantTTC: {
      type: Number,
      required: true,
      min: 0,
    },
    fraisDeService: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      required: true,
      enum: ["PAYE", "NON_PAYE", "RETARD"],
      default: "NON_PAYE",
    },
    datePaiement: {
      type: Date,
    },
    envoye: {
      type: Boolean,
      default: false,
    },
    firebaseUID: {
      type: String,
      ref: "Chauffeur",
    },
    chauffeurId: {
      type: Schema.Types.ObjectId,
      ref: "Chauffeur",
      required: true,
    },
    nomChauffeur: {
      type: String,
      ref: "Chauffeur",
      required: true,
    },
    dateCreation: {
      type: Date,
      default: Date.now,
    },
    dateEcheance: {
      type: Date,
      required: true,
    },
    notes: {
      type: String,
    },
    annulation: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);


// Index for efficient querying
FactureSchema.index({ nomChauffeur: 1, annee: 1, mois: 1 });

const Facture = mongoose.model("Facture", FactureSchema);

module.exports = Facture;
