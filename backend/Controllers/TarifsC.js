const Chauffeur = require("../Models/Chauffeur");
const Tarifs = require("../Models/Tarifs");
const cron = require('node-cron');
const moment = require('moment-timezone');

// Fonction générique pour mettre à jour tous les chauffeurs avec un tarif
const updateAllChauffeursWithTarif = async (tariffId) => {
  try {
    await Chauffeur.updateMany({}, { $set: { tarif: tariffId } });
    console.log("Tous les chauffeurs ont été mis à jour avec le tarif ID:", tariffId);
  } catch (error) {
    console.error("Erreur lors de la mise à jour des chauffeurs :", error.message);
  }
};



// Mise à jour du tarif automatiquement à une heure précise
function updateTariff() {
  const tunisiaTime = moment().tz('Africa/Tunis');
  const currentHour = tunisiaTime.hour();
  const currentMinute = tunisiaTime.minute();

  console.log('Heure actuelle (Tunisie) :', currentHour + ':' + currentMinute);

  // Exemple : mise à jour à 20:44
  if (currentHour === 20 && currentMinute === 44) {
    Tarifs.findOne({}, async (err, tariff) => {
      if (err) {
        console.error(err);
        return;
      }

      if (!tariff) {
        console.error('Aucun tarif trouvé');
        return;
      }

      // Mise à jour des tarifs avec une majoration de 50% sur les bases
      tariff.baseFare = (parseFloat(tariff.baseFare) * 1.5).toFixed(2);
      tariff.farePerKm = (parseFloat(tariff.farePerKm) * 1.5).toFixed(2);
      tariff.farePerMinute = (parseFloat(tariff.farePerMinute) * 1.5).toFixed(2);

      try {
        await tariff.save();
        console.log("Tarifs mis à jour automatiquement avec majoration.");
      } catch (error) {
        console.error("Erreur lors de la mise à jour des tarifs :", error.message);
      }
    });
  }
}

// Planification de la mise à jour automatique des tarifs
cron.schedule('44 20 * * *', () => {
  updateTariff();
}, {
  scheduled: true,
  timezone: "Africa/Tunis",
});






//lksdjfkjdsfjhddjdfjhfdhjdsfjjfdhjhksfdjdfj

// Afficher tous les tarifs
exports.showtarifs = async (req, res) => {
  try {
    const data = await Tarifs.find();
    res.json(data);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};


// Ajouter ou mettre à jour un tarif, et mettre à jour les chauffeurs
exports.addTarifAndUpdateChauffeurs = async (req, res) => {
  const { baseFare, farePerKm, farePerMinute } = req.body;

  try {
    const existingTarif = await Tarifs.findOne();

    if (existingTarif) {
      // Mise à jour du tarif existant
      existingTarif.baseFare = baseFare;
      existingTarif.farePerKm = farePerKm;
      existingTarif.farePerMinute = farePerMinute;

      const updatedTarif = await existingTarif.save();
      await updateAllChauffeursWithTarif(updatedTarif._id);

      return res.status(200).send({
        message: "Tarif existant mis à jour et chauffeurs mis à jour !",
      });
    }

    // Création d'un nouveau tarif
    const newTarif = new Tarifs({ baseFare, farePerKm, farePerMinute });
    const savedTarif = await newTarif.save();
    await updateAllChauffeursWithTarif(savedTarif._id);

    return res.status(200).send({
      message: "Nouveau tarif ajouté et chauffeurs mis à jour !",
    });

  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};




// Mise à jour manuelle d'un tarif spécifique
exports.updateTarifAndMajoration = async (req, res) => {
  const { tarifId, baseFare, farePerKm, farePerMinute } = req.body;

  try {
    const existingTarif = await Tarifs.findById(tarifId);

    if (!existingTarif) {
      return res.status(404).send({ message: "Tarif non trouvé" });
    }

    existingTarif.baseFare = baseFare;
    existingTarif.farePerKm = farePerKm;
    existingTarif.farePerMinute = farePerMinute;

    const updatedTarif = await existingTarif.save();

    return res.status(200).send({
      message: "Tarif mis à jour avec succès !",
      updatedTarif,
    });

  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};
