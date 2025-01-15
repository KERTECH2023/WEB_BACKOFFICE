const Chauffeur = require("../Models/Chauffeur");
const Tarifs = require("../Models/Tarifs");
const Tarifsn = require("../Models/TarifsDeNuit");
const Tarifj = require("../Models/TarifsDeJour");
const Tariftempfort = require("../Models/TarifsDeTempsFort");
const cron = require('node-cron');
const moment = require('moment-timezone');
const firestoreModule = require("../services/config");
const realtimeDB = firestoreModule.firestoreApp.database();

// Supprime les données de la table ActiveDrivers toutes les 30 minutes
const clearActiveDrivers = () => {
  const activeDriversRef = realtimeDB.ref("ActiveDrivers");

  setInterval(async () => {
    try {
      await activeDriversRef.remove();
      console.log("Les données de la table ActiveDrivers ont été supprimées.");
    } catch (error) {
      console.error("Erreur lors de la suppression des données ActiveDrivers :", error.message);
    }
  }, 3 * 60 * 60 * 1000);
};

clearActiveDrivers();

const updateAllChauffeursWithTarif = async (tariffId) => {
  try {
    await Chauffeur.updateMany({}, { $set: { tarif: tariffId } });
    console.log("Tous les chauffeurs ont été mis à jour avec le tarif ID:", tariffId);
  } catch (error) {
    console.error("Erreur lors de la mise à jour des chauffeurs :", error.message);
  }
};

async function updateTariff(type) {
  try {
    const tariff = await Tarifs.findOne({});

    if (!tariff) {
      console.error('Aucun tarif trouvé');
      return;
    }

    let config;
    if (type === 'nocturne') {
      config = await Tarifsn.findOne({});
    } else if (type === 'journalier') {
      config = await Tarifj.findOne({});
    } else if (type === 'tempfort') {
      config = await Tariftempfort.findOne({});
    } else {
      console.error('Type de tarif invalide');
      return;
    }

    if (!config) {
      console.error(`Aucune configuration trouvée pour le type ${type}`);
      return;
    }

    // Conversion sécurisée avec valeurs par défaut
    const baseFare = config.baseFare !== undefined ? Number(config.baseFare) : 0;
    const farePerKm = config.farePerKm !== undefined ? Number(config.farePerKm) : 0;
    const farePerMinute = config.farePerMinute !== undefined ? Number(config.farePerMinute) : 0;
    const fraisDeService = config.fraisDeService !== undefined ? Number(config.fraisDeService) : 0;

    // Vérification des valeurs
    if (isNaN(baseFare) || isNaN(farePerKm) || isNaN(farePerMinute) || isNaN(fraisDeService)) {
      console.error(`Valeurs de tarif invalides pour ${type}`);
      return;
    }

    // Mise à jour des tarifs
    tariff.baseFare = baseFare;
    tariff.farePerKm = farePerKm;
    tariff.farePerMinute = farePerMinute;
    tariff.fraisDeService = fraisDeService;

    // Mise à jour Firebase
    const firebaseRef = realtimeDB.ref("tarifs");
    await firebaseRef.update({
      baseFare,
      farePerKm,
      farePerMinute,
      fraisDeService
    });

    await tariff.save();
    console.log(`Tarifs ${type} mis à jour automatiquement`);

  } catch (error) {
    console.error(`Erreur lors de la mise à jour des tarifs ${type} :`, error.message);
  }
}

// [Cron schedules remain unchanged]
cron.schedule('00 21 * * *', () => {
  updateTariff('nocturne');
}, {
  scheduled: true,
  timezone: "Africa/Tunis"
});

cron.schedule('00 05 * * *', () => {
  updateTariff('journalier');
}, {
  scheduled: true,
  timezone: "Africa/Tunis"
});

cron.schedule('30 07 * * *', () => {
  updateTariff('tempfort');
}, {
  scheduled: true,
  timezone: "Africa/Tunis"
});

cron.schedule('00 09 * * *', () => {
  updateTariff('journalier');
}, {
  scheduled: true,
  timezone: "Africa/Tunis"
});

cron.schedule('00 12 * * *', () => {
  updateTariff('tempfort');
}, {
  scheduled: true,
  timezone: "Africa/Tunis"
});

cron.schedule('00 13 * * *', () => {
  updateTariff('journalier');
}, {
  scheduled: true,
  timezone: "Africa/Tunis"
});

cron.schedule('00 17 * * *', () => {
  updateTariff('tempfort');
}, {
  scheduled: true,
  timezone: "Africa/Tunis"
});

cron.schedule('00 18 * * *', () => {
  updateTariff('journalier');
}, {
  scheduled: true,
  timezone: "Africa/Tunis"
});

