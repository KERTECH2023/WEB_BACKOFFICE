const bcrypt = require("bcryptjs");
const config = require("../config.json");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { Buffer } = require("node:buffer");
const firestoreModule = require("../services/config");
const db = require("../services/config");
const admin = require("firebase-admin");
const crypto = require("crypto");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const realtimeDB = firestoreModule.firestoreApp.database();
const Car = require("../Models/Voiture"); // Assuming the Car schema is defined in 'Car.js'
const Facture = require("../Models/Facture"); // Assuming the Car schema is defined in 'Car.js'
const RideRequest = require("../Models/AllRideRequest"); // Import the RideRequest Mongoose model
const Chauffeur = require("../Models/Chauffeur");
const PDFDocument = require("pdfkit");
const querystring = require("querystring");
const https = require("https");
const whatsappController = require('../Controllersfr/whatsappController');

const fs = require("fs");

const createDriversNodeIfNotExists = async () => {
  const driversRef = realtimeDB.ref("Drivers");

  try {
    const snapshot = await driversRef.once("value");

    if (!snapshot.exists()) {
      // La référence "Drivers" n'existe pas, on la crée
      await driversRef.set({
        message: "Drivers node created successfully!"
      });
      console.log("Drivers node created.");
    } else {
      console.log("Drivers node already exists.");
    }
  } catch (error) {
    console.error("Error checking or creating Drivers node:", error);
  }
};



/**--------------------Ajouter un agnet------------------------  */

const rejectChauffeur = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  try {
    const chauffeur = await Chauffeur.findById(id);
    if (!chauffeur) {
      return res.status(404).send({ message: 'Chauffeur not found' });
    }

    // Create transporter for sending email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'noreplyflashdriver@gmail.com',
        pass: 'uvfu llrf qsbw esok',
      },
    });

    // Email options
    const mailOptions = {
      from: 'noreplyflashdriver@gmail.com',
      to: chauffeur.email,
      subject: 'Rejet de votre inscription',
      text: `Votre inscription a été refusée pour la raison suivante : ${reason}`,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    res.status(200).send({ message: 'Email sent successfully' });
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    res.status(500).send({ message: 'Error sending email' });
  }
};







const generateRandomPassword = () => {
  return crypto.randomBytes(8).toString("hex");
};

const generatePdf = async (facture) => {
  try {
    const chauffeur = facture.chauffeur;
    const nomComplet = `${chauffeur.Nom} ${chauffeur.Prenom}`;
    const nbreTrajet = facture.nbretrajet;
    const totalFare = facture.totalFareAmount;
    const montantTva = facture.montantTva;
    const mois = facture.Month;
    const dateDePaiement = new Date();

    const pdfPath = `./facture_${facture.id}.pdf`;

    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(pdfPath);
    doc.pipe(writeStream);

    doc.fontSize(20).text("Facture de Paiement", { align: "center" });
    doc.moveDown();
    doc.fontSize(16).text(`Nom du Chauffeur: ${nomComplet}`);
    doc.text(`Nombre de Trajets: ${nbreTrajet}`);
    doc.text(`Montant Total (avant TVA): ${totalFare.toFixed(2)} €`);
    doc.text(`Montant TVA: ${montantTva.toFixed(2)} €`);
    doc.text(`Mois: ${mois}`);
    doc.text(`Date de Paiement: ${dateDePaiement.toLocaleDateString()}`);
    doc.end();

    return new Promise((resolve, reject) => {
      writeStream.on("finish", () => {
        console.log("PDF généré avec succès:", pdfPath);
        resolve(pdfPath);
      });

      writeStream.on("error", (err) => {
        console.error("Erreur lors de la génération du PDF:", err);
        reject(err);
      });
    });
  } catch (error) {
    console.error("Erreur lors de la génération du PDF:", error);
    throw error;
  }
};

const sendFactureEmail = async (req, res) => {
  const { email, Month, id } = req.body; // Email du destinataire
  const file = req.file; // Fichier PDF envoyé
  const monthNumber = parseInt(Month, 10);
  if (!email || !file) {
    return res.status(400).send("Email ou fichier manquant.");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "noreplyflashdriver@gmail.com", // Remplacez par votre adresse email
      pass: "uvfu llrf qsbw esok", // Remplacez par votre mot de passe email
    },
  });

  let mois;

  switch (monthNumber) {
    case 1:
      mois = "Janvier";
      break;
    case 2:
      mois = "Février";
      break;
    case 3:
      mois = "Mars";
      break;
    case 4:
      mois = "Avril";
      break;
    case 5:
      mois = "Mai";
      break;
    case 6:
      mois = "Juin";
      break;
    case 7:
      mois = "Juillet";
      break;
    case 8:
      mois = "Août";
      break;
    case 9:
      mois = "Septembre";
      break;
    default:
      mois = "Mois invalide";
      break;
  }

  const mailOptions = {
    from: "Flash Driver <noreplyflashdriver@gmail.com>",
    to: email,
    subject: `Facture de ${mois}`,
    text: "Veuillez trouver la facture en pièce jointe.",
    attachments: [
      {
        filename: "facture.pdf",
        content: file.buffer,
        encoding: "base64",
      },
    ],
  };

  try {
    await transporter.sendMail(mailOptions);

    await Facture.findByIdAndUpdate(id, { envoieFacture: true });

    console.log("E-mail envoyé et facture mise à jour ");
    res.status(200).send("E-mail envoyé avec succès et facture mise à jour");
  } catch (error) {
    console.error(
      "Erreur lors de l'envoi de l'email ou de la mise à jour de la facture:",
      error
    );
    res
      .status(500)
      .send(
        "Erreur lors de l'envoi de l'e-mail ou de la mise à jour de la facture"
      );
  }
};

