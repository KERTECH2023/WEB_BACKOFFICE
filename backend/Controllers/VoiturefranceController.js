const Voiture = require("../Models/Voiturefrance");
const firestoreModule = require("../services/config");
const realtimeDB = firestoreModule.firestoreApp.database();
const Chauffeur = require("../Models/Chauffeurfrance");

exports.addvoiture = async (req, res) => {
  const { modelle, immatriculation } = req.body;
  const chauffeurId = req.params.id;

  // const {firebaseUrl} =req.file ? req.file : "";

  /*
const cartegriseUrl = req.uploadedFiles.cartegrise || '';
const assuranceUrl = req.uploadedFiles.assurance || '';
*/
  const cartegriseUrl = req.uploadedFiles.photoAvatar;
  const assuranceUrl = req.uploadedFiles.photoPermisRec;

  const verifUtilisateur = await Voiture.findOne({ immatriculation });
  if (verifUtilisateur) {
    res.status(403).send({ message: "Voiture existe deja !" });
  } else {
    const nouveauUtilisateur = new Voiture();

    nouveauUtilisateur.modelle = modelle;
    nouveauUtilisateur.immatriculation = immatriculation;
    nouveauUtilisateur.cartegrise = cartegriseUrl;
    nouveauUtilisateur.assurance = assuranceUrl;
    nouveauUtilisateur.chauffeur = chauffeurId;

    console.log(nouveauUtilisateur);

    nouveauUtilisateur.save();

    // token creation
    res.status(201).send({ message: "success" });
  }
};

exports.updateVoiture = async (req, res) => {
  const voitureId = req.params.id;
  const { modelle, immatriculation } = req.body;
  const cartegriseUrl = req.uploadedFiles?.cartegrise || null;
  const assuranceUrl = req.uploadedFiles?.assurance || null;

  try {
    // Recherche de la voiture par ID
    const voiture = await Voiture.findById(voitureId);

    if (!voiture) {
      return res.status(404).send({ message: "Voiture introuvable" });
    }

    // Mise à jour des champs si présents dans la requête
    if (modelle) voiture.modelle = modelle;
    if (immatriculation) voiture.immatriculation = immatriculation;
    if (cartegriseUrl) voiture.cartegrise = cartegriseUrl;
    if (assuranceUrl) voiture.assurance = assuranceUrl;

    // Recherche du chauffeur associé
    const chauffeur = await Chauffeur.findById(voiture.chauffeur);
    if (!chauffeur) {
      return res.status(404).send({ message: "Chauffeur associé introuvable" });
    }
    if (chauffeur.firebaseUID !== undefined) {
      // Mise à jour dans Firebase Realtime Database
      const firebaseRef = realtimeDB.ref("Drivers/" + chauffeur.firebaseUID + "/carDetails");
      await firebaseRef.update({
          ...(immatriculation && { immatriculation: immatriculation }),
          ...(modelle && { modelle: modelle }),
      });
  } 
  
  

    // Sauvegarder les modifications dans MongoDB
    await voiture.save();

    res.status(200).send({ message: "Voiture mise à jour avec succès", voiture });
  } catch (err) {
    console.error("Erreur lors de la mise à jour :", err);
    res.status(500).send({ message: "Erreur serveur lors de la mise à jour", error: err.message });
  }
};



exports.getBychauff = async (req, res) => {
  Voiture.find({ chauffeur: req.params.id })
    .then((data) => {
      if (!data) {
        res
          .status(404)
          .send({ message: "Agent introuvable pour id " + chauffeur });
      } else {
        // Extract the first element from the array
        const response = data[0];
        res.send(response);
      }
    })
    .catch((err) => {
      res
        .status(500)
        .send({ message: "Erreur récupération Agent avec id=" + chauffeur });
    });
};
