// controllers/transferController.js

const Transfer = require('../Models/Transfert');

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

// Récupérer un transfert par ID
exports.getTransferById = async (req, res) => {
  try {
    const transfer = await Transfer.findById(req.params.id);
    if (!transfer) {
      return res.status(404).json({ message: 'Transfert non trouvé' });
    }
    res.status(200).json(transfer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