const updateF = async (req, res) => {
  const { id } = req.params;

  try {
    // Vérifiez si la facture existe
    const existingFacture = await Facture.findById(id);
    if (!existingFacture) {
      return res.status(404).json({ message: "Facture non trouvée" });
    }

    // Mettez à jour le champ 'enr'
    const updatedFacture = await Facture.findByIdAndUpdate(
      id,
      { $set: { enrg: true } },
      { new: true }
    );

    res.json(updatedFacture);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la facture:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const getRideCounts = async (req, res) => {
  const { driverPhone } = req.query;

  if (!driverPhone) {
    return res.status(400).json({ message: "Driver phone number is required" });
  }

  try {
    // Comptez les trajets acceptés
    const acceptedCount = await RideRequest.countDocuments({
      driverPhone,
      status: "accepted",
    });

    // Comptez les trajets annulés
    const cancelledCount = await RideRequest.countDocuments({
      driverPhone,
      status: "cancelled",
    });

    res.status(200).json({
      accepted: acceptedCount,
      cancelled: cancelledCount,
    });
  } catch (error) {
    console.error("Error fetching ride counts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
// Controller function to get factures by chauffeur ID
const getFacturesByChauffeurId = (req, res) => {
  const id = req.params.chauffeurId;

  console.log("Chauffeur ID:", id);

  Facture.find({ chauffeur: id })
    .then(factures => {
      res.status(200).send(factures);
    })
    .catch(err => {
      console.error('Error while fetching factures:', err);
      res.status(500).json({ error: 'An error occurred while fetching factures' });
    });
};
const searchFacture = async (req, res) => {
  const id = req.params.id;
  console.log(id);
  try {
    const data = await Facture.findOne({
      chauffeurId: id
    });

    if (!data) {
      return res
        .status(404)
        .send({ message: "Facture introuvable pour id " + id });
    }

    res.json(data);
    console.log(data);
  } catch (err) {
    res
      .status(500)
      .send({ message: "Erreur de récupération de la facture avec id=" + id });
  }
};
const register = async (req, res) => {
  const {
    Nom,
    Prenom,
    email,
    phone,
    DateNaissance,
    gender,
    role,
    cnicNo,
    address,
    ratingsAverage,
    ratingsQuantity,
    postalCode,
  } = req.body;

  // const {firebaseUrl} =req.file ? req.file : "";

  const photoAvatarUrl = req.uploadedFiles.photoAvatar || "";
  const photoPermisRecUrl = req.uploadedFiles.photoPermisRec || "";
  const photoPermisVerUrl = req.uploadedFiles.photoPermisVer || "";
  const photoVtcUrl = req.uploadedFiles.photoVtc || "";
  const photoCinUrl = req.uploadedFiles.photoCin || "";

  const verifUtilisateur = await Chauffeur.findOne({ email });
  if (verifUtilisateur) {
    res.status(403).send({ message: "Chauffeur existe deja !" });
  } else {
    const nouveauUtilisateur = new Chauffeur();

    mdpEncrypted = bcrypt.hashSync(phone, 10);

    const nounIndex = Math.floor(Math.random() * Nom.length);
    const preIndex = Math.floor(Math.random() * Prenom.length);
    const randomNumber = Math.floor(Math.random() * 90000);

    nouveauUtilisateur.username = `${Nom[Math.floor(Math.random() * Nom.length)]
      }${Prenom[Math.floor(Math.random() * Prenom.length)]}${Math.floor(
        Math.random() * 90000
      )}`;
    nouveauUtilisateur.Nom = Nom;
    nouveauUtilisateur.Prenom = Prenom;
    nouveauUtilisateur.email = email;
    nouveauUtilisateur.phone = phone;
    nouveauUtilisateur.password = mdpEncrypted;

    nouveauUtilisateur.photoAvatar = photoAvatarUrl;
    nouveauUtilisateur.photoCin = photoCinUrl;
    nouveauUtilisateur.photoPermisRec = photoPermisRecUrl;
    nouveauUtilisateur.photoPermisVer = photoPermisVerUrl;
    nouveauUtilisateur.photoVtc = photoVtcUrl;
    nouveauUtilisateur.gender = gender;
    nouveauUtilisateur.role = "Chauffeur";
    nouveauUtilisateur.Cstatus = "En_cours";
    nouveauUtilisateur.DateNaissance = DateNaissance;
    nouveauUtilisateur.cnicNo = cnicNo;
    nouveauUtilisateur.address = address;
    // nouveauUtilisateur.ratingsAverage = ratingsAverage
    // nouveauUtilisateur.ratingsQuantity = ratingsQuantity
    nouveauUtilisateur.postalCode = postalCode;
    nouveauUtilisateur.isActive = true;

    console.log(nouveauUtilisateur);

    try {
      await nouveauUtilisateur.save();

      console.log(mdpEncrypted);
      // token creation
      const token = jwt.sign(
        { _id: nouveauUtilisateur._id },
        config.token_secret,
        {
          expiresIn: "120000", // in Milliseconds (3600000 = 1 hour)
        }
      );

      try {
        const response = await sendConfirmationEmail(
          email,
          Nom[nounIndex] + Prenom[preIndex] + randomNumber
        );
        console.log("Email sent successfully:", response);
      } catch (error) {
        console.error("Error sending email:", error);
      }
      res.status(201).send({
        message: "success",
        uses: nouveauUtilisateur,
        Token: jwt.verify(token, config.token_secret),
      });
    } catch (error) {
      console.error("Error while saving user:", error);
      res.status(500).send({ message: "Error while saving user." });
    }
  }
};

async function sendConfirmationEmail(Email, Password) {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "noreplyflashdriver@gmail.com", // Replace with your email
      pass: "uvfu llrf qsbw esok", // Replace with your email password
    },
  });

  transporter.verify(function (error, success) {
    if (error) {
      console.log(error);
      console.log("Server not ready");
    } else {
      console.log("Server is ready to take our messages");
    }
  });

  const mailOptions = {
    from: "Flash Driver<testrapide45@gmail.com>",
    to: Email,
    subject: "Flash Driver Nouveau Compte ",
    html:
      `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Activation de Compte Flash Driver</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .container {
            background-color: #f4f4f4;
            border-radius: 10px;
            padding: 20px;
        }
        .logo {
            max-width: 200px;
            margin-bottom: 20px;
        }
        .welcome-message {
            background-color: #fef852;
            border-radius: 10px;
            padding: 20px;
            text-align: center;
        }
        .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #666;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <img src="https://firebasestorage.googleapis.com/v0/b/prd-transport.appspot.com/o/logoc.png?alt=media&token=6a225136-94c5-407b-8501-c233e9aa721f" alt="Flash Driver Logo" class="logo">
        
        <div class="welcome-message">
            <h1>Merci de nous choisir</h1>
            <p>Votre compte a été activé avec succès.</p>
        </div>

        <div>
            <h2>Cher(e) ${Email},</h2>
            
            <p>Nous sommes ravis de vous accueillir sur Flash Driver ! Votre compte a été créé avec succès. Vous pouvez désormais profiter de tous nos services.</p>
            
            <p>Commandez un taxi en un clic depuis votre mobile et profitez d'une expérience de transport rapide et efficace.</p>
        </div>

        <div class="footer">
            <p>Si vous n'avez pas créé ce compte, veuillez nous contacter.</p>
               <div class="footer">
            <div class="download-section">
             <h2>Téléchargez notre application IOS</h2>
<div class="store-buttons">
    <a href="https://apps.apple.com/app/flashdriver-driver/id6737279801" class="store-button" target="_blank" rel="noopener noreferrer">
        App Store
    </a>
    
</div>

<h2>Téléchargez notre application Android</h2>
<div class="store-buttons">
    <a href="https://play.google.com/store/apps/details?id=com.flashdriversdriver.app" class="store-button" target="_blank" rel="noopener noreferrer">
        Google Play
    </a>
</div>

            <p>© ${new Date().getFullYear()} Flash Driver. Tous droits réservés.</p>
            <p><a href="#">Se désabonner</a></p>
        </div>
    </div>
</body>
</html>
`,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        reject(error);
      } else {
        console.log("Email sent: " + info.response);
        resolve(info.response);
      }
    });
  });
}

