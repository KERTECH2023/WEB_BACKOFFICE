const Chauffeur = require("../Models/Chauffeurfrance");
const bcrypt = require("bcryptjs");
const config = require("../config.json");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
//const firebaseModule = require("../services/config");
//const realtimeDB = firebaseModule.firestoreApp.database();
/**--------------------Ajouter un agnet------------------------  */
const admin = require("firebase-admin");
const firestoreServiceAccount = require("../firebase-key.json");
// Add a new JSON key for Firestore

const checkChauffeur = async (req, res) => {
  const { email, phone: phoneNumber, cnicNo, phoneCode } = req.body;

  // Validation de l'entrée
  if (!phoneNumber || !phoneCode) {
    return res.status(400).json({
      message: "Le numéro de téléphone et le code de pays sont requis.",
    });
  }

  // Concaténer le code du pays avec le numéro de téléphone
  let phone = phoneCode + phoneNumber;

  console.log(phone); // Afficher le téléphone complet dans la console

  try {
    // Vérification du permis de conduire
    if (cnicNo) {
      const chauffeurByPermis = await Chauffeur.findOne({ cnicNo });
      if (chauffeurByPermis) {
        return res.status(200).json({
          exists: true,
          duplicateField: "permisNumber",
          message: "Ce numéro de permis existe déjà",
        });
      }
    }

    // Vérification de l'email
    if (email) {
      const chauffeurByEmail = await Chauffeur.findOne({ email });
      if (chauffeurByEmail) {
        return res.status(200).json({
          exists: true,
          duplicateField: "email",
          message: "Cet email existe déjà",
        });
      }
    }

    // Vérification du téléphone
    if (phone) {
      const chauffeurByPhone = await Chauffeur.findOne({ phone });
      if (chauffeurByPhone) {
        return res.status(200).json({
          exists: true,
          duplicateField: "phone",
          message: "Ce numéro de téléphone existe déjà",
        });
      }
    }

    // Si aucun champ n'est dupliqué
    return res.status(200).json({ exists: false, message: "Chauffeur non trouvé" });
  } catch (error) {
    console.error("Erreur lors de la vérification du chauffeur:", error);
    return res.status(500).json({ message: "Erreur du serveur" });
  }
};


