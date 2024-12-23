const Client   = require('../Models/Client')
const bcrypt  =require('bcryptjs')
const config = require("../config.json");
const jwt    =require('jsonwebtoken')
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const firestoreModule = require("../services/config");
const realtimeDB = firestoreModule.firestoreApp.database();
/**--------------------Ajouter un agnet------------------------  */

const register = async (req, res) => {
    const { Nom , Prenom, email, phone,DateNaissance,gender,role ,Nationalite,cnicNo,address,ratingsAverage,ratingsQuantity} = req.body;
    
 
    const photoAvatarUrl = req.uploadedFiles.photoAvatar || '';
  
  
const cipher = crypto.createCipher('aes-256-cbc', 'passwordforencrypt');
let encryptedPassword = cipher.update(phone, 'utf8', 'hex');
encryptedPassword += cipher.final('hex');

    const verifUtilisateur = await Client.findOne({ email });
    if (verifUtilisateur) {
      res.status(403).send({ message: "Chauffeur existe deja !" });
    } else {
      const nouveauUtilisateur = new Client();

  
      // mdpEncrypted = bcrypt.hashSync(phone,10);

      const nounIndex = Math.floor(Math.random() * Nom.length);
      const preIndex = Math.floor(Math.random() * Prenom.length);
      const randomNumber = Math.floor(Math.random() * 90000);

      nouveauUtilisateur.username = `${Nom[Math.floor(Math.random() * Nom.length)]}${Prenom[Math.floor(Math.random() * Prenom.length)]}${Math.floor(Math.random() * 90000)}`;
      nouveauUtilisateur.Nom = Nom;
      nouveauUtilisateur.Prenom = Prenom;
      nouveauUtilisateur.email = email;
      nouveauUtilisateur.phone = phone;
      nouveauUtilisateur.password = encryptedPassword; 
      nouveauUtilisateur.photoAvatar = photoAvatarUrl;
      nouveauUtilisateur.gender = gender;
      nouveauUtilisateur.role = "Client";
      nouveauUtilisateur.DateNaissance = DateNaissance
      nouveauUtilisateur.Nationalite = Nationalite
      nouveauUtilisateur.cnicNo = cnicNo
      nouveauUtilisateur.address = address
      // nouveauUtilisateur.ratingsAverage = ratingsAverage
      // nouveauUtilisateur.ratingsQuantity = ratingsQuantity
      nouveauUtilisateur.isActive = true;
  
      console.log (
        nouveauUtilisateur
    )
    
      nouveauUtilisateur.save();
  
   
      // token creation
      const token = jwt.sign({ _id: nouveauUtilisateur._id }, config.token_secret, {
        expiresIn: "120000", // in Milliseconds (3600000 = 1 hour)
      });
  
      sendConfirmationEmail(email , Nom[nounIndex]+Prenom[preIndex]+randomNumber);
      res.status(201).send({ message: "success", uses: nouveauUtilisateur, "Token": jwt.verify(token, config.token_secret) });
    }
  };


  async function sendConfirmationEmail(Email ,Nom) {

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
      from: 'TunisieUber<louay.kasdallah12@gmail.com>',
      to: Email,
      subject: 'TunisieUber Compte Pour Client ',

      html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" style="font-family:arial, 'helvetica neue', helvetica, sans-serif">
      <head>
      <meta charset="UTF-8">
      <meta content="width=device-width, initial-scale=1" name="viewport">
      <meta name="x-apple-disable-message-reformatting">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta content="telephone=no" name="format-detection">
      <title>Nouveau message 2</title><!--[if (mso 16)]>
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
      <link href="https://fonts.googleapis.com/css2?family=Josefin+Sans&display=swap" rel="stylesheet"><!--<![endif]-->
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
      @media only screen and (max-width:600px) {p, ul li, ol li, a { line-height:150%!important } h1, h2, h3, h1 a, h2 a, h3 a { line-height:120% } h1 { font-size:30px!important; text-align:center } h2 { font-size:24px!important; text-align:left } h3 { font-size:20px!important; text-align:left } .es-header-body h1 a, .es-content-body h1 a, .es-footer-body h1 a { font-size:30px!important; text-align:center } .es-header-body h2 a, .es-content-body h2 a, .es-footer-body h2 a { font-size:24px!important; text-align:left } .es-header-body h3 a, .es-content-body h3 a, .es-footer-body h3 a { font-size:20px!important; text-align:left } .es-menu td a { font-size:14px!important } .es-header-body p, .es-header-body ul li, .es-header-body ol li, .es-header-body a { font-size:14px!important } .es-content-body p, .es-content-body ul li, .es-content-body ol li, .es-content-body a { font-size:14px!important } .es-footer-body p, .es-footer-body ul li, .es-footer-body ol li, .es-footer-body a { font-size:12px!important } .es-infoblock p, .es-infoblock ul li, .es-infoblock ol li, .es-infoblock a { font-size:12px!important } *[class="gmail-fix"] { display:none!important } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3 { text-align:center!important } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3 { text-align:right!important } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3 { text-align:left!important } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } .es-button-border { display:inline-block!important } a.es-button, button.es-button { font-size:18px!important; display:inline-block!important } .es-adaptive table, .es-left, .es-right { width:100%!important } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important } .es-adapt-td { display:block!important; width:100%!important } .adapt-img { width:100%!important; height:auto!important } .es-m-p0 { padding:0!important } .es-m-p0r { padding-right:0!important } .es-m-p0l { padding-left:0!important } .es-m-p0t { padding-top:0!important } .es-m-p0b { padding-bottom:0!important } .es-m-p20b { padding-bottom:20px!important } .es-mobile-hidden, .es-hidden { display:none!important } tr.es-desk-hidden, td.es-desk-hidden, table.es-desk-hidden { width:auto!important; overflow:visible!important; float:none!important; max-height:inherit!important; line-height:inherit!important } tr.es-desk-hidden { display:table-row!important } table.es-desk-hidden { display:table!important } td.es-desk-menu-hidden { display:table-cell!important } .es-menu td { width:1%!important } table.es-table-not-adapt, .esd-block-html table { width:auto!important } table.es-social { display:inline-block!important } table.es-social td { display:inline-block!important } .es-desk-hidden { display:table-row!important; width:auto!important; overflow:visible!important; max-height:inherit!important } .es-m-p5 { padding:5px!important } .es-m-p5t { padding-top:5px!important } .es-m-p5b { padding-bottom:5px!important } .es-m-p5r { padding-right:5px!important } .es-m-p5l { padding-left:5px!important } .es-m-p10 { padding:10px!important } .es-m-p10t { padding-top:10px!important } .es-m-p10b { padding-bottom:10px!important } .es-m-p10r { padding-right:10px!important } .es-m-p10l { padding-left:10px!important } .es-m-p15 { padding:15px!important } .es-m-p15t { padding-top:15px!important } .es-m-p15b { padding-bottom:15px!important } .es-m-p15r { padding-right:15px!important } .es-m-p15l { padding-left:15px!important } .es-m-p20 { padding:20px!important } .es-m-p20t { padding-top:20px!important } .es-m-p20r { padding-right:20px!important } .es-m-p20l { padding-left:20px!important } .es-m-p25 { padding:25px!important } .es-m-p25t { padding-top:25px!important } .es-m-p25b { padding-bottom:25px!important } .es-m-p25r { padding-right:25px!important } .es-m-p25l { padding-left:25px!important } .es-m-p30 { padding:30px!important } .es-m-p30t { padding-top:30px!important } .es-m-p30b { padding-bottom:30px!important } .es-m-p30r { padding-right:30px!important } .es-m-p30l { padding-left:30px!important } .es-m-p35 { padding:35px!important } .es-m-p35t { padding-top:35px!important } .es-m-p35b { padding-bottom:35px!important } .es-m-p35r { padding-right:35px!important } .es-m-p35l { padding-left:35px!important } .es-m-p40 { padding:40px!important } .es-m-p40t { padding-top:40px!important } .es-m-p40b { padding-bottom:40px!important } .es-m-p40r { padding-right:40px!important } .es-m-p40l { padding-left:40px!important } .h-auto { height:auto!important } }
      </style>
      </head>
      <body data-new-gr-c-s-loaded="14.1031.0" style="width:100%;font-family:arial, 'helvetica neue', helvetica, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0">
      <div class="es-wrapper-color" style="background-color:#D2A805"><!--[if gte mso 9]>
      <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
      <v:fill type="tile" color="#d2a805"></v:fill>
      </v:background>
      <![endif]-->
      <table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#D2A805">
      <tr>
      <td valign="top" style="padding:0;Margin:0">
      <table cellpadding="0" cellspacing="0" class="es-header" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top">
      <tr>
      <td align="center" style="padding:0;Margin:0">
      <table bgcolor="#ffffff" class="es-header-body" align="center" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px">
      <tr>
      <td align="left" style="padding:20px;Margin:0"><!--[if mso]><table style="width:560px" cellpadding="0"
      cellspacing="0"><tr><td style="width:241px" valign="top"><![endif]-->
      <table cellpadding="0" cellspacing="0" class="es-left" align="left" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">
      <tr>
      <td class="es-m-p0r es-m-p20b" valign="top" align="center" style="padding:0;Margin:0;width:241px">
      <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
      <tr>
      <td align="left" class="es-m-txt-c" style="padding:0;Margin:0;font-size:0px"><a target="_blank" href="https://viewstripo.email" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:none;color:#3B8026;font-size:14px"><img src="https://ymjipk.stripocdn.email/content/guids/CABINET_20717d2a5fbd1820851bfff00c852e41c24f3af725e1d147e89a5d094d4f0aeb/images/logof.png" alt="Logo" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic" title="Logo" width="193" height="127"></a></td>
      </tr>
      </table></td>
      </tr>
      </table><!--[if mso]></td><td style="width:20px"></td><td style="width:299px" valign="top"><![endif]-->
      <table cellpadding="0" cellspacing="0" align="right" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
      <tr>
      <td align="left" style="padding:0;Margin:0;width:299px">
      <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
      <tr>
      <td style="padding:0;Margin:0">
      <table cellpadding="0" cellspacing="0" width="100%" class="es-menu" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
      <tr class="links-images-right">
      <td align="center" valign="top" width="100%" style="Margin:0;padding-left:5px;padding-right:5px;padding-top:10px;padding-bottom:0px;border:0" id="esd-menu-id-0"><a target="_blank" href="" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:none;display:block;font-family:'Josefin Sans', helvetica, arial, sans-serif;color:#0b5394;font-size:18px">Commandez un taxi en un clic depuis votre mobile<img src="https://ymjipk.stripocdn.email/content/guids/CABINET_20717d2a5fbd1820851bfff00c852e41c24f3af725e1d147e89a5d094d4f0aeb/images/logof.png" alt="Commandez un taxi en un clic depuis votre mobile" title="Commandez un taxi en un clic depuis votre mobile" align="absmiddle" width="42" style="display:inline-block !important;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;padding-left:15px;vertical-align:middle;font-size:12px" height="28"></a></td>
      </tr>
      </table></td>
      </tr>
      </table></td>
      </tr>
      </table><!--[if mso]></td></tr></table><![endif]--></td>
      </tr>
      </table></td>
      </tr>
      </table>
      <table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
      <tr>
      <td align="center" style="padding:0;Margin:0">
      <table class="es-content-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#ffffff;width:600px" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center">
      <tr>
      <td align="left" style="padding:40px;Margin:0">
      <table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
      <tr>
      <td align="center" valign="top" style="padding:0;Margin:0;width:520px">
      <table cellpadding="0" cellspacing="0" width="100%" bgcolor="#fef852" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:separate;border-spacing:0px;background-color:#fef852;border-radius:20px" role="presentation">
      <tr>
      <td align="center" style="Margin:0;padding-bottom:10px;padding-left:20px;padding-right:20px;padding-top:30px"><h1 style="Margin:0;line-height:48px;mso-line-height-rule:exactly;font-family:'Josefin Sans', helvetica, arial, sans-serif;font-size:40px;font-style:normal;font-weight:normal;color:#2D033A">Merci<br>pour nous choisir</h1></td>
      </tr>
      <tr>
      <td align="center" style="padding:0;Margin:0;padding-bottom:30px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:'Josefin Sans', helvetica, arial, sans-serif;line-height:24px;color:#38363A;font-size:16px"><br></p></td>
      </tr>
      </table></td>
      </tr>
      </table></td>
      </tr>
      <tr>
      <td align="left" style="padding:0;Margin:0;padding-bottom:40px;padding-left:40px;padding-right:40px">
      <table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
      <tr>
      <td align="center" valign="top" style="padding:0;Margin:0;width:520px">
      <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
      <tr>
      <td align="left" style="padding:0;Margin:0;padding-top:5px;padding-bottom:5px"><h3 style="Margin:0;line-height:24px;mso-line-height-rule:exactly;font-family:'Josefin Sans', helvetica, arial, sans-serif;font-size:20px;font-style:normal;font-weight:normal;color:#2D033A">Cher(e) `+ Nom +`,</h3><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:'Josefin Sans', helvetica, arial, sans-serif;line-height:21px;color:#38363A;font-size:14px"><br></p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:'Josefin Sans', helvetica, arial, sans-serif;line-height:21px;color:#38363A;font-size:14px">Nous sommes ravis de vous accueillir sur TunisieUber ! Votre compte a été créé avec succès, et nous tenons à vous fournir les détails de connexion dont vous avez besoin pour commencer.</p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:'Josefin Sans', helvetica, arial, sans-serif;line-height:21px;color:#38363A;font-size:14px"><br></p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:'Josefin Sans', helvetica, arial, sans-serif;line-height:21px;color:#38363A;font-size:14px">Voici vos informations de compte :</p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:'Josefin Sans', helvetica, arial, sans-serif;line-height:21px;color:#38363A;font-size:14px">Adresse e-mail : <a href="mailto:louay.benkasdallah@esprit.tn" target="_blank" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:none;color:#3B8026;font-size:14px">`+Email`</a></p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:'Josefin Sans', helvetica, arial, sans-serif;line-height:21px;color:#38363A;font-size:14px">Mot de passe : [Numéro Du Télephone]</p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:'Josefin Sans', helvetica, arial, sans-serif;line-height:21px;color:#38363A;font-size:14px"><br></p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:'Josefin Sans', helvetica, arial, sans-serif;line-height:21px;color:#38363A;font-size:14px">Nous vous recommandons de garder ces informations en lieu sûr et de ne pas les partager avec d'autres personnes. Si vous avez des raisons de croire que votre compte a été compromis, veuillez nous contacter immédiatement.</p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:'Josefin Sans', helvetica, arial, sans-serif;line-height:21px;color:#38363A;font-size:14px"><br></p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:'Josefin Sans', helvetica, arial, sans-serif;line-height:21px;color:#38363A;font-size:14px">Si vous avez des questions ou rencontrez des problèmes lors de votre utilisation de notre plateforme, n'hésitez pas à nous contacter. Notre équipe d'assistance se fera un plaisir de vous aider.</p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:'Josefin Sans', helvetica, arial, sans-serif;line-height:21px;color:#38363A;font-size:14px"><br></p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:'Josefin Sans', helvetica, arial, sans-serif;line-height:21px;color:#38363A;font-size:14px">Encore une fois, merci de nous rejoindre sur TunisieUber . Nous sommes impatients de vous offrir une expérience exceptionnelle.</p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:'Josefin Sans', helvetica, arial, sans-serif;line-height:21px;color:#38363A;font-size:14px"><br></p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:'Josefin Sans', helvetica, arial, sans-serif;line-height:21px;color:#38363A;font-size:14px">Cordialement,</p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:'Josefin Sans', helvetica, arial, sans-serif;line-height:21px;color:#38363A;font-size:14px">TunisieUber</p></td>
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
      <table bgcolor="#ffffff" class="es-content-body" align="center" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px">
      <tr>
      <td align="left" bgcolor="#FFC312" style="Margin:0;padding-left:20px;padding-right:20px;padding-top:30px;padding-bottom:30px;background-color:#ffc312">
      <table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
      <tr>
      <td align="left" style="padding:0;Margin:0;width:560px">
      <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
      <tr>
      <td align="center" style="padding:0;Margin:0;padding-left:10px;padding-right:10px;padding-top:15px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:'Josefin Sans', helvetica, arial, sans-serif;line-height:21px;color:#ffffff;font-size:14px">Download Our&nbsp;App</p></td>
      </tr>
      <tr>
      <td style="padding:0;Margin:0">
      <table cellpadding="0" cellspacing="0" width="100%" class="es-menu" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
      <tr class="images">
      <td align="center" valign="top" width="50%" id="esd-menu-id-1" style="Margin:0;padding-left:5px;padding-right:5px;padding-top:10px;padding-bottom:10px;border:0"><img src="https://ymjipk.stripocdn.email/content/guids/CABINET_b8050f8a2fcab03567028bda1790992c/images/pngwing_1.png" alt="Item2" title="Item2" height="40" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;font-size:12px" width="114"></td>
      <td align="center" valign="top" width="50%" id="esd-menu-id-2" style="Margin:0;padding-left:5px;padding-right:5px;padding-top:10px;padding-bottom:10px;border:0"><img src="https://ymjipk.stripocdn.email/content/guids/CABINET_b8050f8a2fcab03567028bda1790992c/images/pngwing_2.png" alt="Item3" title="Item3" height="40" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;font-size:12px" width="118"></td>
      </tr>
      </table></td>
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
      </html>`

    };
  
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  }

  

/**--------------Login Admin-------------------- */
  
  const login = (req, res) => {


    console.log(
      req.body.email
    )
  
    console.log(
      req.body.password
    )
  
  
  
  
    var email = req.body.email
    var password = req.body.password
    Client.findOne({ email: email }, function (err, user) {
  
      if (err) {
        console.log(err);
      }
  
  
      if (user) {
        bcrypt.compare(password, user.password, function (err, result) {
          if (err) {
            res.json({
              error: err
            })
          }
  
          if (result) {
            let token = jwt.sign({ Firstname: user.Firstname }, 'verysecretValue', { expiresIn: '1h' })
           
            
            return res.json({
  
              Firstname: user.Firstname,
              Lastname: user.Lastname,
              email: user.email,
              phone: user.phone,
              password: user.password,
         
              token
  
  
  
  
            })
            
            
          } else {
            res.status(403).send({ message: "password does not matched !" });
  
          }
        })
  
  
      } else {
        res.status(403).send({ message: "Wrong email adress!" });
  
  
  
  
  
      }

      
    })

  
  }

  /**----------Update Agent----------------- */
  const update = (req, res, next)=>{
    const {id} = req.params
    const photoAvatarUrl = req.uploadedFiles.photoAvatar || '';
    let updateData ={

  
        Nom : req.body.Nom,
        Prenom : req.body.Prenom,
        email : req.body.email,
        phone : req.body.phone,
        photoAvatar : photoAvatarUrl,
        gender:req.body.gender,
        role:req.body.role,
        Nationalite : req.body.Nationalite,
        DateNaissance : req.body.DateNaissance,
       licenseNo : req.body.licenseNo,
       cnicNo : req.body.cnicNo,
       address : req.body.address,
      postalCode : req.body.postalCode,
    
    }
    console.log(updateData)

    Client.findByIdAndUpdate(id , {$set :  updateData})
    .then (() =>{
        res.json({
            message : ' Client  update with succes !'
        })

    })
.catch(error =>{
    res.json({
        message : 'error with updtaing Client !'
    })
})

}

  const updateuse = async (req,res, next) => {
    const {id} = req.params
    const {firebaseUrl} =req.file ? req.file : "";

     try{
    const adminUpdated = await Client.findByIdAndUpdate(id,{$set:{ Firstname : req.body.Firstname, photo:firebaseUrl}})
    console.log(adminUpdated)
    console.log(adminUpdated)
    return res.status(200).send({
        message: "Client was updated successfully!"
      })
    }catch(error){
        return res.status(500).send({err:error})
    }
   
    }


/**-----------Cherche sur un agent ------------- */


   const  searchuse = async(req,res) => {
        const id = req.params.id;
        Client.findById(id)
          .then(data => {
            if (!data)
              res.status(404).send({ message: "Client introuvable pour id " + id });
            else res.send(data);
            console.log(data)
          })
          .catch(err => {
            res
              .status(500)
              .send({ message: "Erreur recuperation Client avec id=" + id });
          });

          
      }


  const recupereruse = async(req,res,data) =>{
   
    Client.find({ isActive: true },(err, data)=>{
      
        res.json(data);
        console.log(data)
        
    });
}

const updatestatus = async (req,res, next) => {
  const {id} = req.params

   try{
  const adminUpdated = await Client.findByIdAndUpdate(id,{$set:{isActive:false}})
  console.log(adminUpdated)

  return res.status(200).send({
      message: "Chauffeur was updated successfully!"
     
      
    })
    
  }catch(error){
      return res.status(500).send({err:error})
  }
  console.log(res)
  }

const Clientdesa = async(req,res,data) =>{
 
  Client.find({ isActive: false }, (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).send(err);
    }
    
    console.log(data);
    res.json(data);
  });
}
/**----------------------Supprimer un agent------------------- */

const ClientSchema = new mongoose.Schema({
  firebaseUID: {
    type: String,
    required: true,
    unique: true
  },
  healthStatus: {
    type: String,
    default: "none"
  },
  email: String,
  name: String,
  phone: String,
  token: String,
  factures: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Facture'
  }]
});

const Client = mongoose.model('Client', ClientSchema);

async function syncClientsFirebaseToMongoDB(req, res) {
  try {
    const snapshot = await realtimeDB.ref("Clients").once("value");
    const clients = snapshot.val();

    if (!clients) {
      return res.status(404).json({ message: "Aucun client trouvé dans Firebase." });
    }

    let savedCount = 0;

    for (const [firebaseUID, clientData] of Object.entries(clients)) {
      const existingClient = await Client.findOne({ firebaseUID });

      if (existingClient) {
        // Mise à jour du client existant
        await Client.findOneAndUpdate(
          { firebaseUID },
          {
            healthStatus: clientData.HealthStatus || "none",
            email: clientData.email || "",
            name: clientData.name || "",
            phone: clientData.phone || "",
            token: clientData.token || ""
          }
        );
        continue;
      }

      // Création d'un nouveau client
      const newClient = new Client({
        firebaseUID,
        healthStatus: clientData.HealthStatus || "none",
        email: clientData.email || "",
        name: clientData.name || "",
        phone: clientData.phone || "",
        token: clientData.token || ""
      });

      await newClient.save();
      savedCount++;
    }

    res.status(200).json({
      message: "Synchronisation des clients terminée",
      savedCount
    });
  } catch (error) {
    console.error("Erreur de synchronisation:", error);
    res.status(500).json({
      message: "Erreur lors de la synchronisation",
      error: error.message
    });
  }
}














































const destroy = async (req, res) => {
    const id = req.params.id;
    Client.findByIdAndRemove(id)
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Impossible de supprimer Client avec id=${id}. Client est possiblement introuvable!`
        });
      } else {
        res.send({
          message: "Client supprimée avec succès!"
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Impossible de supprimer Client avec id=" + id
      });
    });
    }
    const updatestatuss = async (req,res, next) => {
      const {id} = req.params
    
       try{
      const adminUpdated = await Client.findByIdAndUpdate(id,{$set:{isActive:true}})
      console.log(adminUpdated)
    
      return res.status(200).send({
          message: "Chauffeur was updated successfully!"
         
          
        })
        
      }catch(error){
          return res.status(500).send({err:error})
      }
      console.log(res)
      }
  module.exports ={
    register, login,recupereruse,updateuse,destroy,searchuse,update,updatestatus,Clientdesa,updatestatuss,syncClientsFirebaseToMongoDB 
    }