/**--------------Login Admin-------------------- */

const login = (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  Chauffeur.findOne({ username: username }, function (err, user) {
    if (err) {
      console.log(err);
      res
        .status(500)
        .send({ message: "Error retrieving user with username " + username });
      return;
    }
    if (!user) {
      res
        .status(403)
        .send({ message: "User not found with email " + username });
      return;
    }

    if (bcrypt.compare(password, user.password)) {
      res.json({
        role: user.role,
        email: user.email,
        password: user.password,
        id: user.id,
        Nom: user.Nom,
        Prenom: user.Prenom,
        photoAvatar: user.photoAvatar,
      });
    } else {
      res.status(403).send({ message: "Password does not match!" });
    }
  });
};

/**----------send notification Agent----------------- */





const sendNotificationMiseajour = async () => {
  try {
    const token = 'focF1dloQPakOLn-o0NP-T:APA91bGDYNTCLcLalXKz0-xy-Oy2EnaMSQoJcB51CmkTVy24JVYGVvhbNBPcG6JZL1dkuyH7VkO1GungMHS8Hx4TEqE_ocZq9yx0tSgKskfD_F0ESQ6JkPQ';
    const title = 'Mise à jour disponible';
    const body = 'Une nouvelle version de l\'application est disponible. Cliquez ici pour mettre à jour.';
    const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.tunisieuber.clientapp';

    const message = {
      token: token,
      notification: {
        title: title,
        body: body,
      },
      android: {
        notification: {
          click_action: 'FLUTTER_NOTIFICATION_CLICK',
          default_sound: true,
          default_vibrate_timings: true,
          notification_priority: 'PRIORITY_HIGH',
          link: playStoreUrl
        },
      },
      data: {
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
        url: playStoreUrl,
        link: playStoreUrl
      },
      webpush: {
        fcm_options: {
          link: playStoreUrl
        }
      }
    };

    const response = await admin.messaging().send(message);
    console.log('Notification envoyée avec succès:', response);
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification:', error);
  }
};








const sendNotificationToMultipleTokens = async (tokens, title, body, data = {}) => {
  try {
    const messages = tokens.map((token) => ({
      token: token, // Token de l'appareil cible
      notification: {
        title: title, // Titre de la notification
        body: body,  // Corps de la notification
      },
      data: data, // Données supplémentaires (optionnel)
    }));

    const responses = await Promise.all(messages.map((message) => admin.messaging().send(message)));
    console.log('Notifications envoyées avec succès:', responses);
  } catch (error) {
    console.error('Erreur lors de l\'envoi des notifications:', error);
  }
};