const register = async (req, res) => {
    
  // Extract data from req.body
  const {
    Nom,
    Prenom,
    email,
    fullPhoneNumber,
    gender,
    cnicNo,
    immatriculation,
    modelle,
    address,
    typeChauffeur,
  } = req.body;

  // Extract uploaded file URLs from req.uploadedFiles
  const photoAvatarUrl = req.uploadedFiles.photoAvatar || "";
  
  const photoVtcUrl = req.uploadedFiles.photoVtc || "";
  const photoCinUrl = req.uploadedFiles.photoCin || "";
  const AssuranceProUrl = req.uploadedFiles.AssurancePro || "";
  const KbisUrl = req.uploadedFiles.Kbis || "";
  const RIBUrl = req.uploadedFiles.RIB || "";
  const AssuranceVoitureUrl = req.uploadedFiles.AssuranceVoiture || "";
  const CarteGriseUrl = req.uploadedFiles.CarteGrise || "";
  
  const verifUtilisateur = await Chauffeur.findOne({ email });
  if (verifUtilisateur) {
    res.status(403).send({ message: "Chauffeur existe deja!" });
  } else {
    // Create a new user object
    const nouveauUtilisateur = new Chauffeur();

    // Hash the phone number as the password
    const mdpEncrypted = bcrypt.hashSync(fullPhoneNumber.toString(), 10);

    // Generate a random username
    const nounIndex = Math.floor(Math.random() * Nom.length);
    const preIndex = Math.floor(Math.random() * Prenom.length);
    const randomNumber = Math.floor(Math.random() * 90000);

    nouveauUtilisateur.username = `${Nom[nounIndex]}${Prenom[preIndex]}${randomNumber}`;
    nouveauUtilisateur.Nom = Nom;
    nouveauUtilisateur.Prenom = Prenom;
    nouveauUtilisateur.email = email;
    nouveauUtilisateur.phone = fullPhoneNumber;
    nouveauUtilisateur.password = mdpEncrypted;
    nouveauUtilisateur.photoAvatar = photoAvatarUrl;
    nouveauUtilisateur.photoCin = photoCinUrl;
    nouveauUtilisateur.photoVtc = photoVtcUrl;
    nouveauUtilisateur.AssurancePro =AssuranceProUrl;
    nouveauUtilisateur.Kbis = KbisUrl;
    nouveauUtilisateur.RIB = RIBUrl;
    nouveauUtilisateur.AssuranceVoiture = AssuranceVoitureUrl;
    nouveauUtilisateur.CarteGrise = CarteGriseUrl;
    nouveauUtilisateur.immatriculation = immatriculation;
    nouveauUtilisateur.modelle = modelle;
    nouveauUtilisateur.gender = gender;
    nouveauUtilisateur.role = "Chauffeur";
    nouveauUtilisateur.Cstatus = "En_cours";
    nouveauUtilisateur.cnicNo = cnicNo;
    nouveauUtilisateur.address = address;
    nouveauUtilisateur.type = typeChauffeur;
    nouveauUtilisateur.isActive = true;

    console.log(nouveauUtilisateur);

    // Save the new user to the database
    try {
      await nouveauUtilisateur.save();
      /*const driversRef = realtimeDB.ref('Drivers');
driversRef.child(nouveauUtilisateur._id.toString()).set({
  ...nouveauUtilisateur,
});*/

      // Token creation
      const token = jwt.sign(
        { _id: nouveauUtilisateur._id },
        config.token_secret,
        {
          expiresIn: "120000", // in Milliseconds (3600000 = 1 hour)
        }
      );

      // Send confirmation email
      try {
        const response = await sendConfirmationEmail(email, Nom);
        console.log("Email sent successfully:", response);
      } catch (error) {
        console.error("Error sending email:", error);
      }
      const id = nouveauUtilisateur.id;
      // Send response to the client
      res.status(201).send(id);
    } catch (error) {
      console.error("Error while saving user:", error);
      res.status(500).send({ message: "Error while saving user." });
    }
  }
};

