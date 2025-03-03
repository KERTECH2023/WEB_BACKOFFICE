// const mongoose = require("mongoose");
// const cron = require("node-cron");
// const RideRequest = require("../Models/AllRideRequest");
// const Facture = require("../Models/Facture");
// const GlobalCounter = require("../Models/GlobalCounter");

// // MongoDB connection

// async function generateInvoiceNumber() {
//   const currentYear = new Date().getFullYear();

//   let counter;
//   try {
//     counter = await GlobalCounter.findOneAndUpdate(
//       { year: currentYear },
//       { $inc: { count: 1 } },
//       { new: true, upsert: true }
//     );
//   } catch (error) {
//     console.error("Error while updating the counter:", error);
//     throw error;
//   }

//   // Générer le numéro de facture en combinant l'année et le compteur (ex: 2024_001)
//   return `${currentYear}_${String(counter.count).padStart(3, "0")}`;
// }

// function getPreviousMonth() {
//   const now = new Date();
//   let year = now.getFullYear();
//   let month = now.getMonth(); // Janvier = 0, Décembre = 11

//   if (month === 0) {
//     // Si c'est Janvier, passer à Décembre de l'année précédente
//     month = 11;
//     year -= 1;
//   } else {
//     month -= 1;
//   }

//   return {
//     year,
//     month: month + 1, // Les mois doivent être de 1 à 12
//   };
// }

// const { year: previousYear, month: previousMonth } = getPreviousMonth();

// const aggregationPipeline = [
//   {
//     $lookup: {
//       from: "chauffeurs",
//       localField: "driverPhone",
//       foreignField: "phone",
//       as: "driverInfo",
//     },
//   },
//   {
//     $unwind: "$driverInfo",
//   },
//   {
//     $addFields: {
//       timestamp: {
//         $toDate: "$time", // Changed $convert to $toDate for simplicity
//       },
//     },
//   },
//   {
//     $addFields: {
//       year: { $year: "$timestamp" },
//       month: { $month: "$timestamp" },
//     },
//   },
//   {
//     $group: {
//       _id: {
//         driverPhone: "$driverPhone",
//         driverId: "$driverInfo._id",
//         year: "$year",
//         month: "$month",
//       },
//       totalFareAmount: { $sum: "$fareAmount" },
//       nbretrajet: { $sum: 1 },
//     },
//   },
//   {
//     $project: {
//       driverPhone: "$_id.driverPhone",
//       chauffeur: "$_id.driverId",
//       Year: "$_id.year",
//       Month: "$_id.month",
//       totalFareAmount: 1,
//       nbretrajet: 1,
//       payd: { $literal: false },
//       _id: 0,
//       montantTva: { $multiply: ["$totalFareAmount", 0.05] }, // Calculating 5% of montant for montantTva
//     },
//   },
// ];

// async function createFactureView() {
//   const db = mongoose.connection.getClient().db(mongoose.connection.name); // Obtenir la base de données

//   const createViewCommand = {
//     create: "factView",
//     viewOn: "factures",
//     pipeline: aggregationPipeline,
//   };

//   try {
//     await db.command(createViewCommand);
//     console.log("Vue 'factView' créée avec succès.");
//   } catch (error) {
//     console.error("Erreur lors de la création de la vue:", error);
//   }
// }

// // Appelle cette fonction après ton agrégation
// async function runAggregation() {
//   try {
//     const result = await RideRequest.aggregate(aggregationPipeline);

//     await Promise.all(
//       result.map(async (data) => {
//         const {
//           chauffeur,
//           Year,
//           Month,
//           totalFareAmount,
//           nbretrajet,
//           montantTva,
//         } = data;

//         // Générer un numéro de facture unique pour chaque facture
//         const invoiceNumber = await generateInvoiceNumber();

//         // Vérifier si une facture existe déjà
//         const existingFacture = await Facture.findOne({
//           chauffeur,
//           Year,
//           Month,
//         });

//         if (existingFacture) {
//           return; // Passer à l'élément suivant
//         }

