const Tarifs = require('../Models/Tariftransfert');



// add
exports.addTarif = async (req, res) => {
    try {
        const { prixdepersonne, prixdebase } = req.body;
        const newTarif = new Tarifs({ prixdepersonne, prixdebase });
        await newTarif.save();
        res.status(201).json(newTarif);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de l\'ajout du tarif', error });
    }
};

// Récupérer tous les tarifs
exports.getAllTarifs = async (req, res) => {
    try {
        const tarifs = await Tarifs.find();
        res.json(tarifs);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des tarifs', error });
    }
};

// Mettre à jour un tarif par ID
exports.updateTarif = async (req, res) => {
    try {
        const { prixdepersonne, prixdebase } = req.body;
        const updatedTarif = await Tarifs.findByIdAndUpdate(
            req.params.id,
            { prixdepersonne, prixdebase },
            { new: true, runValidators: true }
        );
        if (!updatedTarif) {
            return res.status(404).json({ message: 'Tarif non trouvé' });
        }
        res.json(updatedTarif);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la mise à jour du tarif', error });
    }
};
