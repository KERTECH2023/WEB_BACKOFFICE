// utils/pdfGenerator.js
const PDFDocument = require('pdfkit');
const fs = require('fs');

exports.generatePDF = (facture, filePath) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    
    doc.pipe(fs.createWriteStream(filePath));
    doc.fontSize(20).text(`Facture No: ${facture.numero}`, { align: 'center' });
    doc.fontSize(12).text(`Chauffeur: ${facture.nomChauffeur}`);
    doc.text(`Montant TTC: ${facture.montantTTC}`);
    doc.text(`Frais de Service: ${facture.fraisDeService}`);
    doc.text(`Montant Net: ${facture.montantTTC - facture.fraisDeService}`);

    doc.end();

    doc.on('finish', () => resolve(filePath));
    doc.on('error', reject);
  });
};
