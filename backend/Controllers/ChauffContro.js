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
      chauffeurId:id
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

    nouveauUtilisateur.username = `${
      Nom[Math.floor(Math.random() * Nom.length)]
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
      `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" style="font-family:arial, 'helvetica neue', helvetica, sans-serif">
<head>
  <meta charset="UTF-8">
  <meta content="width=device-width, initial-scale=1" name="viewport">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta content="telephone=no" name="format-detection">
  <title>Account Activation</title>
  <link href="https://fonts.googleapis.com/css2?family=Josefin+Sans&display=swap" rel="stylesheet">
  <style type="text/css">
    #outlook a { padding:0; }
    .es-button { text-decoration:none!important; }
    a[x-apple-data-detectors] { color:inherit!important; text-decoration:none!important; font-size:inherit!important; font-family:inherit!important; font-weight:inherit!important; line-height:inherit!important; }
    @media only screen and (max-width:600px) {
      p, ul li, ol li, a { line-height:150%!important }
      h1, h2, h3, h1 a, h2 a, h3 a { line-height:120% }
      h1 { font-size:30px!important; text-align:center }
      h2 { font-size:24px!important; text-align:left }
      h3 { font-size:20px!important; text-align:left }
      .es-header-body h1 a, .es-content-body h1 a, .es-footer-body h1 a { font-size:30px!important; text-align:center }
      .es-menu td a { font-size:14px!important }
      .es-content-body p, .es-footer-body p, .es-header-body p { font-size:14px!important }
      .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3 { text-align:center!important }
      .es-adapt-td { display:block!important; width:100%!important }
      .adapt-img { width:100%!important; height:auto!important }
    }
  </style>
</head>
<body style="width:100%;font-family:arial, 'helvetica neue', helvetica, sans-serif;padding:0;Margin:0;background-color:#D2A805">
  <div class="es-wrapper-color" style="background-color:#D2A805">
    <table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" style="padding:0;Margin:0;width:100%;height:100%;background-color:#D2A805">
      <tr>
        <td valign="top" style="padding:0;Margin:0">
          <table class="es-header" align="center" style="width:100%;background-color:transparent;">
            <tr>
              <td align="center" style="padding:0;Margin:0">
                <table bgcolor="#ffffff" class="es-header-body" align="center" cellpadding="0" cellspacing="0" style="background-color:#FFFFFF;width:600px">
                  <tr>
                    <td align="left" style="padding:20px;Margin:0">
                      <table cellpadding="0" cellspacing="0" align="left" style="float:left">
                        <tr>
                          <td valign="top" align="center" style="width:241px">
                            <a href="https://viewstripo.email" target="_blank" style="text-decoration:none;color:#3B8026">
                              <img src="https://firebasestorage.googleapis.com/v0/b/prd-transport.appspot.com/o/logoc.png?alt=media&token=6a225136-94c5-407b-8501-c233e9aa721f" alt="Logo" title="Logo" width="193" height="127" style="display:block;border:0;outline:none;text-decoration:none">
                            </a>
                          </td>
                        </tr>
                      </table>
                      <table cellpadding="0" cellspacing="0" align="right" style="float:right">
                        <tr>
                          <td align="left" style="width:299px">
                            <table cellpadding="0" cellspacing="0" width="100%" role="presentation">
                              <tr class="links-images-right">
                                <td align="center" valign="top" style="padding-top:10px;padding-bottom:0;border:0">
                                  <a href="" target="_blank" style="display:block;color:#0b5394;font-size:18px">Commandez un taxi en un clic depuis votre mobile</a>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          <table class="es-content" cellspacing="0" cellpadding="0" align="center" style="width:100%">
            <tr>
              <td align="center" style="padding:0;Margin:0">
                <table class="es-content-body" style="background-color:#ffffff;width:600px" cellspacing="0" cellpadding="0" align="center">
                  <tr>
                    <td align="left" style="padding:40px;Margin:0">
                      <table cellpadding="0" cellspacing="0" width="100%" role="presentation">
                        <tr>
                          <td align="center" valign="top" style="width:520px">
                            <table cellpadding="0" cellspacing="0" width="100%" bgcolor="#fef852" style="background-color:#fef852;border-radius:20px">
                              <tr>
                                <td align="center" style="padding:30px 20px 10px">
                                  <h1 style="font-family:'Josefin Sans', helvetica, arial, sans-serif;font-size:40px;color:#2D033A">Merci<br>pour nous choisir</h1>
                                </td>
                              </tr>
                              <tr>
                                <td align="center" style="padding-bottom:30px">
                                  <p style="font-family:'Josefin Sans', helvetica, arial, sans-serif;font-size:16px;color:#38363A">Votre compte a été activé avec succès.</p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td align="left" style="padding:0 40px 40px">
                      <table cellpadding="0" cellspacing="0" width="100%" role="presentation">
                        <tr>
                          <td align="left" style="padding-top:5px;padding-bottom:5px">
                            <h3 style="font-family:'Josefin Sans', helvetica, arial, sans-serif;font-size:20px;color:#2D033A">Cher(e) ` + Email + `,</h3>
                            <p style="font-family:'Josefin Sans', helvetica, arial, sans-serif;font-size:14px;color:#38363A">Nous sommes ravis de vous accueillir sur Flash Driver ! Votre compte a été créé avec succès. Vous pouvez désormais profiter de tous nos services.</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
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

