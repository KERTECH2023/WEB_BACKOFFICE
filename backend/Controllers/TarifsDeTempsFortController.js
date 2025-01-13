const TarifsDeTempsFort = require('../Models/TarifsDeTempsFort');
const Chauffeur = require('../Models/Chauffeur');
const firestoreModule = require('../services/config');
const realtimeDB = firestoreModule.firestoreApp.database();

// Fonction générique pour mettre à jour les chauffeurs
const updateAllChauffeursWithPeakTarif = async (tariffId) => {
  try {
    await Chauffeur.updateMany({}, { $set: { peakTarif: tariffId } });
    console.log("Tous les chauffeurs ont été mis à jour avec le tarif de temps fort ID:", tariffId);
  } catch (error) {
    console.error("Erreur lors de la mise à jour des chauffeurs :", error.message);
  }
};
// Mise à jour d'un tarif de temps fort spécifique
exports.updatePeakTarif = async (req, res) => {
  const { id } = req.params;
  const { startHour, endHour, baseFare, farePerKm, farePerMinute } = req.body;

  try {
    // Validation des champs
    if (!startHour || !endHour || baseFare === undefined || 
        farePerKm === undefined || farePerMinute === undefined) {
      return res.status(400).send({
        message: "Veuillez fournir tous les champs requis."
      });
    }

    // Conversion en nombres
    const baseFareNum = Number(baseFare);
    const farePerKmNum = Number(farePerKm);
    const farePerMinuteNum = Number(farePerMinute);

    if (isNaN(baseFareNum) || isNaN(farePerKmNum) || isNaN(farePerMinuteNum)) {
      return res.status(400).send({
        message: "Les tarifs doivent être des nombres valides."
      });
    }

    // Recherche et mise à jour du tarif
    const updatedTarif = await TarifsDeTempsFort.findByIdAndUpdate(
      id,
      {
        startHour,
        endHour,
        baseFare: baseFareNum,
        farePerKm: farePerKmNum,
        farePerMinute: farePerMinuteNum
      },
      { new: true }
    );

    if (!updatedTarif) {
      return res.status(404).send({
        message: "Tarif non trouvé."
      });
    }

    // Mise à jour dans Firebase
    const firebaseRef = realtimeDB.ref("tarifsDeTempsFort");
    await firebaseRef.update({
      startHour,
      endHour,
      baseFare: baseFareNum,
      farePerKm: farePerKmNum,
      farePerMinute: farePerMinuteNum
    });

    // Mise à jour des chauffeurs si nécessaire
    await updateAllChauffeursWithPeakTarif(updatedTarif._id);

    res.status(200).send({
      message: "Tarif mis à jour avec succès",
      tarif: updatedTarif
    });

  } catch (error) {
    res.status(500).send({
      message: "Erreur lors de la mise à jour du tarif",
      error: error.message
    });
  }
};
// Afficher tous les tarifs de temps fort
exports.showPeakTarifs = async (req, res) => {
  try {
    const data = await TarifsDeTempsFort.find();
    res.json(data);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

// Ajouter ou mettre à jour un tarif de temps fort
exports.addPeakTarifAndUpdateChauffeurs = async (req, res) => {
  const { startHour, endHour, baseFare, farePerKm, farePerMinute } = req.body;

  try {
    // Validation des champs
    if (
      !startHour ||
      !endHour ||
      baseFare === undefined ||
      farePerKm === undefined ||
      farePerMinute === undefined
    ) {
      return res.status(400).send({
        message: "Veuillez fournir startHour, endHour, baseFare, farePerKm et farePerMinute.",
      });
    }

    // Conversion explicite en nombres
    const baseFareNum = Number(baseFare);
    const farePerKmNum = Number(farePerKm);
    const farePerMinuteNum = Number(farePerMinute);

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
    let existingTarif = await TarifsDeTempsFort.findOne({ startHour, endHour });

    if (existingTarif) {
      // Mise à jour du tarif existant
      existingTarif.baseFare = baseFareNum;
      existingTarif.farePerKm = farePerKmNum;
      existingTarif.farePerMinute = farePerMinuteNum;

      const updatedTarif = await existingTarif.save();

      // Mise à jour dans Firebase
      const firebaseRef = realtimeDB.ref("tarifsDeTempsFort");
      await firebaseRef.update({
        startHour,
        endHour,
        baseFare: baseFareNum,
        farePerKm: farePerKmNum,
        farePerMinute: farePerMinuteNum,
      });

      // Mise à jour des chauffeurs avec le tarif mis à jour
      await updateAllChauffeursWithPeakTarif(updatedTarif._id);

      return res.status(200).send({
        message: "Tarif existant mis à jour et chauffeurs mis à jour !",
        tarif: updatedTarif,
      });
    }

    // Création d'un nouveau tarif
    const newTarif = new TarifsDeTempsFort({
      startHour,
      endHour,
      baseFare: baseFareNum,
      farePerKm: farePerKmNum,
      farePerMinute: farePerMinuteNum,
    });
    const savedTarif = await newTarif.save();

    // Ajout dans Firebase
    const firebaseRef = realtimeDB.ref("tarifsDeTempsFort");
    await firebaseRef.set({
      startHour,
      endHour,
      baseFare: baseFareNum,
      farePerKm: farePerKmNum,
      farePerMinute: farePerMinuteNum,
    });

    // Mise à jour des chauffeurs avec le nouveau tarif
    await updateAllChauffeursWithPeakTarif(savedTarif._id);

    return res.status(201).send({
      message: "Nouveau tarif ajouté et chauffeurs mis à jour !",
      tarif: savedTarif,
    });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};
