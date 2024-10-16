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

// Générer les factures pour le mois précédent
exports.generateFactures = async () => {
  const lastMonth = moment().subtract(1, 'months');
  const year = lastMonth.year();
  const month = lastMonth.month() + 1; // Moment months are 0-indexed

  try {
    const aggregationResult = await RideRequest.aggregate([
      {
        $match: {
          time: {
            $gte: moment([year, month - 1]).toDate(),
            $lt: moment([year, month]).toDate()
          }
        }
      },
      {
        $group: {
          _id: "$driverPhone",
          nbTrajet: { $sum: 1 },
          montantTTC: { $sum: "$fareAmount" }
        }
      }
    ]);

    for (const result of aggregationResult) {
      const chauffeur = await Chauffeur.findOne({ phone: result._id });
      if (!chauffeur) continue;

      const fraisDeService = result.montantTTC * 0.15; // 15% service fee
      const montantNet = result.montantTTC - fraisDeService;

      // Generate the new invoice number format
      const chauffeurId = chauffeur._id.toString().substr(0, 4);
      const nomPrenom = `${chauffeur.Nom.substr(0, 2)}${chauffeur.Prenom.substr(0, 2)}`.toUpperCase();
      const newNumber = `${chauffeurId}_${nomPrenom}_${month.toString().padStart(2, '0')}_${year}`;

      const dateEcheance = moment([year, month - 1]).add(1, 'month').date(15).toDate(); // Due on the 15th of next month

      const newFacture = new Facture({
        numero: newNumber,
        mois: month,
        annee: year,
        nbTrajet: result.nbTrajet,
        montantTTC: result.montantTTC,
        fraisDeService: fraisDeService,
        chauffeurId: chauffeur._id,
        nomChauffeur: `${chauffeur.Nom} ${chauffeur.Prenom}`,
        dateEcheance: dateEcheance,
        notes: `Montant net à payer: ${montantNet.toFixed(2)} €`
      });

      await newFacture.save();
      console.log(`Facture created for ${newFacture.nomChauffeur}: ${newFacture.numero}`);
    }

    console.log("Facture generation completed.");
  } catch (error) {
    console.error("Error generating factures:", error);
    throw new Error(`Erreur lors de la génération des factures: ${error.message}`);
  }
};
