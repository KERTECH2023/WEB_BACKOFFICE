const Chauffeur = require("../Models/Chauffeur");
const Tarifs = require("../Models/Tarifs");
const cron = require('node-cron');
const moment = require('moment-timezone');

exports.addTarifAndUpdateChauffeurs = async (req, res, next) => {
    const { tarif, tarifMaj } = req.body;

    try {
      const existingTarif = await Tarifs.findOne();

      if (existingTarif) {
        existingTarif.tarif = tarif;
        existingTarif.tarifmaj = tarifMaj;
        const updatedTarif = await existingTarif.save();

        const tariffId = updatedTarif._id;
        const updateResult = await Chauffeur.updateMany({}, { $set: { tarif: tariffId } });

        return res.status(200).send({
          message: "Existing tariff updated and chauffeurs updated!"
        });
      }

      const newTarif = new Tarifs({ tarif, tarifmaj });
      const savedTarif = await newTarif.save();

      const tariffId = savedTarif._id;
      const updateResult = await Chauffeur.updateMany({}, { $set: { tarif: tariffId } });

      return res.status(200).send({
        message: "Tarif added and chauffeurs updated!"
      });

    } catch (error) {
      return res.status(500).send({ error: error.message });
    }
};


function updateTariff() {
  const tunisiaTime = moment().tz('Africa/Tunis');
  const currentHour = tunisiaTime.hour();
  const currentMinute = tunisiaTime.minute();
  console.log('Time:', currentHour + ':' + currentMinute);

  if (currentHour === 20 && currentMinute === 44) {
    Tarifs.findOne({}, (err, tariff) => {
      if (err) {
        console.error(err);
        return;
      }
      
      // Vérification si `tariff` existe avant d'accéder à ses propriétés
      if (!tariff) {
        console.error('No tariff found');
        return;
      }

      const oldTariff = parseFloat(tariff.tarif);
      console.log('Old Tariff:', oldTariff);
      const newTariff = oldTariff + (oldTariff * 0.5);
      const roundedNewTariff = Number(newTariff.toFixed(2));

      tariff.tarifmaj = roundedNewTariff.toString();
      tariff.save((err) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log("Tarif Majoration updated to:", newTariff);
      });
    });
  }
}

// Planification de la mise à jour automatique du tarif
cron.schedule('44 20 * * *', () => {
  updateTariff();
}, {
  scheduled: true,
  timezone: "Africa/Tunis"
});

exports.showtarifs = async (req, res) => {
  Tarifs.find((err, data) => {
    if (err) {
      return res.status(500).send({ error: err.message });
    }
    res.json(data);
  });
};

exports.updateTarifAndMajoration = async (req, res, next) => {
  const { tarifId, newTarif, newTarifMaj } = req.body;

  try {
    // Vérification si un tarif existe avec l'ID fourni
    const existingTarif = await Tarifs.findById(tarifId);

    if (!existingTarif) {
      return res.status(404).send({ message: "Tarif not found" });
    }

    // Mise à jour des champs tarif et tarifmaj
    existingTarif.tarif = newTarif;
    existingTarif.tarifmaj = newTarifMaj;

    const updatedTarif = await existingTarif.save();

    return res.status(200).send({
      message: "Tarif and Tarif Majoration updated!",
      updatedTarif
    });

  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};