exports.showtarifs = async (req, res) => {
  try {
    const data = await Tarifs.find();
    res.json(data);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

exports.addTarifAndUpdateChauffeurs = async (req, res) => {
  const { baseFare, farePerKm, farePerMinute, fraisDeService } = req.body;

  try {
    // Validation des données
    if (
      baseFare === undefined ||
      farePerKm === undefined ||
      farePerMinute === undefined ||
      fraisDeService === undefined
    ) {
      return res.status(400).send({
        message: "Veuillez fournir baseFare, farePerKm, farePerMinute et fraisDeService.",
      });
    }

    // Conversion explicite en nombres
    const baseFareNum = Number(baseFare);
    const farePerKmNum = Number(farePerKm);
    const farePerMinuteNum = Number(farePerMinute);
    const fraisDeServiceNum = Number(fraisDeService);

    // Vérification des valeurs après conversion
    if (
      isNaN(baseFareNum) ||
      isNaN(farePerKmNum) ||
      isNaN(farePerMinuteNum) ||
      isNaN(fraisDeServiceNum)
    ) {
      return res.status(400).send({
        message: "Les valeurs baseFare, farePerKm, farePerMinute et fraisDeService doivent être des nombres valides.",
      });
    }

    // Rechercher un tarif existant dans MongoDB
    let existingTarif = await Tarifs.findOne();

    if (existingTarif) {
      // Mise à jour du tarif existant
      existingTarif.baseFare = baseFareNum;
      existingTarif.farePerKm = farePerKmNum;
      existingTarif.farePerMinute = farePerMinuteNum;
      existingTarif.fraisDeService = fraisDeServiceNum;

      const updatedTarif = await existingTarif.save();

      // Mise à jour dans Firebase
      const firebaseRef = realtimeDB.ref("tarifs");
      await firebaseRef.update({
        baseFare: baseFareNum,
        farePerKm: farePerKmNum,
        farePerMinute: farePerMinuteNum,
        fraisDeService: fraisDeServiceNum
      });

      // Mise à jour des chauffeurs avec le tarif mis à jour
      await updateAllChauffeursWithTarif(updatedTarif._id);

      return res.status(200).send({
        message: "Tarif existant mis à jour et chauffeurs mis à jour !",
        tarif: updatedTarif,
      });
    }

    // Création d'un nouveau tarif
    const newTarif = new Tarifs({
      baseFare: baseFareNum,
      farePerKm: farePerKmNum,
      farePerMinute: farePerMinuteNum,
      fraisDeService: fraisDeServiceNum
    });
    const savedTarif = await newTarif.save();

    // Ajout dans Firebase
    const firebaseRef = realtimeDB.ref("tarifs");
    await firebaseRef.set({
      baseFare: baseFareNum,
      farePerKm: farePerKmNum,
      farePerMinute: farePerMinuteNum,
      fraisDeService: fraisDeServiceNum
    });

    // Mise à jour des chauffeurs avec le nouveau tarif
    await updateAllChauffeursWithTarif(savedTarif._id);

    return res.status(201).send({
      message: "Nouveau tarif ajouté et chauffeurs mis à jour !",
      tarif: savedTarif,
    });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

exports.updateTarifAndMajoration = async (req, res) => {
  const { tarifId, baseFare, farePerKm, farePerMinute, fraisDeService } = req.body;

  try {
    // Vérifier si les données nécessaires sont fournies
    if (
      !tarifId ||
      baseFare === undefined ||
      farePerKm === undefined ||
      farePerMinute === undefined ||
      fraisDeService === undefined
    ) {
      return res.status(400).send({
        message: "Veuillez fournir tarifId, baseFare, farePerKm, farePerMinute et fraisDeService.",
      });
    }

    // Conversion directe des valeurs en type number
    const baseFareNum = Number(baseFare);
    const farePerKmNum = Number(farePerKm);
    const farePerMinuteNum = Number(farePerMinute);
    const fraisDeServiceNum = Number(fraisDeService);

    // Vérifier que les valeurs converties sont valides
    if (
      isNaN(baseFareNum) ||
      isNaN(farePerKmNum) ||
      isNaN(farePerMinuteNum) ||
      isNaN(fraisDeServiceNum)
    ) {
      return res.status(400).send({
        message: "Les valeurs baseFare, farePerKm, farePerMinute et fraisDeService doivent être des nombres valides.",
      });
    }

    // Mise à jour dans MongoDB
    const existingTarif = await Tarifs.findById(tarifId);
    if (!existingTarif) {
      return res.status(404).send({ message: "Tarif non trouvé dans MongoDB." });
    }

    existingTarif.baseFare = baseFareNum;
    existingTarif.farePerKm = farePerKmNum;
    existingTarif.farePerMinute = farePerMinuteNum;
    existingTarif.fraisDeService = fraisDeServiceNum;

    const updatedTarif = await existingTarif.save();

    // Mise à jour dans Firebase Realtime Database
    const firebaseRef = realtimeDB.ref("tarifs");
    await firebaseRef.update({
      baseFare: baseFareNum,
      farePerKm: farePerKmNum,
      farePerMinute: farePerMinuteNum,
      fraisDeService: fraisDeServiceNum
    });

    // Réponse de succès
    return res.status(200).send({
      message: "Tarif mis à jour avec succès dans MongoDB et Firebase !",
      updatedTarif,
    });
  } catch (error) {
    // Gestion des erreurs
    return res.status(500).send({
      message: "Une erreur s'est produite lors de la mise à jour.",
      error: error.message,
    });
  }
};
