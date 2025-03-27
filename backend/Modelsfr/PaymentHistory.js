const mongoose = require("mongoose");
const { db2france } = require("../configbasefrance"); // Importer db2

const PaymentHistorySchema = new mongoose.Schema({
    idFirebaseChauffeur: { type: String }, // Identifiant du chauffeur Firebase
    prixAPayer: { type: Number },
    mois: { type: String },
    semaine: { type: String },
    dateAjout: { type: Date, default: Date.now } // Date d'enregistrement du paiement
});

module.exports = db2france.model("PaymentHistory", PaymentHistorySchema);