//         // Si la facture n'existe pas, insérer une nouvelle facture
//         const newFacture = new Facture({
//           chauffeur,
//           Year,
//           Month,
//           totalFareAmount,
//           nbretrajet,
//           montantTva,
//           payd: false,
//           invoiceNumber,
//         });

//         await newFacture.save();
//         console.log("Facture insérée :", newFacture);
//       })
//     );

//     // Crée la vue après l'insertion des factures
//     await createFactureView();
//   } catch (error) {
//     console.error(
//       "Erreur lors de l'agrégation et de l'insertion des données:",
//       error
//     );
//   }
// }

// // Function to run aggregation and update Facture
// async function runAggregation() {
//   try {
//     const result = await RideRequest.aggregate(aggregationPipeline);

//     await Promise.all(
//       result.map(async (data) => {
//         const {
//           chauffeur,
//           Year,
//           Month,
//           totalFareAmount,
//           nbretrajet,
//           montantTva,
//         } = data;

//         // Générer un numéro de facture unique pour chaque facture
//         const invoiceNumber = await generateInvoiceNumber();

//         // Vérifier si une facture existe déjà
//         const existingFacture = await Facture.findOne({
//           chauffeur,
//           Year,
//           Month,
//         });

//         if (existingFacture) {
//           return; // Passer à l'élément suivant
//         }

//         // Si la facture n'existe pas, insérer une nouvelle facture
//         const newFacture = new Facture({
//           chauffeur,
//           Year,
//           Month,
//           totalFareAmount,
//           nbretrajet,
//           montantTva,
//           payd: false,
//           invoiceNumber,
//         });

//         await newFacture.save();
//         console.log("Facture inserted:", newFacture);
//       })
//     );
//     await createFactureView();
//   } catch (error) {
//     console.error("Error while aggregating and inserting data:", error);
//   }
// }

// //cron.schedule('0 23 1 * *', () => {
// //console.log('Running monthly aggregation');
// runAggregation();
// //});

// //console.log('Scheduled monthly aggregation job.');

const saveRide = async (req, res) => {
  try {
    const {
      HealthStatus,

      destination,

      driverLocation,
      fareAmount,
      driverName,
      driverPhone,
      source,
      status,
      time,
      userName,
      userPhone,
    } = req.body;

    // Créer une nouvelle instance de RideRequest
    const newRideRequest = new RideRequest({
      HealthStatus: HealthStatus,
      destination: {
        latitude: destination.latitude,
        longitude: destination.longitude,
      },
      driverLocationData: {
        latitude: driverLocation.latitude,
        longitude: driverLocation.longitude,
      },
      fareAmount: fareAmount,
      driverPhone: driverPhone,
      source: {
        latitude: source.latitude,
        longitude: source.longitude,
      },
      status: status,
      time: time,
      userName: userName,
      userPhone: userPhone,
    });

    // Sauvegarder la demande de trajet dans la base de données
    await newRideRequest.save();

    res
      .status(201)
      .json({ message: "Demande de trajet sauvegardée avec succès." });
  } catch (error) {
    console.error(
      "Erreur lors de la sauvegarde de la demande de trajet :",
      error
    );
    res.status(500).json({
      message: "Erreur lors de la sauvegarde de la demande de trajet.",
    });
  }
};

// // const getfact = (req, res) => {
// //   RideRequest.aggregate(pipeline, (err, data) => {
// //     if (err) {
// //       res.status(500).send("Error during aggregation");
// //     } else {
// //       const factures = data.map((entry) => {
// //         return new Facture({
// //           chauffeur:entry.driverPhone,
// //           date: new Date(entry.time[0]), // assuming time is an array of dates
// //           montant: entry.totalFareAmount,
// //           description: "",
// //           isPaid: false,
// //         });
// //       });
// //       res.send(factures);
// //       console.log(factures);
// //     }
// //   });
// // };
// // Execute the aggregation pipeline
// // const result =  RideRequest.aggregate(pipeline)
// // console.log(result);

// module.exports = { saveRide, runAggregation };
