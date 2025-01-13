const TarifsDeTempsFort = require('../Models/TarifsDeTempsFort');
const Chauffeur = require('../Models/Chauffeur');
const cron = require('node-cron');
const moment = require('moment-timezone');
const firestoreModule = require("../services/config");
const realtimeDB = firestoreModule.firestoreApp.database();

// Fonction générique pour mettre à jour tous les chauffeurs avec un tarif
const updateAllChauffeursWithTarif = async (tariffId) => {
  try {
    await Chauffeur.updateMany({}, { $set: { tarifTempsFort: tariffId } });
    console.log("Tous les chauffeurs ont été mis à jour avec le tarif temps fort ID:", tariffId);
  } catch (error) {
    console.error("Erreur lors de la mise à jour des chauffeurs :", error.message);
  }
};

// Afficher tous les tarifs temps fort
exports.showtarifs = async (req, res) => {
  try {
    const data = await TarifsTempsFort.find();
    res.json(data);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

// Ajouter ou mettre à jour un tarif temps fort, et mettre à jour les chauffeurs
exports.addTarifAndUpdateChauffeurs = async (req, res) => {
  const { baseFare, farePerKm, farePerMinute } = req.body;

  try {
    // Validation des données
    if (
      baseFare === undefined ||
      farePerKm === undefined ||
      farePerMinute === undefined
    ) {
      return res.status(400).send({
        message: "Veuillez fournir baseFare, farePerKm et farePerMinute.",
      });
    }

    // Conversion explicite en nombres
    const baseFareNum = Number(baseFare);
    const farePerKmNum = Number(farePerKm);
    const farePerMinuteNum = Number(farePerMinute);

    // Vérification des valeurs après conversion
    if (
      isNaN(baseFareNum) ||
      isNaN(farePerKmNum) ||
      isNaN(farePerMinuteNum)
    ) {
      return res.status(400).send({
        message: "Les valeurs baseFare, farePerKm et farePerMinute doivent être des nombres valides.",
      });
    }

    // Rechercher un tarif existant dans MongoDB
    let existingTarif = await TarifsTempsFort.findOne();

    if (existingTarif) {
      // Mise à jour du tarif existant
      existingTarif.baseFare = baseFareNum;
      existingTarif.farePerKm = farePerKmNum;
      existingTarif.farePerMinute = farePerMinuteNum;

      const updatedTarif = await existingTarif.save();

      // Mise à jour dans Firebase
      const firebaseRef = realtimeDB.ref("tarifsTempsFort");
      await firebaseRef.update({
        baseFare: baseFareNum,
        farePerKm: farePerKmNum,
        farePerMinute: farePerMinuteNum,
      });

      // Mise à jour des chauffeurs avec le tarif mis à jour
      await updateAllChauffeursWithTarif(updatedTarif._id);

      return res.status(200).send({
        message: "Tarif temps fort existant mis à jour et chauffeurs mis à jour !",
        tarif: updatedTarif,
      });
    }

    // Création d'un nouveau tarif
    const newTarif = new TarifsTempsFort({
      baseFare: baseFareNum,
      farePerKm: farePerKmNum,
      farePerMinute: farePerMinuteNum,
    });
    const savedTarif = await newTarif.save();

    // Ajout dans Firebase
    const firebaseRef = realtimeDB.ref("tarifsTempsFort");
    await firebaseRef.set({
      baseFare: baseFareNum,
      farePerKm: farePerKmNum,
      farePerMinute: farePerMinuteNum,
    });

    // Mise à jour des chauffeurs avec le nouveau tarif
    await updateAllChauffeursWithTarif(savedTarif._id);

    return res.status(201).send({
      message: "Nouveau tarif temps fort ajouté et chauffeurs mis à jour !",
      tarif: savedTarif,
    });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

exports.updateTarifAndMajoration = async (req, res) => {
  const { tarifId, baseFare, farePerKm, farePerMinute } = req.body;

  try {
    // Vérifier si les données nécessaires sont fournies
    if (
      !tarifId ||
      baseFare === undefined ||
      farePerKm === undefined ||
      farePerMinute === undefined
    ) {
      return res.status(400).send({
        message: "Veuillez fournir tarifId, baseFare, farePerKm et farePerMinute.",
      });
    }

    // Conversion directe des valeurs en type number
    const baseFareNum = Number(baseFare);
    const farePerKmNum = Number(farePerKm);
    const farePerMinuteNum = Number(farePerMinute);

    // Vérifier que les valeurs converties sont valides
    if (
      isNaN(baseFareNum) ||
      isNaN(farePerKmNum) ||
      isNaN(farePerMinuteNum)
    ) {
      return res.status(400).send({
        message: "Les valeurs baseFare, farePerKm et farePerMinute doivent être des nombres valides.",
      });
    }

    // Mise à jour dans MongoDB
    const existingTarif = await TarifsTempsFort.findById(tarifId);
    if (!existingTarif) {
      return res.status(404).send({ message: "Tarif temps fort non trouvé dans MongoDB." });
    }

    existingTarif.baseFare = baseFareNum;
    existingTarif.farePerKm = farePerKmNum;
    existingTarif.farePerMinute = farePerMinuteNum;

    const updatedTarif = await existingTarif.save();

    // Mise à jour dans Firebase Realtime Database
    const firebaseRef = realtimeDB.ref("tarifsTempsFort");
    await firebaseRef.update({
      baseFare: baseFareNum,
      farePerKm: farePerKmNum,
      farePerMinute: farePerMinuteNum,
    });

    // Réponse de succès
    return res.status(200).send({
      message: "Tarif temps fort mis à jour avec succès dans MongoDB et Firebase !",
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