const sendmessagingnotification = async (req, res) => {
  const { body } = req;

  const snapshot = await realtimeDB.ref('Drivers').once('value');
  const drivers = snapshot.val();

  if (!drivers) {
    console.log('Aucun chauffeur trouvé.');
    return;
  }

  // Extraire les tokens des chauffeurs
  const tokens = Object.values(drivers)
    .filter(driver => driver.token) // Filtrer les chauffeurs avec Cstatus: true et un token valide
    .map(driver => driver.token);

  if (tokens.length === 0) {
    console.log('Aucun token valide trouvé.');
    return;
  }



  const data = { key1: 'valeur1', key2: 'valeur2' }; // Données personnalisées (optionnel)

  // Appeler la fonction pour envoyer les notifications
  await sendNotificationToMultipleTokens(tokens, body.title, body.body, data);

  res.status(200).send({ message: 'Notifications envoyées avec succès.' });
};

const sendmessagingnotificationclient = async (req, res) => {
  const { body } = req;

  const snapshot = await realtimeDB.ref('Users').once('value');
  const users = snapshot.val();

  if (!users) {
    console.log('Aucun chauffeur trouvé.');
    return;
  }

  // Extraire les tokens des chauffeurs
  const tokens = Object.values(users)
    .filter(users => users.token) // Filtrer les chauffeurs avec Cstatus: true et un token valide
    .map(users => users.token);

  if (tokens.length === 0) {
    console.log('Aucun token valide trouvé.');
    return;
  }



  const data = { key1: 'valeur1', key2: 'valeur2' }; // Données personnalisées (optionnel)

  // Appeler la fonction pour envoyer les notifications
  await sendNotificationToMultipleTokens(tokens, body.title, body.body, data);

  res.status(200).send({ message: 'Notifications envoyées avec succès.' });
};





/**----------Update Agent----------------- */

const updatemotdepasse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { Motdepasse } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Chauffeur ID is required." });
    }

    if (!Motdepasse) {
      return res.status(400).json({ message: "Le mot de passe est requis." });
    }

    // Trouver le chauffeur
    const chauffeur = await Chauffeur.findById(id);
    if (!chauffeur) {
      return res.status(404).json({ message: "Chauffeur not found." });
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(Motdepasse, 10);

    // Mise à jour du mot de passe Firebase si UID disponible
    if (chauffeur.firebaseUID) {
      await admin.auth().updateUser(chauffeur.firebaseUID, {
        password: Motdepasse,
      });
    }

    // Mise à jour du mot de passe dans MongoDB
    await Chauffeur.findByIdAndUpdate(id, { $set: { password: hashedPassword } });

    res.json({ message: "Mot de passe mis à jour avec succès !" });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du mot de passe :", error);
    res.status(500).json({
      message: "Erreur lors de la mise à jour du mot de passe.",
      error: error.message,
    });
  }
};


const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { uploadedFiles, body } = req;

    // Validate if Chauffeur ID is provided
    if (!id) {
      return res.status(400).json({ message: "Chauffeur ID is required." });
    }

    // Extract uploaded files, only if they are not null or undefined
    const photoAvatarUrl = uploadedFiles?.photoAvatar ? uploadedFiles.photoAvatar : undefined;
    const photoPermisRecUrl = uploadedFiles?.photoPermisRec ? uploadedFiles.photoPermisRec : undefined;
    const photoPermisVerUrl = uploadedFiles?.photoPermisVer ? uploadedFiles.photoPermisVer : undefined;
    const photoVtcUrl = uploadedFiles?.photoVtc ? uploadedFiles.photoVtc : undefined;
    const photoCinUrl = uploadedFiles?.photoCin ? uploadedFiles.photoCin : undefined;

    // Prepare update data dynamically
    const updateData = {
      Nom: body.Nom,
      Prenom: body.Prenom,
      email: body.email,
      phone: body.phone,
      ...(photoAvatarUrl && { photoAvatar: photoAvatarUrl }),
      ...(photoCinUrl && { photoCin: photoCinUrl }),
      ...(photoPermisRecUrl && { photoPermisRec: photoPermisRecUrl }),
      ...(photoPermisVerUrl && { photoPermisVer: photoPermisVerUrl }),
      ...(photoVtcUrl && { photoVtc: photoVtcUrl }),
      gender: body.gender,
      role: body.role,
      Nationalite: body.Nationalite,
      DateNaissance: body.DateNaissance,
      cnicNo: body.cnicNo,
      address: body.address,
      postalCode: body.postalCode,
    };

    console.log("Update Data:", updateData);

    // Find the chauffeur
    const chauffeur = await Chauffeur.findById(id);
    if (!chauffeur) {
      return res.status(404).json({ message: "Chauffeur not found." });
    }

    if (chauffeur.firebaseUID !== undefined) { // Update Firebase Realtime Database
      const firebaseRef = realtimeDB.ref("Drivers/" + chauffeur.firebaseUID);
      await firebaseRef.update({
        ...(photoAvatarUrl && { imageUrl: photoAvatarUrl }),
        ...(body.Prenom && { name: body.Prenom }),
        ...(body.email && { email: body.email }),
        ...(body.phone && { phone: body.phone }),
        ...(body.cnicNo && { cnicNo: body.cnicNo }),
      });
    }



    // Update Chauffeur in MongoDB
    await Chauffeur.findByIdAndUpdate(id, { $set: updateData });

    // Respond success
    res.json({
      message: "Chauffeur updated successfully!",
    });
  } catch (error) {
    console.error("Error updating Chauffeur:", error);
    res.status(500).json({
      message: "Error updating Chauffeur.",
      error: error.message,
    });
  }
};



const updatefotoapplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { uploadedFiles } = req;

    // Vérifier si l'ID du chauffeur est fourni
    if (!id) {
      return res.status(400).json({ message: "Chauffeur ID is required." });
    }

    // Extraire l'URL de l'image si disponible
    const photoAvatarUrl = uploadedFiles?.photoAvatar || undefined;

    // Vérifier s'il y a des données à mettre à jour
    const updateData = {};
    if (photoAvatarUrl) updateData.photoAvatar = photoAvatarUrl;

    
    console.log("Update Data:", updateData);

    // Rechercher le chauffeur par firebaseUID
    const chauffeur = await Chauffeur.findOne({ firebaseUID: id });
    if (!chauffeur) {
      return res.status(404).json({ message: "Chauffeur not found." });
    }

    // Mise à jour de Firebase Realtime Database si l'UID existe
    try {
      const firebaseRef = realtimeDB.ref("Drivers/" + id);
      await firebaseRef.update({ imageUrl: photoAvatarUrl });
    } catch (firebaseError) {
      console.error("Error updating Firebase:", firebaseError.message);
    }

    // Mettre à jour le chauffeur dans MongoDB
    await Chauffeur.findOneAndUpdate({ firebaseUID: id }, { $set: updateData });

    // Répondre avec succès
    res.json({
      message: "Chauffeur updated successfully!",
    });
  } catch (error) {
    console.error("Error updating Chauffeur:", error);
    res.status(500).json({
      message: "Error updating Chauffeur.",
      error: error.message,
    });
  }
};



const transporter = nodemailer.createTransport({
  service: "gmail", // Remplacez par votre service de messagerie
  auth: {
    user: "noreplyflashdriver@gmail.com", // Replace with your email
    pass: "uvfu llrf qsbw esok",
  },
});

const updateFacture = async (id) => {
  try {
    const factureUpdated = await Facture.findByIdAndUpdate(
      id,
      {
        $set: {
          isPaid: true,            // Mark as paid
          status: "PAYE",          // Update status to "PAYE"
          updatedAt: new Date()    // Update the 'updatedAt' timestamp
        },
      },
      { new: true } // Return the updated document
    ).populate("chauffeur");

    if (!factureUpdated) {
      console.error("Facture non trouvée:", id);
      throw new Error("Facture not found!");
    }

    return factureUpdated;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la facture:", error);
    throw error;
  }
};


const sendEmail = async (facture, pdfPath) => {
  try {
    const chauffeur = facture.chauffeur;
    const nomComplet = `${chauffeur.Nom} ${chauffeur.Prenom}`;
    const mois = facture.Month;

    const mailOptions = {
      from: "noreplyflashdriver@gmail.com",
      to: chauffeur.email,
      subject: "Votre Facture de Paiement",
      text: `Bonjour ${nomComplet},\n\nVeuillez trouver ci-joint votre facture pour le mois ${mois}.\n\nCordialement,\nVotre équipe`,
      attachments: [
        {
          filename: `facture_${facture.id}.pdf`,
          path: pdfPath,
          contentType: "application/pdf",
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log("Email envoyé avec succès!");

    // Supprimer le fichier PDF après envoi de l'email
    fs.unlink(pdfPath, (unlinkErr) => {
      if (unlinkErr) {
        console.error(
          "Erreur lors de la suppression du fichier PDF:",
          unlinkErr
        );
      } else {
        console.log("Fichier PDF supprimé après envoi de l'email:", pdfPath);
      }
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    throw error;
  }
};

const updateFact = async (req, res, next) => {
  const { id } = req.params;
  try {
    const factureUpdated = await updateFacture(id);
    if (!factureUpdated) {
      return res.status(404).send({ message: "Facture not found!" });
    }

    const pdfPath = await generatePdf(factureUpdated);
    if (!pdfPath) {
      return res.status(500).send({ error: "Failed to generate PDF" });
    }

    await sendEmail(factureUpdated, pdfPath);
    res.status(200).send({
      message:
        "Facture mise à jour, PDF généré et envoyé par e-mail avec succès!",
    });
  } catch (error) {
    console.error("Erreur:", error);
    return res.status(500).send({ error: error.message });
  }
};
const sendActivatedEmail = async (Email, Nom, password) => {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'testrapide45@gmail.com',
      pass: 'vtvtceruhzparthg'
    }
  });

  transporter.verify(function (error, success) {
    if (error) {
      console.log(error);
      console.log("Server not ready");
    } else {
      console.log("Server is ready to take our messages");
    }
  });

  const mailOptions = {
    from: 'Flash Driver<testrapide45@gmail.com>',
    to: Email,
    subject: 'Flash Driver Compte Activé',
    text: `
    email: ${Email}
    mot de passe: ${password}
    `
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
};

const updatestatus = async (req, res, next) => {
  const { id } = req.params;

  try {
    // Generate a new password and hash it using bcrypt
    const newpassword = Math.random().toString(36).slice(-8); // Generates a random 8-character password
    const hashedPassword = await bcrypt.hash(newpassword, 10);

    // Update the chauffeur's status and password
    const chauffeurUpdated = await Chauffeur.findByIdAndUpdate(id, {
      $set: {
        isActive: false,
        Cstatus: "Désactivé",
        password: hashedPassword
      },
    }, { new: true });

    // Check if the chauffeur was found and updated
    if (!chauffeurUpdated) {
      return res.status(404).send({
        message: "Chauffeur not found!",
      });
    }

    const chauffeurEmail = chauffeurUpdated.email;
    // sendActivatedEmail(chauffeurEmail, chauffeurUpdated.Nom, newpassword);

    try {
      // Attempt to fetch the user record by email
      const userRecord = await admin.auth().getUserByEmail(chauffeurEmail);
      console.log("Existing user:", userRecord);

      // Delete the user record if it exists
      console.log(userRecord.uid);
      await admin.auth().updateUser(userRecord.uid, {
        disabled: true
      });

      // Update Realtime Database
      const firebaseRef = realtimeDB.ref("Drivers/" + chauffeurUpdated.firebaseUID);
      await firebaseRef.update({
        'Cstatus': false
      });

      const usersRef = realtimeDB.ref("Users");
      usersRef.child(id).set(
        {
          deleted: new Date()
        }
      )

      console.log("User deleted successfully");
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        // If the user is not found, continue without throwing an error
        console.log("No user record found for this email.");
      } else {
        // Handle other errors
        throw error;
      }
    }

    // Send a success response
    return res.status(200).send({
      message: "Chauffeur was Disabled and a new password was set successfully!",
    });
  } catch (error) {
    // Log the error and send a 500 response
    console.log("Error:", error);
    return res.status(500).send({ error: error.message });
  }
};

const Comptevald = async (req, res, next) => {
  const { id } = req.params;

  try {
    const chauffeurUpdated = await Chauffeur.findByIdAndUpdate(id, {
      $set: {
        isActive: true,
        Cstatus: "Validé",
      },
    });

    if (!chauffeurUpdated) {
      return res.status(404).send({
        message: "Chauffeur not found!",
      });
    }

    console.log(chauffeurUpdated);

    return res.status(200).send({
      message: "Chauffeur was updated successfully!",
    });
  } catch (error) {
    return res.status(500).send({ error: error });
  }
};

const chauffdes = async (req, res, data) => {
  Chauffeur.find({ isActive: false }, (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).send(err);
    }

    console.log(data);
    res.json(data);
  });
};

