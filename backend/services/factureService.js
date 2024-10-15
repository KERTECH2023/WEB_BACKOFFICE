// services/factureService.js
const Facture = require('../Models/Facture');
const Chauffeur = require('../Models/Chauffeur');
const RideRequest = require('../Models/AllRideRequest');
const moment = require('moment');

// Récupérer toutes les factures du mois en cours
exports.getAllFacturesForThisMonth = async () => {
  const month = moment().month() + 1;  // Mois actuel
  const year = moment().year();        // Année actuelle
  
  return Facture.find({ mois: month, annee: year });
};

// Récupérer toutes les factures pour un chauffeur spécifique ce mois-ci
exports.getFacturesForDriverThisMonth = async (driverId) => {
  const month = moment().month() + 1;
  const year = moment().year();
  
  return Facture.find({ chauffeurId: driverId, mois: month, annee: year });
};

// Générer ou récupérer une facture pour un chauffeur ce mois-ci
exports.getFactureForDriverThisMonth = async (driverId) => {
  const month = moment().month() + 1;
  const year = moment().year();
  
  // Cherche la facture dans la base de données
  return Facture.findOne({ chauffeurId: driverId, mois: month, annee: year });
};
