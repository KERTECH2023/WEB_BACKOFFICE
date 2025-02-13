const Transfer = require("../Models/Transfert");
const nodemailer = require("nodemailer");

// Créer un nouveau transfert
exports.createTransfer = async (req, res) => {
  try {
    const newTransfer = new Transfer(req.body);
    await newTransfer.save();
    res.status(201).json(newTransfer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Récupérer tous les transferts
exports.getAllTransfers = async (req, res) => {
  try {
    const transfers = await Transfer.find();
    res.status(200).json(transfers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour un transfert et envoyer un email
exports.updatetransfertandsendmail = async (req, res) => {
  try {
    const transfer = await Transfer.findById(req.params.id);

    if (!transfer) {
      return res.status(404).json({ message: "Transfert non trouvé" });
    }

    transfer.accepter = "accepter";
    await transfer.save(); // Sauvegarder la mise à jour

    // Configuration de l'envoi d'email
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "noreplyflashdriver@gmail.com",
        pass: "uvfu llrf qsbw esok", // Remplace par un mot de passe d'application sécurisé
      },
    });

    const mailOptions = {
      from: "Flash Driver <noreplyflashdriver@gmail.com>",
      to: transfer.email,
      subject: "Flash Driver - Réservation Acceptée",
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Réservation Acceptée</title>
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
            </style>
        </head>
        <body>
            <div class="container">
                <div class="content">
                    <h1>Votre réservation a été acceptée</h1>
                    <p>Bonjour ${transfer.firstName} ${transfer.lastName},</p>
                    <p>Votre réservation a été validée avec succès.</p>
                    <p><strong>Email :</strong> ${transfer.email}</p>
                    <p><strong>Num vol :</strong> ${transfer.numvol}</p>
                    <p><strong>Date :</strong> ${transfer.datevol}</p>
                    <p><strong>Heure :</strong> ${transfer.heurvol}</p>
                    <p><strong>Aéroport :</strong> ${transfer.airport}</p>
                    <p><strong>Destination :</strong> ${transfer.destination}</p>
                    <p><strong>Passagers :</strong> ${transfer.passengers}</p>
                    <p><strong>Prix :</strong> ${parseFloat(transfer.price).toFixed(2)} €</p>
                    <div class="footer">
                        <p>Cordialement,<br>L'équipe Flash Driver</p>
                        <p style="font-size: 10px; color: #888;">
                            Si vous n'avez pas réservé ce transfert, veuillez nous contacter.
                        </p>
                    </div>
                </div>
            </div>
        </body>
        </html>
      `,
    };

    // Envoi de l'email
    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: "Email envoyé avec succès" });
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email :", error);
    res.status(500).json({ message: error.message });
  }
};

// Supprimer un transfert
exports.deleteTransfer = async (req, res) => {
  try {
    const transfer = await Transfer.findById(req.params.id);

    if (!transfer) {
      return res.status(404).json({ message: "Transfert non trouvé" });
    }

    await transfer.deleteOne();
    res.status(200).json({ message: "Transfert supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
