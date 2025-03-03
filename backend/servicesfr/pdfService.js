// services/pdfService.js
const fs = require('fs');
const path = require('path');
const pdfGenerator = require('./pdfGenerator');

// Génère un PDF s'il n'existe pas déjà
exports.getOrGenerateFacturePDF = async (facture) => {
  const filePath = path.resolve(`./factures/${facture.numero}.pdf`);
  
  // Vérifie si le PDF existe déjà
  if (fs.existsSync(filePath)) {
    return filePath;
  }

  // Génère le PDF s'il n'existe pas
  await pdfGenerator.generatePDF(facture, filePath);

  return filePath;
};
