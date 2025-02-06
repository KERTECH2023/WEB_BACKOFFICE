const Tarifs = require('../Models/Tariftransfert');

// Get all tarifs
exports.getAllTarifs = async (req, res) => {
  try {
    const tarifs = await Tarifs.find().sort({ createdAt: -1 });
    res.status(200).json(tarifs);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération des tarifs', 
      error: error.message 
    });
  }
};

// Add new tarif
exports.addTarif = async (req, res) => {
  try {
    const { prixdepersonne, prixdebase } = req.body;
    
    if (!prixdepersonne || !prixdebase) {
      return res.status(400).json({ 
        success: false, 
        message: 'Prix de personne et prix de base sont requis' 
      });
    }

    const newTarif = new Tarifs({
      prixdepersonne: Number(prixdepersonne),
      prixdebase: Number(prixdebase)
    });

    const savedTarif = await newTarif.save();
    res.status(201).json({
      success: true,
      message: 'Tarif ajouté avec succès',
      data: savedTarif
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de l\'ajout du tarif', 
      error: error.message 
    });
  }
};

// Update tarif
exports.updateTarif = async (req, res) => {
  try {
    const { id } = req.params;
    const { prixdepersonne, prixdebase } = req.body;

    if (!prixdepersonne || !prixdebase) {
      return res.status(400).json({ 
        success: false, 
        message: 'Prix de personne et prix de base sont requis' 
      });
    }

    const updatedTarif = await Tarifs.findByIdAndUpdate(
      id,
      {
        prixdepersonne: Number(prixdepersonne),
        prixdebase: Number(prixdebase)
      },
      { new: true, runValidators: true }
    );

    if (!updatedTarif) {
      return res.status(404).json({ 
        success: false, 
        message: 'Tarif non trouvé' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Tarif mis à jour avec succès',
      data: updatedTarif
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la mise à jour du tarif', 
      error: error.message 
    });
  }
};
