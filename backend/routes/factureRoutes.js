// routes/factureRoutes.js
const express = require('express');
const router = express.Router();
const factureController = require('../Controllers/FactureController');

// Récupérer toutes les factures pour tous les chauffeurs ce mois-ci
router.get('/mois', factureController.getAllFacturesThisMonth);

router.get('/:factureId/chauffeur', factureController.getChauffeurByFactureId);

router.get('/factures/filter', factureController.filterFacturesByDateOrMonth);

// Route pour générer des factures pour tous les chauffeurs
router.get('/generate/all', factureController.generateFacturesForAllChauffeurs);
router.get('/:factureId', factureController.getFactureById);
router.get('/:driverId/generate/all', factureController.generateFacturesForChauffeur);  

// Récupérer toutes les factures pour un chauffeur spécifique ce mois-ci
router.get('/chauffeur/:driverId/mois', factureController.getFacturesForDriverThisMonth);

// Récupérer toutes les factures pour un chauffeur 
router.get('/chauffeur/:driverId', factureController.getFacturesForDriver);

// Récupérer toutes les factures pour un chauffeur spécifique ce mois-ci application
router.get('/chauffeurapp/:driverId/mois', factureController.getFacturesForDriverThisMonthappchauffeur);

// Récupérer toutes les factures pour un chauffeur application
router.get('/chauffeurapp/:driverId', factureController.getFacturesForDriverappchauffeur);

// Récupérer ou générer le PDF de la facture pour un chauffeur
router.get('/chauffeur/:driverId/pdf', factureController.getFacturePDF);

// Nouvelle route pour mettre à jour le statut de la facture à "PAYE"
router.patch('/:driverId/payer', factureController.updateFactureToPaid);

module.exports = router;
