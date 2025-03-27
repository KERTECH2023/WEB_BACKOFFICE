const PaymentHistory = require("../models/paymentHistoryModel");

// Ajouter un paiement dans l'historique
exports.addPayment = async (req, res) => {
    try {
        const { idFirebaseChauffeur, prixAPayer, mois, semaine, dateDePayement } = req.body;
        const newPayment = new PaymentHistory({ idFirebaseChauffeur, prixAPayer, mois, semaine, dateDePayement });
        await newPayment.save();
        res.status(201).json({ message: "Paiement enregistré avec succès", payment: newPayment });
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de l'ajout du paiement" });
    }
};

// Récupérer l'historique des paiements
exports.getPaymentsHistory = async (req, res) => {
    try {
        const payments = await PaymentHistory.find().sort({ dateAjout: -1 });
        res.status(200).json(payments);
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la récupération de l'historique des paiements" });
    }
};

// Récupérer l'historique d'un chauffeur spécifique
exports.getChauffeurPayments = async (req, res) => {
    try {
        const { idFirebaseChauffeur } = req.params;
        const payments = await PaymentHistory.find({ idFirebaseChauffeur }).sort({ dateAjout: -1 });
        res.status(200).json(payments);
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la récupération des paiements du chauffeur" });
    }
};

// Supprimer un paiement de l'historique
exports.deletePayment = async (req, res) => {
    try {
        const { id } = req.params;
        await PaymentHistory.findByIdAndDelete(id);
        res.status(200).json({ message: "Paiement supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la suppression" });
    }
};
