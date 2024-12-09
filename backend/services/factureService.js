const Facture = require('../Models/Facture');
const Chauffeur = require('../Models/Chauffeur');
const moment = require('moment');
const RideRequest = require('../Models/AllRideRequest');

// Filtrer les factures par date de création ou par mois
exports.filterFacturesByDateOrMonth = async (date, mois, annee) => {
  try {
    let query = {};

    // Si une date est fournie, filtrer par cette date de création
    if (date) {
      query['dateCreation'] = {
        $gte: moment(date).startOf('day').toDate(),
        $lte: moment(date).endOf('day').toDate()
      };
    }

    // Si un mois et une année sont fournis, filtrer par mois et année
    if (mois && annee) {
      query['mois'] = mois;
      query['annee'] = annee;
    }

    // Récupérer les factures correspondant aux filtres
    const factures = await Facture.find(query);
    return factures;
  } catch (error) {
    throw new Error(`Erreur lors du filtrage des factures: ${error.message}`);
  }
};





exports.getChauffeurByFactureId = async (factureId) => {
  try {
    // Récupérer la facture avec l'ID fourni
    const facture = await Facture.findById(factureId);

    if (!facture) {
      throw new Error('Facture non trouvée.');
    }

    // Récupérer le chauffeur associé à cette facture
    const chauffeur = await Chauffeur.findById(facture.chauffeurId);

    if (!chauffeur) {
      throw new Error('Chauffeur non trouvé.');
    }

    return chauffeur;
  } catch (error) {
    throw new Error(`Erreur lors de la récupération du chauffeur: ${error.message}`);
  }
};

// Récupérer une facture par son ID
exports.getFactureById = async (factureId) => {
  try {
    const facture = await Facture.findById(factureId); // Recherche la facture par son ID
    return facture;
  } catch (error) {
    throw new Error(`Erreur lors de la récupération de la facture: ${error.message}`);
  }
};


exports.generateFacturesForAllChauffeurs = async () => {
  try {
    const mois = moment().month() + 1;
    const annee = moment().year();
    
    // Récupérer tous les chauffeurs VALIDÉS
    const chauffeurs = await Chauffeur.find({ Cstatus: 'Validé' });
    const factures = await Promise.all(chauffeurs.map(async (chauffeur) => {
      // Récupérer toutes les courses complétées pour le chauffeur ce mois
      const rideRequests = await RideRequest.find({
        driverId: chauffeur.firebaseUID, // Filtre par numéro de téléphone du chauffeur
        status: 'Ended',
        time: {
          $gte: moment([annee, mois - 1]).startOf('month').toDate(),
          $lt: moment([annee, mois - 1]).endOf('month').toDate(),
        }
      });

      const rideRequestsannuler = await RideRequest.find({
        driverId: chauffeur.firebaseUID, // Filtre par numéro de téléphone du chauffeur
        status: 'Annuler',
        time: {
          $gte: moment([annee, mois - 1]).startOf('month').toDate(),
          $lt: moment([annee, mois - 1]).endOf('month').toDate(),
        }
      });

      // Calculer le nombre de trajets et le montant total TTC
      const nbTrajet = rideRequests.length;
      const montantTTC = rideRequests.reduce((total, ride) => total + ride.fareAmount, 0);
      const fraisDeService = montantTTC * 0.15 *1.19;  // 15% de frais de service
      const montantNet = montantTTC - fraisDeService;
      const nbannulerchauffeur= rideRequestsannuler.length;

      // Vérifier si une facture existe déjà pour ce chauffeur
      let facture = await Facture.findOne({ chauffeurId: chauffeur._id, mois, annee });
      
      if (facture) {
        // Mettre à jour la facture existante
        facture.nbTrajet = nbTrajet;
        facture.montantTTC = montantTTC;
        facture.fraisDeService = fraisDeService;
        facture.notes = `Montant net à payer: ${montantNet.toFixed(2)}`;
        facture.annulation = nbannulerchauffeur;
        await facture.save(); // Enregistrer les mises à jour
      } else {
        // Générer un nouveau numéro de facture
        const chauffeurIdStr = chauffeur._id.toString().substr(0, 4);
        const nomPrenom = `${chauffeur.Nom.substr(0, 2)}${chauffeur.Prenom.substr(0, 2)}`.toUpperCase();
        const numeroFacture = `${chauffeurIdStr}_${nomPrenom}_${mois.toString().padStart(2, '0')}_${annee}`;

        // Générer la date d'échéance
        const dateEcheance = moment([annee, mois - 1]).add(1, 'month').date(15).toDate();

        // Créer une nouvelle facture
        facture = new Facture({
          numero: numeroFacture,
          mois,
          annee,
          nbTrajet,
          montantTTC,
          fraisDeService,
          firebaseUID: chauffeur.firebaseUID,
          chauffeurId: chauffeur._id,
          nomChauffeur: `${chauffeur.Nom} ${chauffeur.Prenom}`,
          dateEcheance,
          notes: `Montant net à payer: ${montantNet.toFixed(2)}`,
          annulation:nbannulerchauffeur
        });

        await facture.save(); // Sauvegarder la nouvelle facture
      }
      
      return facture;
    }));

    return factures;
  } catch (error) {
    throw new Error(`Erreur lors de la génération ou mise à jour des factures: ${error.message}`);
  }
};


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



// Récupérer toutes les factures pour un chauffeur spécifique ce mois-ci pour l'application chauffeur
exports.getFacturesForDriverThisMonthappchauffeur = async (driverId) => {
  const month = moment().month() + 1;
  const year = moment().year();
  
  return Facture.find({ firebaseUID: driverId, mois: month, annee: year });
};

// Récupérer toutes les factures pour un chauffeur spécifique ce mois-ci pour l'application chauffeur
exports.getFacturesForDriverappchauffeur = async (driverId) => {  
  return Facture.find({ firebaseUID: driverId});
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
      status: 'Ended',
      time: {
        $gte: moment([annee, mois - 1]).startOf('month').toDate(),
        $lt: moment([annee, mois - 1]).endOf('month').toDate(),
      }
    });

    // Calculer le nombre de trajets
    const nbTrajet = rideRequests.length;

    // Calculer le montant total TTC en réduisant le fareAmount
    const montantTTC = rideRequests.reduce((total, ride) => total + ride.fareAmount, 0);
    console.log("montantTTC", montantTTC);

    const totalAmount = montantTTC;  // Sum of all fares for the month
    console.log("totalAmount", totalAmount);
    
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
      firebaseUID: chauffeur.firebaseUID,
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

exports.updateFactureStatusToPaid = async (factureId) => {
  try {
    const updatedFacture = await Facture.findOneAndUpdate(
      { 
        _id: factureId, 
        status: "NON_PAYE" 
      },
      { 
        $set: { status: "PAYE" } 
      },
      { new: true } // Retourne la facture mise à jour
    );

    if (!updatedFacture) {
      throw new Error("Facture non trouvée ou déjà payée.");
    }

    return updatedFacture;
  } catch (error) {
    throw new Error(`Erreur lors de la mise à jour du statut de la facture: ${error.message}`);
  }
};