/**-----------Cherche sur un agent ------------- */

const searchuse = async (req, res) => {
  const id = req.params.id;
  Chauffeur.findById(id)
    .then((data) => {
      if (!data)
        res.status(404).send({ message: "Agent introuvable pour id " + id });
      else res.send(data);
      console.log(data);
    })
    .catch((err) => {
      res
        .status(500)
        .send({ message: "Erreur recuperation Agent avec id=" + id });
    });
};

const recupereruse = async (req, res) => {
  try {
    const data = await Chauffeur.find({
      Cstatus: { $in: ["Validé", "En_cours"] },
    });

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred");
  }
};

const mongoose = require("mongoose");
const FactureView = mongoose.model(
  "FactureView",
  new mongoose.Schema({}, { collection: "factures", strict: false })
);

// Get Facture
const recuperFact = async (req, res) => {
  FactureView.find() // Utilisation du modèle FactureView
    .then((invoices) => res.json(invoices))
    .catch((err) => res.status(400).json({ error: err.message }));
};

// const recupereruse = async(req,res,data) =>{

//   Chauffeur.find({ isActive: true },(err, data)=>{

//       res.json(data);
//       console.log(data)

//   });
// }

const recuperernewchauf = async (req, res, data) => {
  Chauffeur.find({ Cstatus: "En_cours" }, (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("An error occurred");
    } else {
      res.json(data);
      console.log(data);
    }
  });
};

/**----------------------Supprimer un agent------------------- */

