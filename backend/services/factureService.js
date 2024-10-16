const Facture = require('../Models/Facture');
const Chauffeur = require('../Models/Chauffeur');
const moment = require('moment');
const RideRequest = require('../Models/AllRideRequest');
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

// Fonction pour vérifier l'existence d'une facture et la générer
exports.generateFactures = async (chauffeurId, mois, annee) => {
  try {
    // Vérifier si la facture existe déjà pour ce chauffeur et ce mois
    const factureExistante = await Facture.findOne({ chauffeurId, mois, annee });
    if (factureExistante) {
      throw new Error(`Facture déjà générée pour ce chauffeur (${chauffeurId}) au mois ${mois} de l'année ${annee}.`);
    }

     // Récupérer toutes les courses complétées pour le chauffeur ce mois
    const rideRequests = await RideRequest.find({
      chauffeurId,
      status: 'completed',
      time: {
        $gte: moment([annee, mois - 1]).startOf('month').toDate(),
        $lt: moment([annee, mois - 1]).endOf('month').toDate(),
      }
    });

    // Calculer le nombre de trajets
    const nbTrajet = rideRequests.length;

    // Calculer le montant total TTC en réduisant le fareAmount
    const montantTTC = rideRequests.reduce((total, ride) => total + ride.fareAmount, 0);
    console.log("montantTTC",montantTTC);

    const totalAmount = montantTTC.length > 0 ? montantTTC[0].totalFare : 0;  // Sum of all fares for the month
 console.log("totalAmoun",totalAmount);
    
    // Générer un nouveau numéro de facture
    const chauffeur = await Chauffeur.findById(chauffeurId);
    const fraisDeService = totalAmount * 0.15;  // 15% de frais de service
    const montantNet = totalAmount - fraisDeService;
    const chauffeurIdStr = chauffeur._id.toString().substr(0, 4);
    const nomPrenom = `${chauffeur.Nom.substr(0, 2)}${chauffeur.Prenom.substr(0, 2)}`.toUpperCase();
    const numeroFacture = `${chauffeurIdStr}_${nomPrenom}_${mois.toString().padStart(2, '0')}_${annee}`;

    // Générer la date d'échéance
    const dateEcheance = moment([annee, mois - 1]).add(1, 'month').date(15).toDate(); // 15e jour du mois suivant

    // Créer une nouvelle facture
    const nouvelleFacture = new Facture({
      numero: numeroFacture,
      mois: mois,
      annee: annee,
      nbTrajet: nbTrajet,
      montantTTC: totalAmount,
      fraisDeService: fraisDeService,
      chauffeurId: chauffeur._id,
      nomChauffeur: `${chauffeur.Nom} ${chauffeur.Prenom}`,
      dateEcheance: dateEcheance,
      notes: `Montant net à payer: ${montantNet.toFixed(2)} €`
    });

    // Sauvegarder la facture
    await nouvelleFacture.save();
    console.log(`Facture créée pour ${nouvelleFacture.nomChauffeur}: ${nouvelleFacture.numero}`);

    return nouvelleFacture;
  } catch (error) {
    throw new Error(`Erreur lors de la génération de la facture: ${error.message}`);
  }
};