async function sendConfirmationEmail(Email, Nom) {
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
    from: "FlashDriver<noreplyflashdriver@gmail.com>",
    to: Email,
    subject: "FlashDriver Compte Pour Chauffeur ",
    html:
      `
      <!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta content="width=device-width, initial-scale=1" name="viewport">
    <title>FlashDriver - Bienvenue</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        body {
            background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
            color: #333;
            line-height: 1.6;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .container {
            width: 90%;
            max-width: 600px;
            margin: 2rem;
            background: white;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.15);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(45deg, #FFC312 0%, #FFD64D 100%);
            color: #2D033A;
            padding: 2.5rem;
            text-align: center;
            position: relative;
        }

        .header::after {
            content: '';
            position: absolute;
            bottom: -20px;
            left: 0;
            right: 0;
            height: 40px;
            background: white;
            border-radius: 50% 50% 0 0;
        }

        .content {
            padding: 3rem 2rem;
        }

        .footer {
            background: linear-gradient(45deg, #2D033A 0%, #3D044F 100%);
            color: white;
            padding: 2.5rem;
            text-align: center;
        }

        h1 {
            font-size: 2.2rem;
            margin-bottom: 0.5rem;
            font-weight: 700;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        }

        h2 {
            font-size: 1.6rem;
            margin-bottom: 1.5rem;
            color: #FFC312;
        }

        .greeting {
            font-size: 1.3rem;
            color: #2D033A;
            margin-bottom: 1.5rem;
            font-weight: 600;
        }

        .message {
            margin-bottom: 1.5rem;
            line-height: 1.8;
            color: #555;
        }

        .download-section {
            margin-top: 1rem;
        }

        .store-buttons {
            display: flex;
            justify-content: center;
            gap: 1.5rem;
            margin-top: 1.5rem;
        }

        .store-button {
            background: #FFC312;
            color: #2D033A;
            padding: 1rem 2rem;
            border-radius: 50px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }

        .store-button:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 20px rgba(0,0,0,0.3);
            background: #FFD64D;
        }

        @media (max-width: 600px) {
            .container {
                margin: 1rem;
            }

            .store-buttons {
                flex-direction: column;
                gap: 1rem;
            }

            h1 {
                font-size: 1.8rem;
            }

            .greeting {
                font-size: 1.1rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>FlashDriver</h1>
        </div>
        
        <div class="content">
            <div class="greeting">
                Cher(e) `+Nom+`,
            </div>
            
            <div class="message">
                Nous sommes ravis de vous accueillir sur FlashDriver ! Votre compte a été créé avec succès. Nous vous fournirons les détails de connexion dès que votre compte sera validé.
            </div>
        </div>

        <div class="footer">
      
            </div>
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

/**--------------Login chauff-------------------- */

/*[09:32] 
Bahia LAMARI  (Invité) a été invité(e) à la réunion.




*/
const login = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  Chauffeur.findOne({ email: email })
    .exec()
    .then((user) => {
      if (!user) {
        res.status(403).send({ message: "User not found with email " + email });
        return;
      }

      bcrypt
        .compare(password, user.password)
        .then((isMatch) => {
          if (isMatch) {
            res.json({
              role: user.role,
              email: user.email,
              password: user.password,
              id: user.id,
              Nom: user.Nom,
              address: user.address,
              Prenom: user.Prenom,
              Cstatus: user.Cstatus,
              photoAvatar: user.photoAvatar,
            });
          } else {
            res.status(406).send({ message: "Password does not match!" });
          }
        })
        .catch((err) => {
          console.log(err);
          res.status(500).send({ message: "Error comparing passwords" });
        });
    })
    .catch((err) => {
      console.log(err);
      res
        .status(500)
        .send({ message: "Error retrieving user with username " + email });
    });
};

/**----------Update Agent----------------- */
const update = (req, res, next) => {
  const { id } = req.params;
  const photoAvatarUrl = req.uploadedFiles.photoAvatar || "";
  const photoVtcUrl = req.uploadedFiles.photoVtc;
  const photoCinUrl = req.uploadedFiles.photoCin;

  let updateData = {
    Nom: req.body.Nom,
    Prenom: req.body.Prenom,
    email: req.body.email,
    phone: req.body.phone,
    photoAvatar: photoAvatarUrl,
    photoCin: photoCinUrl,
    photoVtc: photoVtcUrl,
    gender: req.body.gender,
    role: req.body.role,
    Nationalite: req.body.Nationalite,
    cnicNo: req.body.cnicNo,
    address: req.body.address,
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
/**----------------Update password------------------ */
const UpPass = async (req, res, next) => {
  const { id } = req.params;
  const { oldPassword, newPassword } = req.body;
  console.log("ID:", id);
  console.log("Old Password:", oldPassword);
  console.log("New Password:", newPassword);
  try {
    const chauffeur = await Chauffeur.findById(id);

    if (!chauffeur) {
      return res.status(404).json({
        message: "Chauffeur not found",
      });
    }

    const passwordMatch = await bcrypt.compare(oldPassword, chauffeur.password);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Old password is incorrect",
      });
    }

    const newPasswordHash = bcrypt.hashSync(newPassword, 10);

    const updateData = {
      password: newPasswordHash,
    };
    const chauffeurEmail = chauffeur.email;
    console.log("chauffeuremail:", chauffeurEmail);
    const userRecord = await admin.auth().getUserByEmail(chauffeurEmail);

    // If the user exists, update the user's email and password
    admin.auth().updateUser(userRecord.uid, {
      email: chauffeurEmail,
      password: newPassword,
    });

    await Chauffeur.findByIdAndUpdate(id, { $set: updateData });

    return res.json({
      message: "Chauffeur password updated successfully!",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error updating chauffeur password",
    });
  }
};

/**-------------------end---------------------------- */

const updatestatus = async (req, res, next) => {
  const { id } = req.params;

  try {
    const chauffeurUpdated = await Chauffeur.findByIdAndUpdate(id, {
      $set: {
        isActive: false,
        Cstatus: "Désactivé",
      },
    });

    if (!chauffeurUpdated) {
      return res.status(404).send({
        message: "Chauffeur not found!",
      });
    }

    //console.log(chauffeurUpdated);

    return res.status(200).send({
      message: "Chauffeur was Disabled successfully!",
    });
  } catch (error) {
    return res.status(500).send({ error: error });
  }
};

/**-----------Cherche sur un agent ------------- */
const resetPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Search for the chauffeur using the provided email
    const chauffeur = await Chauffeur.findOne({ email });

    if (!chauffeur) {
      return res.status(404).json({ message: "Chauffeur not found." });
    }
    const chauffeurName = chauffeur.Nom;

    // Generate a new password (you may use your own logic here)
    const newPassword = await generateNewPassword();
    const mdpEncrypted = bcrypt.hashSync(newPassword.toString(), 10);
    const chauffeurEmail = chauffeur.email;
    console.log("chauffeuremail:", chauffeurEmail);
    const userRecord = await admin.auth().getUserByEmail(chauffeurEmail);
    console.log(newPassword);
    // If the user exists, update the user's email and password
    admin.auth().updateUser(userRecord.uid, {
      email: chauffeurEmail,
      password: newPassword,
    });

    // Update the chauffeur's password
    chauffeur.password = mdpEncrypted;
    await chauffeur.save();

    // Send the new password to the chauffeur via email or other means
    sendpassword(email, newPassword, chauffeurName);
    return res.status(200).json({ message: "Password reset successful." });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while resetting the password." });
  }
};



async function generateNewPassword() {
  // Generate a new password using your preferred logic
  const newPassword = Math.random().toString(36).slice(-8); // Generate an 8-character random string
  return newPassword;
}

async function sendpassword(email, password, chauffeurName) {
  try {
    // Create a transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "noreplyflashdriver@gmail.com", // Replace with your email
        pass: "uvfu llrf qsbw esok", // Replace with your email password (use app-specific password for security)
      },
    });

    // Verify the SMTP server configuration
    await transporter.verify();

    const mailOptions = {
      from: "Flash Driver <noreplyflashdriver@gmail.com>",
      to: email,
      subject: "Flash Driver Nouveau Mot De Passe",
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Flash Driver Nouveau Mot De Passe</title>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f7f6; color: #333; line-height: 1.6; }
            .wrapper { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { text-align: center; background: #FFD700; color: #2D033A; padding: 20px; border-radius: 12px 12px 0 0; }
            .footer { text-align: center; font-size: 12px; color: #888; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="header">
              <h1>FlashDriver</h1>
              <p>Votre partenaire de mobilité</p>
            </div>
            <div>
              <h2>Bonjour ${chauffeurName},</h2>
              <p>Voici votre nouveau mot de passe : <strong>${password}</strong></p>
              <p>Veuillez le changer après votre première connexion.</p>
            </div>
            <div class="footer">
              <p>© 2024 FlashDriver. Tous droits réservés.</p>
              <p>Restez mobile, restez libre</p>
            </div>
          </div>
        </body>
        </html>`,
    };

    // Send the email
    let info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.response);
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}


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
      message: "Chauffeur was Disabled successfully!",
    });
  } catch (error) {
    return res.status(500).send({ error: error });
  }
};

const searchuse = async (req, res) => {
  const id = req.params.id;
  Chauffeur.findById(id)
    .then((data) => {
      if (!data)
        res.status(404).send({ message: "Agent introuvable pour id " + id });
      else res.send(data);
      //console.log(data)
    })
    .catch((err) => {
      res
        .status(500)
        .send({ message: "Erreur recuperation Agent avec id=" + id });
    });
};

module.exports = {
  checkChauffeur,
  register,
  login,
  destroy,
  update,
  updatestatus,
  updatestatuss,
  resetPassword,
  searchuse,
  UpPass,
};
