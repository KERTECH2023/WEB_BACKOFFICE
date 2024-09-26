const mongoose = require("mongoose");
const moment = require("moment");
const RideRequest = require("../Models/AllRideRequest");
const Facture = require("../Models/Facture");
const Chauffeur = require("../Models/Chauffeur");

async function generateDriverStatistics() {
  try {
    const statistics = await Chauffeur.aggregate([
      {
        $lookup: {
          from: "riderequests",
          localField: "phone",
          foreignField: "driverPhone",
          as: "trajets",
        },
      },
      {
        $project: {
          _id: 1,
          Nom: 1,
          Prenom: 1,
          phone: 1,
          totalMontantTTC: { $sum: "$trajets.fareAmount" },
          nbTrajets: { $size: "$trajets" },

          montantParMoisAnnee: {
            $map: {
              input: {
                $setUnion: {
                  $map: {
                    input: "$trajets",
                    as: "trajet",
                    in: {
                      $dateToString: {
                        format: "%Y-%m",
                        date: "$$trajet.time",
                      },
                    },
                  },
                },
              },
              as: "monthYear",
              in: {
                monthYear: "$$monthYear",
                montantTTC: {
                  $sum: {
                    $map: {
                      input: {
                        $filter: {
                          input: "$trajets",
                          as: "t",
                          cond: {
                            $eq: [
                              {
                                $dateToString: {
                                  format: "%Y-%m",
                                  date: "$$t.time",
                                },
                              },
                              "$$monthYear",
                            ],
                          },
                        },
                      },
                      as: "filteredTrajet",
                      in: "$$filteredTrajet.fareAmount",
                    },
                  },
                },
              },
            },
          },
        },
      },
    ]);

    return statistics;
  } catch (error) {
    console.error("Error generating driver statistics:", error);
    throw error;
  }
}

async function generateFactures() {
  try {
    // Aggregate all rides by driver and month
    const aggregationResult = await RideRequest.aggregate([
      {
        $group: {
          _id: {
            driverPhone: "$driverPhone",
            year: { $year: "$time" },
            month: { $month: "$time" },
          },
          nbTrajet: { $sum: 1 },
          montantTTC: { $sum: "$fareAmount" },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.driverPhone": 1 },
      },
    ]);

    for (const result of aggregationResult) {
      const { driverPhone, year, month } = result._id;
      const chauffeur = await Chauffeur.findOne({ phone: driverPhone });
      if (!chauffeur) {
        console.log(`No chauffeur found for phone: ${driverPhone}`);
        continue;
      }

      // Check if a facture already exists for this driver and month
      const existingFacture = await Facture.findOne({
        chauffeurId: chauffeur._id,
        mois: month,
        annee: year,
      });

      if (existingFacture) {
        console.log(
          `Facture already exists for ${chauffeur.Nom} ${chauffeur.Prenom} for ${month}/${year}`
        );
        continue;
      }

      const fraisDeService = result.montantTTC * 0.15; // 15% service fee

      const chauffeurId = chauffeur._id.toString().substr(0, 4);
      const nomPrenom = `${chauffeur.Nom.substr(0, 2)}${chauffeur.Prenom.substr(
        0,
        2
      )}`.toUpperCase();
      const newNumber = `${chauffeurId}_${nomPrenom}_${month
        .toString()
        .padStart(2, "0")}_${year}`;

      const dateEcheance = moment([year, month - 1])
        .add(1, "month")
        .date(15)
        .toDate();

      const newFacture = new Facture({
        numero: newNumber,
        mois: month,
        annee: year,
        nbTrajet: result.nbTrajet,
        montantTTC: Number(result.montantTTC.toFixed(2)),
        fraisDeService: Number(fraisDeService.toFixed(2)),
        chauffeurId: chauffeur._id,
        nomChauffeur: `${chauffeur.Nom} ${chauffeur.Prenom}`,
        dateEcheance: dateEcheance,
        notes: `Frais de service: ${fraisDeService.toFixed(2)} TND`,
      });

      await newFacture.save();
      console.log(
        `Facture created for ${newFacture.nomChauffeur}: ${newFacture.numero}`
      );
    }

    console.log("Facture generation completed.");
  } catch (error) {
    console.error("Error generating factures:", error);
  }
}

module.exports = { generateDriverStatistics, generateFactures };
