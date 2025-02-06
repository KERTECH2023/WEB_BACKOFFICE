// TarifManager.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./TarifManager.scss"; // Ajoutez des styles si nécessaire

const TariftransfertManager = () => {
  const [tarif, setTarif] = useState(null);
  const [prixdepersonne, setPrixDePersonne] = useState("");
  const [prixdebase, setPrixDeBase] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  useEffect(() => {
    fetchTarif();
  }, []);

  const fetchTarif = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/tariftransfert`);
      if (response.data.length > 0) {
        setTarif(response.data[0]); // Récupérer le premier tarif s'il existe
        setPrixDePersonne(response.data[0].prixdepersonne);
        setPrixDeBase(response.data[0].prixdebase || "");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du tarif :", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddOrUpdateTarif = async (event) => {
    event.preventDefault();
    if (tarif) {
      // Si le tarif existe, mettez à jour
      await updateTarif(tarif._id);
    } else {
      // Si le tarif n'existe pas, ajoutez un nouveau tarif
      await addTarif();
    }
  };

  const addTarif = async () => {
    try {
      await axios.post(`${BASE_URL}/tariftransfert/add`, {
        prixdepersonne,
        prixdebase,
      });
      alert("Tarif ajouté avec succès !");
      fetchTarif(); // Rafraîchir la liste des tarifs
    } catch (error) {
      console.error("Erreur lors de l'ajout du tarif :", error);
    }
  };

  const updateTarif = async (id) => {
    try {
      await axios.put(`${BASE_URL}/tariftransfert/${id}`, {
        prixdepersonne,
        prixdebase,
      });
      alert("Tarif mis à jour avec succès !");
      fetchTarif(); // Rafraîchir la liste des tarifs
    } catch (error) {
      console.error("Erreur lors de la mise à jour du tarif :", error);
    }
  };

  return (
    <div className="tarif-manager">
      <h2>Gestion des Tarifs</h2>
      {isLoading ? (
        <p>Chargement...</p>
      ) : (
        <form onSubmit={handleAddOrUpdateTarif}>
          <div>
            <label>Prix par personne (€):</label>
            <input
              type="number"
              value={prixdepersonne}
              onChange={(e) => setPrixDePersonne(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Prix de base (€):</label>
            <input
              type="number"
              value={prixdebase}
              onChange={(e) => setPrixDeBase(e.target.value)}
            />
          </div>
          <button type="submit">
            {tarif ? "Mettre à jour le tarif" : "Ajouter un tarif"}
          </button>
        </form>
      )}
      {tarif && (
        <div>
          <h3>Tarif Actuel</h3>
          <p>Prix par personne: {tarif.prixdepersonne} €</p>
          <p>Prix de base: {tarif.prixdebase || "N/A"} €</p>
        </div>
      )}
    </div>
  );
};

export default TariftransfertManager;
