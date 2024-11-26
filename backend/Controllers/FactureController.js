const factureService = require('../services/factureService');
const pdfService = require('../services/pdfService');
const path = require('path');
const moment = require('moment');

// Filtrer les factures par date ou par mois
exports.filterFacturesByDateOrMonth = async (req, res) => {
  try {
    const { date, mois, annee } = req.query; // Les paramètres de filtre passent dans la requête
    const factures = await factureService.filterFacturesByDateOrMonth(date, mois, annee);

  

    res.json(factures);
  } catch (error) {
    res.status(500).send(`Erreur lors du filtrage des factures: ${error.message}`);
  }
};





exports.getChauffeurByFactureId = async (req, res) => {
  try {
    const { factureId } = req.params;
    const chauffeur = await factureService.getChauffeurByFactureId(factureId);

    if (!chauffeur) {
      return res.status(404).send('Chauffeur non trouvé.');
    }

    res.json(chauffeur);
  } catch (error) {
    res.status(500).send(`Erreur lors de la récupération du chauffeur: ${error.message}`);
  }
};



exports.getFactureById = async (req, res) => {
  try {
    const { factureId } = req.params; // Récupère l'ID de la facture à partir des paramètres de la requête
    const facture = await factureService.getFactureById(factureId);

    if (!facture) {
      return res.status(404).send('Facture non trouvée.');
    }

    res.json(facture);
  } catch (error) {
    res.status(500).send(`Erreur lors de la récupération de la facture: ${error.message}`);
  }
};




exports.generateFacturesForAllChauffeurs = async (req, res) => {
  try {
    const factures = await factureService.generateFacturesForAllChauffeurs();
    res.json(factures);
  } catch (error) {
    res.status(500).send(`Erreur lors de la génération des factures: ${error.message}`);
  }
};


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

// Récupérer toutes les factures d'un chauffeur pour ce mois
exports.getFacturesForDriver = async (req, res) => {
  try {
    const { driverId } = req.params;
    const factures = await factureService.getFacturesForDriver(driverId);
    res.json(factures);
  } catch (error) {
    res.status(500).send(error.message);
  }
};



// Récupérer toutes les factures d'un chauffeur pour ce mois application chauffeur
exports.getFacturesForDriverThisMonthappchauffeur = async (req, res) => {
  try {
    const { driverId } = req.params;
    const factures = await factureService.getFacturesForDriverThisMonthappchauffeur(driverId);
    res.json(factures);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Récupérer toutes les factures d'un chauffeur application chauffeur
exports.getFacturesForDriverappchauffeur = async (req, res) => {
  try {
    const { driverId } = req.params;
    const factures = await factureService.getFacturesForDriverappchauffeur(driverId);
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
    const mois = moment().month();  // Mois en cours
    const annee = moment().year();  // Année en cours

    // Appel à la fonction pour générer la facture sans passer nbTrajet et montantTTC
    const nouvelleFacture = await factureService.generateFactures(driverId, mois, annee);

    res.json(nouvelleFacture);
  } catch (error) {
    res.status(500).send(`Erreur lors de la génération des factures: ${error.message}`);
  }
};

// Nouvelle méthode pour mettre à jour le statut de la facture à "PAYE"
exports.updateFactureToPaid = async (req, res) => {
  try {
    const { driverId } = req.params;
    const updatedFacture = await factureService.updateFactureStatusToPaid(driverId);
    res.json(updatedFacture);
  } catch (error) {
    res.status(500).send(error.message);
  }
};
