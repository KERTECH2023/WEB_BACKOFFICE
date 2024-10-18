// routes/factureRoutes.js
const express = require('express');
const router = express.Router();
const factureController = require('../Controllers/FactureController');

// Récupérer toutes les factures pour tous les chauffeurs ce mois-ci
router.get('/mois', factureController.getAllFacturesThisMonth);

router.get('/:driverId/generate/all', factureController.generateFacturesForChauffeur);  

// Récupérer toutes les factures pour un chauffeur spécifique ce mois-ci
router.get('/chauffeur/:driverId/mois', factureController.getFacturesForDriverThisMonth);

// Récupérer ou générer le PDF de la facture pour un chauffeur
router.get('/chauffeur/:driverId/pdf', factureController.getFacturePDF);

// Nouvelle route pour mettre à jour le statut de la facture à "PAYE"
router.patch('/:driverId/payer', factureController.updateFactureToPaid);

module.exports = router;