/**----------Update Agent----------------- */
const update = (req, res, next) => {
  const { id } = req.params;
  const photoAvatarUrl = req.uploadedFiles.photoAvatar;
  const photoPermisRecUrl = req.uploadedFiles.photoPermisRec;
  const photoPermisVerUrl = req.uploadedFiles.photoPermisVer;
  const photoVtcUrl = req.uploadedFiles.photoVtc;
  const photoCinUrl = req.uploadedFiles.photoCin;
  let updateData = {
    Nom: req.body.Nom,
    Prenom: req.body.Prenom,
    email: req.body.email,
    phone: req.body.phone,
    photoAvatar: photoAvatarUrl,
    photoCin: photoCinUrl,
    photoPermisRec: photoPermisRecUrl,
    photoPermisVer: photoPermisVerUrl,
    photoVtc: photoVtcUrl,
    gender: req.body.gender,
    role: req.body.role,
    Nationalite: req.body.Nationalite,
    DateNaissance: req.body.DateNaissance,
    cnicNo: req.body.cnicNo,
    address: req.body.address,
    postalCode: req.body.postalCode,
  };
  console.log(updateData);

  Chauffeur.findByIdAndUpdate(id, { $set: updateData })
    .then(() => {
      res.json({
        message: " Chauffeur  update with succes !",
      });
    })
    .catch((error) => {
      res.json({
        message: "error with updtaing Chauffeur !",
      });
    });
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

const updatestatuss = async (req, res, next) => {
  const { id } = req.params;

  try {
    // Mise à jour du chauffeur avec isActive et Cstatus
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

    const chauffeurEmail = chauffeurUpdated.email;
    const chauffeurPassword = Math.random().toString(36).slice(-6);

    console.log("Generated password:", chauffeurPassword);

    // Récupérer les informations de voiture associées
    let car;
    try {
      car = await Car.findOne({ chauffeur: chauffeurUpdated.id });
    } catch (error) {
      console.error(`Error finding car by chauffeur ID: ${chauffeurUpdated.id}`, error);
      return res.status(500).send({
        message: "Error finding car by chauffeur ID",
      });
    }

    // Gestion Firebase
    let firebaseUser;
    try {
      try {
        // Vérification si l'utilisateur existe déjà
        const userRecord = await admin.auth().getUserByEmail(chauffeurEmail);
        console.log("Existing Firebase user:", userRecord);

        // Mise à jour de l'utilisateur
        await admin.auth().updateUser(userRecord.uid, {
          email: chauffeurEmail,
          disabled: false,
        });

        firebaseUser = userRecord;
      } catch (getUserError) {
        console.warn("User does not exist, creating a new one.");

        // Création d'un nouvel utilisateur Firebase
        firebaseUser = await admin.auth().createUser({
          email: chauffeurEmail,
          password: chauffeurPassword,
        });

        console.log("New Firebase user created:", firebaseUser);
      }

      // Ajouter/mettre à jour les données dans Firebase Realtime Database
      const activeDriver = {
        name: chauffeurUpdated.Nom,
        DateNaissance: chauffeurUpdated.DateNaissance,
        address: chauffeurUpdated.address,
        cnicNo: chauffeurUpdated.cnicNo,
        gender: chauffeurUpdated.gender,
        postalCode: chauffeurUpdated.postalCode,
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

      console.log("Chauffeur successfully added to Firebase Database.");

      // Envoi de l'email de confirmation
      try {
        await sendConfirmationEmail(chauffeurEmail, chauffeurPassword);
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
      console.error("Error managing Firebase user:", firebaseError);
      return res.status(500).send({
        message: "Error managing Firebase user",
      });
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
      pass: "uvfu llrf qsbw esok",
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
    subject: "Flash Driver Compte Validé ",
  html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" style="font-family:arial, 'helvetica neue', helvetica, sans-serif">
        <head>
        <meta charset="UTF-8">
        <meta content="width=device-width, initial-scale=1" name="viewport">
        <meta name="x-apple-disable-message-reformatting">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta content="telephone=no" name="format-detection">
        <title>Nouveau message 3</title><!--[if (mso 16)]>
        <style type="text/css">
        a {text-decoration: none;}
        </style>
        <![endif]--><!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--><!--[if gte mso 9]>
        <xml>
        <o:OfficeDocumentSettings>
        <o:AllowPNG></o:AllowPNG>
        <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
        </xml>
        <![endif]--><!--[if !mso]><!-- -->
        <link href="https://fonts.googleapis.com/css2?family=Poppins&display=swap" rel="stylesheet"><!--<![endif]-->
        <style type="text/css">
        #outlook a {
        padding:0;
        }
        .es-button {
        mso-style-priority:100!important;
        text-decoration:none!important;
        }
        a[x-apple-data-detectors] {
        color:inherit!important;
        text-decoration:none!important;
        font-size:inherit!important;
        font-family:inherit!important;
        font-weight:inherit!important;
        line-height:inherit!important;
        }
        .es-desk-hidden {
        display:none;
        float:left;
        overflow:hidden;
        width:0;
        max-height:0;
        line-height:0;
        mso-hide:all;
        }
        @media only screen and (max-width:600px) {p, ul li, ol li, a { line-height:150%!important } h1, h2, h3, h1 a, h2 a, h3 a { line-height:120% } h1 { font-size:30px!important; text-align:center!important } h2 { font-size:24px!important; text-align:center!important } h3 { font-size:20px!important; text-align:center!important } .es-header-body h1 a, .es-content-body h1 a, .es-footer-body h1 a { font-size:30px!important; text-align:center!important } .es-header-body h2 a, .es-content-body h2 a, .es-footer-body h2 a { font-size:24px!important; text-align:center!important } .es-header-body h3 a, .es-content-body h3 a, .es-footer-body h3 a { font-size:20px!important; text-align:center!important } .es-menu td a { font-size:14px!important } .es-header-body p, .es-header-body ul li, .es-header-body ol li, .es-header-body a { font-size:14px!important } .es-content-body p, .es-content-body ul li, .es-content-body ol li, .es-content-body a { font-size:14px!important } .es-footer-body p, .es-footer-body ul li, .es-footer-body ol li, .es-footer-body a { font-size:14px!important } .es-infoblock p, .es-infoblock ul li, .es-infoblock ol li, .es-infoblock a { font-size:12px!important } *[class="gmail-fix"] { display:none!important } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3 { text-align:center!important } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3 { text-align:right!important } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3 { text-align:left!important } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } .es-button-border { display:inline-block!important } a.es-button, button.es-button { font-size:18px!important; display:inline-block!important } .es-adaptive table, .es-left, .es-right { width:100%!important } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important } .es-adapt-td { display:block!important; width:100%!important } .adapt-img { width:100%!important; height:auto!important } .es-m-p0 { padding:0px!important } .es-m-p0r { padding-right:0px!important } .es-m-p0l { padding-left:0px!important } .es-m-p0t { padding-top:0px!important } .es-m-p0b { padding-bottom:0!important } .es-m-p20b { padding-bottom:20px!important } .es-mobile-hidden, .es-hidden { display:none!important } tr.es-desk-hidden, td.es-desk-hidden, table.es-desk-hidden { width:auto!important; overflow:visible!important; float:none!important; max-height:inherit!important; line-height:inherit!important } tr.es-desk-hidden { display:table-row!important } table.es-desk-hidden { display:table!important } td.es-desk-menu-hidden { display:table-cell!important } .es-menu td { width:1%!important } table.es-table-not-adapt, .esd-block-html table { width:auto!important } table.es-social { display:inline-block!important } table.es-social td { display:inline-block!important } .es-desk-hidden { display:table-row!important; width:auto!important; overflow:visible!important; max-height:inherit!important } }
        </style>
        </head>
        <body style="width:100%;font-family:arial, 'helvetica neue', helvetica, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0">
        <div class="es-wrapper-color" style="background-color:#FFFFFF"><!--[if gte mso 9]>
        <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
        <v:fill type="tile" color="#ffffff"></v:fill>
        </v:background>
        <![endif]-->
        <table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#FFFFFF">
        <tr>
        <td valign="top" style="padding:0;Margin:0">
        <table cellpadding="0" cellspacing="0" class="es-header" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top">
        <tr>
        <td align="center" style="padding:0;Margin:0">
        <table bgcolor="#fad939" class="es-header-body" align="center" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:510px">
        <tr>
        <td align="left" style="padding:0;Margin:0;padding-left:20px;padding-right:20px">
        <table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
        <tr>
        <td align="center" valign="top" style="padding:0;Margin:0;width:470px">
        <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
        <tr>
        <td align="center" height="40" style="padding:0;Margin:0"></td>
        </tr>
        </table></td>
        </tr>
        </table></td>
        </tr>
        </table></td>
        </tr>
        </table>
        <table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
        <tr>
        <td align="center" style="padding:0;Margin:0">
        <table class="es-content-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:510px" cellspacing="0" cellpadding="0" align="center" bgcolor="#FAD939">
        <tr>
        <td align="left" style="padding:0;Margin:0">
        <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
        <tr>
        <td class="es-m-p0r" valign="top" align="center" style="padding:0;Margin:0;width:510px">
        <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
        <tr>
        <td align="center" style="padding:0;Margin:0;position:relative"><img class="adapt-img" src="https://firebasestorage.googleapis.com/v0/b/prd-transport.appspot.com/o/image16934700588243507%20(1).png?alt=media&token=d1f81748-0b47-48fd-a2fd-72c73ea094c8" alt title width="100%" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"></td>
        </tr>
        </table></td>
        </tr>
        </table></td>
        </tr>
        </table></td>
        </tr>
        </table>
        <table cellpadding="0" cellspacing="0" class="es-content" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
        <tr>
        <td align="center" style="padding:0;Margin:0">
        <table bgcolor="#ffffff" class="es-content-body" align="center" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FAD939;border-radius:0 0 50px 50px;width:510px">
        <tr>
        <td align="left" style="padding:0;Margin:0;padding-left:20px;padding-right:20px">
        <table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
        <tr>
        <td align="center" valign="top" style="padding:0;Margin:0;width:470px">
        <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
        <tr>
        <td align="center" style="padding:0;Margin:0"><h1 style="Margin:0;line-height:46px;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;font-size:38px;font-style:normal;font-weight:bold;color:#5d541d">Votre compte vient d'être validé !</h1></td>
        </tr>
        <tr>
        <td align="center" style="padding:0;Margin:0;padding-top:40px;padding-bottom:40px"><h3 style="Margin:0;line-height:24px;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;font-size:20px;font-style:normal;font-weight:bold;color:#5D541D"><br></h3><h3 style="Margin:0;line-height:24px;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;font-size:20px;font-style:normal;font-weight:bold;color:#5D541D"><br></h3><h3 style="Margin:0;line-height:24px;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;font-size:20px;font-style:normal;font-weight:bold;color:#5D541D">Merci de nous avoir rejoint.</h3><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;line-height:27px;color:#5D541D;font-size:18px"><br></p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;line-height:27px;color:#5D541D;font-size:18px"><br></p></td>
        </tr>
        <tr>
        ${
          chauffeurPassword === "" ? "" : `
        <td align="center" style="padding:0;Margin:0;padding-top:40px;padding-bottom:40px"><h3 style="Margin:0;line-height:24px;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;font-size:20px;font-style:normal;font-weight:bold;color:#5D541D"><br></h3><h3 style="Margin:0;line-height:24px;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;font-size:20px;font-style:normal;font-weight:bold;color:#5D541D"><br></h3><h3 style="Margin:0;line-height:24px;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;font-size:20px;font-style:normal;font-weight:bold;color:#5D541D">votre mot de passe: ${chauffeurPassword}</h3><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;line-height:27px;color:#5D541D;font-size:18px"><br></p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;line-height:27px;color:#5D541D;font-size:18px"><br></p></td>
          
          `
        }

        </tr>
        </table></td>
        </tr>
        </table></td>
        </tr>
        <tr>
        <td align="left" style="Margin:0;padding-top:20px;padding-left:20px;padding-right:20px;padding-bottom:40px">
        <table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
        <tr>
        <td align="left" style="padding:0;Margin:0;width:470px">
        <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
        <tr>
        <td align="center" style="padding:0;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;line-height:21px;color:#5D541D;font-size:14px">Merci,<br>Flash Driver Team!&nbsp;</p></td>
        </tr>
        </table></td>
        </tr>
        </table></td>
        </tr>
        </table></td>
        </tr>
        </table></td>
        </tr>
        </table>
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
};