const destroy = async (req, res) => {
  const id = req.params.id;
  Chauffeur.findByIdAndRemove(id)
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Impossible de supprimer Agent avec id=${id}. velo est possiblement introuvable!`,
        });
      } else {
        res.send({
          message: "Agent supprimée avec succès!",
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Impossible de supprimer Agent avec id=" + id,
      });
    });
};
const reactivateChauffeur = async (req, res) => {
  const { id } = req.params; // ID du chauffeur à réactiver

  try {
    // Étape 1 : Récupérer le chauffeur dans MongoDB
    const chauffeur = await Chauffeur.findById(id);

    if (!chauffeur) {
      return res.status(404).send({ message: "Chauffeur not found!" });
    }

    if (!chauffeur.firebaseUID) {
      return res.status(400).send({
        message: "Chauffeur does not have a Firebase UID.",
      });
    }

    // Étape 2 : Activer le compte dans Firebase Authentication
    try {
      // Reactivate Firebase user account
      await admin.auth().updateUser(chauffeur.firebaseUID, { disabled: false });
      console.log("Firebase account reactivated for UID:", chauffeur.firebaseUID);

      // Update Realtime Database
      const firebaseRef = realtimeDB.ref("Drivers/" + chauffeur.firebaseUID);
      await firebaseRef.update({
        'Cstatus': true
      });


    } catch (firebaseError) {
      console.error("Error reactivating Firebase user:", firebaseError);
      return res.status(500).send({
        message: "Error reactivating Firebase account.",
      });
    }

    // Étape 3 : Mettre à jour le statut dans MongoDB
    const updatedChauffeur = await Chauffeur.findByIdAndUpdate(
      id,
      {
        $set: {
          isActive: true,
          Cstatus: "Validé",
        },
      },
      { new: true }
    );

    if (!updatedChauffeur) {
      return res.status(500).send({
        message: "Failed to update chauffeur in MongoDB.",
      });
    }

    console.log("Chauffeur reactivated and updated in MongoDB.");

    // Répondre avec succès
    return res.status(200).send({
      message: "Chauffeur reactivated successfully!",
      chauffeur: updatedChauffeur,
    });
  } catch (error) {
    console.error("Error reactivating chauffeur:", error);
    return res.status(500).send({
      message: "An error occurred while reactivating the chauffeur.",
    });
  }
};

const updatestatuss = async (req, res, next) => {
  const { id } = req.params;

  try {
    // 1. Mettre à jour le chauffeur avec isActive et Cstatus
    const chauffeurUpdated = await Chauffeur.findByIdAndUpdate(
      id,
      {
        $set: {
          isActive: true,
          Cstatus: "Validé",
        },
      },
      { new: true }
    );

    if (!chauffeurUpdated) {
      return res.status(404).send({
        message: "Chauffeur not found!",
      });
    }

    // 2. Générer un mot de passe temporaire
    const chauffeurEmail = chauffeurUpdated.email;
    const chauffeurPassword = Math.random().toString(36).slice(-6);
    console.log("Generated password:", chauffeurPassword);

    // 3. Récupérer les informations de voiture associées
    const car = await Car.findOne({ chauffeur: chauffeurUpdated.id }).catch((error) => {
      console.error(`Error finding car by chauffeur ID: ${chauffeurUpdated.id}`, error);
      throw new Error("Error finding car by chauffeur ID");
    });

    // 4. Vérifier si l'utilisateur Firebase existe déjà
    let firebaseUser;
    try {
      // Essayer de trouver un utilisateur existant par email
      firebaseUser = await admin.auth().getUserByEmail(chauffeurEmail);
      console.log("Existing Firebase user found:", firebaseUser);
      const messagesms = "Flash Driver : Votre compte a été validé avec succès. Voici votre mot de passe : " + chauffeurPassword;
      // Si l'utilisateur existe, envoyer un email avec le mot de passe existant
      try {
         await admin.auth().updateUser(firebaseUser.uid, {
        password: chauffeurPassword,
      });
        await sendConfirmationEmail(chauffeurEmail, chauffeurPassword);

        await sendSMSDirect(chauffeurPassword, chauffeurUpdated.phone);
        await sendwhatsup(chauffeurPassword, chauffeurUpdated.phone);

        // Mettre à jour les données dans Realtime Database
        const activeDriver = {
          name: chauffeurUpdated.Nom,
          DateNaissance: "",
          address: chauffeurUpdated.address,
          cnicNo: chauffeurUpdated.cnicNo,
          gender: chauffeurUpdated.gender,
          postalCode: "",
          email: chauffeurUpdated.email,
          imageUrl: chauffeurUpdated.photoAvatar,
          phone: chauffeurUpdated.phone,
          Cstatus: true,
          carDetails: car
            ? {
              immatriculation: car.immatriculation,
              modelle: car.modelle,
            }
            : null,
        };

        const driversRef = realtimeDB.ref("Drivers");
        await driversRef.child(firebaseUser.uid).set(activeDriver);

        // Mettre à jour le chauffeur avec le firebaseUID existant
        await Chauffeur.findByIdAndUpdate(
          id,
          {
            $set: {
              firebaseUID: firebaseUser.uid,
            },
          },
          { new: true, strict: false }
        );

        return res.status(200).send({
          message: "Chauffeur already exists. Email sent and database updated successfully!",
          chauffeurEmail,
        });

      } catch (emailError) {
        console.error("Error sending email:", emailError);
        return res.status(200).send({
          message: "Chauffeur exists, but email could not be sent.",
        });
      }

    } catch (notFoundError) {
      // Si l'utilisateur n'existe pas, créer un nouvel utilisateur Firebase
      try {
        firebaseUser = await admin.auth().createUser({
          email: chauffeurEmail,
          password: chauffeurPassword,
        });
        console.log("New Firebase user created:", firebaseUser);

        // Mise à jour du chauffeur avec nouveau firebaseUID
        const updatedChauffeurs = await Chauffeur.findByIdAndUpdate(
          id,
          {
            $set: {
              firebaseUID: firebaseUser.uid,
            },
          },
          { new: true, strict: false }
        );

        if (!updatedChauffeurs) {
          return res.status(500).json({ message: "Failed to update chauffeur with firebaseUID." });
        }

        // Ajouter les données dans Firebase Realtime Database
        const activeDriver = {
          name: chauffeurUpdated.Nom,
          DateNaissance: "",
          address: chauffeurUpdated.address,
          cnicNo: chauffeurUpdated.cnicNo,
          gender: chauffeurUpdated.gender,
          postalCode: "",
          email: chauffeurUpdated.email,
          imageUrl: chauffeurUpdated.photoAvatar,
          phone: chauffeurUpdated.phone,
          Cstatus: true,
          carDetails: car
            ? {
              immatriculation: car.immatriculation,
              modelle: car.modelle,
            }
            : null,
        };

        const driversRef = realtimeDB.ref("Drivers");
        await driversRef.child(firebaseUser.uid).set(activeDriver);


        // Envoyer un email de confirmation
        try {
          await sendConfirmationEmail(chauffeurEmail, chauffeurPassword);
          await sendSMSDirect(chauffeurPassword, chauffeurUpdated.phone);
          await sendwhatsup(chauffeurPassword, chauffeurUpdated.phone);
          return res.status(200).send({
            message: "Chauffeur enabled and email sent successfully!",
            chauffeurEmail,
          });
        } catch (emailError) {
          console.error("Error sending email:", emailError);
          return res.status(200).send({
            message: "Chauffeur enabled, but email could not be sent.",
          });
        }

      } catch (firebaseError) {
        console.error("Error creating Firebase user:", firebaseError);
        return res.status(500).send({
          message: "Error creating Firebase user",
        });
      }
    }
  } catch (error) {
    console.error("General error:", error);
    return res.status(500).send({
      message: "An error occurred while updating the chauffeur.",
    });
  }
};






async function sendConfirmationEmail(Email, chauffeurPassword) {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "noreplyflashdriver@gmail.com", // Replace with your email
      pass: "uvfu llrf qsbw esok", // Replace with your email password
    },
  });

  transporter.verify(function (error, success) {
    if (error) {
      console.log(error);
      console.log("Server not ready");
    } else {
      console.log("Server is ready to take our messages");
    }
  });

  const mailOptions = {
    from: "Flash Driver <noreplyflashdriver@gmail.com>",
    to: Email,
    subject: "Flash Driver Compte Validé",
    html: `


<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Validation de Compte Flash Driver</title>
    <style>
        body {
            font-family: 'Poppins', Arial, sans-serif;
            line-height: 1.6;
            color: #5D541D;
            max-width: 600px;
            margin: 0 auto;
        }
        .container {
            background-color: #FAD939;
            border-radius: 20px;
            padding: 20px;
            text-align: center;
        }
        .content {
            background-color: #FFFFFF;
            border-radius: 10px;
            padding: 30px;
            margin-top: 20px;
        }
        .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #5D541D;
        }
        .store-buttons {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-top: 20px;
        }
        .store-button {
            background-color: #007bff;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            text-decoration: none;
            font-weight: bold;
        }
        .store-button:hover {
            background-color: #0056b3;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="content">
            <h1>Votre compte vient d'être validé</h1>
            <p>Votre compte a été validé avec succès. Vous pouvez dès à présent vous connecter pour commencer à gérer vos courses.</p>
            <p><strong>Email:</strong> ${Email}</p>
            ${chauffeurPassword ? `<p><strong>Mot de passe:</strong> ${chauffeurPassword}</p>` : ""}
            
            <h2>Téléchargez notre application IOS</h2>
            <div class="store-buttons">
                <a href="https://apps.apple.com/app/flashdriver-driver/id6737279801" class="store-button" target="_blank" rel="noopener noreferrer">
                    App Store
                </a>
                
            </div>
            
            <h2>Téléchargez notre application Android</h2>
            <div class="store-buttons">
                <a href="https://play.google.com/store/apps/details?id=com.flashdriversdriver.app" class="store-button" target="_blank" rel="noopener noreferrer">
                    Google Play
                </a>
            </div>
            <div class="footer">
                <p>Cordialement,<br>L'équipe Flash Driver</p>
                <p style="font-size: 10px; color: #888;">
                    Si vous n'avez pas créé ce compte, veuillez nous contacter.
                </p>
            </div>
        </div>
    </div>
</body>
</html>`,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        reject(error);
      } else {
        console.log("Email sent: " + info.response);
        resolve(info.response);
      }
    });
  });
}



// Fonction pour envoyer un SMS
async function sendSMSDirect(motdepasse, numtel) {
  // Suppression du "+" dans le numéro de téléphone
  const formattedNumTel = numtel.replace(/\+/g, "");

  // URL construite avec le numéro de téléphone formaté
  const url = "https://www.winsmspro.com/sms/sms/api?action=send-sms&api_key=DP36cCxU7I5o7YYka2zmRelWZDm86XuG5AAqU5Vj5Ob1MLnfyTDYQILEumw6&to="
    + formattedNumTel
    + "&sms=Votre%20compte%20a%20été%20validé%20avec%20succès,%20Vous%20pouvez%20dès%20à%20présent%20vous%20connecter%20pour%20commencer%20à%20gérer%20vos%20courses.%20Votre%20code%20est%20"
    + motdepasse
    + "&from=FLashDriver";


  https.get(url, (res) => {
    console.log(`Statut de l'envoi SMS : ${res.statusCode}`);

    res.on("data", (d) => {
      process.stdout.write(d); // Affiche la réponse du serveur
    });
  }).on("error", (e) => {
    console.error(`Erreur lors de l'envoi du SMS : ${e.message}`);
  });
}

async function sendwhatsup(motdepasse, numtel) { 
  const formattedNumTel = numtel.replace(/\D/g, ""); // Supprime tout sauf les chiffres

  const req = {
    body: {
      phone: formattedNumTel,
      message: `Votre compte a été validé avec succès. 
      Vous pouvez dès à présent vous connecter pour commencer à gérer vos courses. 
      Votre code est : ${motdepasse}`
    }
  };

  const res = {
    json: (response) => console.log("✅ Réponse :", response),
    status: (code) => ({
      json: (response) => console.log(`❌ Erreur ${code} :`, response)
    })
  };

  await whatsappController.sendMessage(req, res);
}

module.exports = {

  register,
  login,
  recupereruse,
  destroy,
  searchuse,
  update,
  updatestatus,
  chauffdes,
  updatestatuss,
  reactivateChauffeur,
  Comptevald,
  recuperernewchauf,
  getFacturesByChauffeurId,
  recuperFact,
  searchFacture,
  updateFact,
  sendFactureEmail,
  getRideCounts,
  updateF,
  rejectChauffeur,
  sendmessagingnotification,
  sendmessagingnotificationclient,
  sendNotificationMiseajour,
  updatemotdepasse,
  updatefotoapplication

};
