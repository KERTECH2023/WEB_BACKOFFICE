const factureService = require('../services/factureService');
const pdfService = require('../services/pdfService');
const path = require('path');
const moment = require('moment');
// Récupérer toutes les factures pour tous les chauffeurs ce mois-ci
exports.getAllFacturesThisMonth = async (req, res) => {
  try {
    const factures = await factureService.getAllFacturesForThisMonth();
    res.json(factures);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Récupérer toutes les factures d'un chauffeur pour ce mois
exports.getFacturesForDriverThisMonth = async (req, res) => {
  try {
    const { driverId } = req.params;
    const factures = await factureService.getFacturesForDriverThisMonth(driverId);
    res.json(factures);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Récupérer un PDF de la facture ou le générer s'il n'existe pas
exports.getFacturePDF = async (req, res) => {
  try {
    const { driverId } = req.params;
    const facture = await factureService.getFactureForDriverThisMonth(driverId);
    
    if (!facture) {
      return res.status(404).send('Facture non trouvée.');
    }

    const pdfPath = await pdfService.getOrGenerateFacturePDF(facture);
    res.sendFile(path.resolve(pdfPath));  // Envoie le fichier en réponse
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Générer des factures pour un chauffeur spécifique ce mois-ci
exports.generateFacturesForChauffeur = async (req, res) => {
  try {
    const { driverId } = req.params;
    const mois = moment().month() + 1;  // Mois en cours
    const annee = moment().year();      // Année en cours
    const nbTrajet = req.body.nbTrajet; // Récupéré depuis la requête
    const montantTTC = req.body.montantTTC;

    // Appel à la fonction pour générer la facture
    const nouvelleFacture = await factureService.generateFactures(driverId, mois, annee, nbTrajet, montantTTC);

    res.json(nouvelleFacture);
  } catch (error) {
    res.status(500).send(`Erreur lors de la génération des factures: ${error.message}`);
  }
};
