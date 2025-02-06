// components/TarifManager/TarifManager.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./TarifManager.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";

const TarifManager = () => {
  const [tarif, setTarif] = useState(null);
  const [prixdepersonne, setPrixDePersonne] = useState("");
  const [prixdebase, setPrixDeBase] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  useEffect(() => {
    fetchTarif();
  }, []);

  const fetchTarif = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await axios.get(`${BASE_URL}/tariftransfet`);
      if (response.data && response.data.length > 0) {
        const currentTarif = response.data[0];
        setTarif(currentTarif);
        setPrixDePersonne(currentTarif.prixdepersonne.toString());
        setPrixDeBase(currentTarif.prixdebase.toString());
      }
    } catch (error) {
      setError("Erreur lors de la récupération du tarif");
      console.error("Erreur:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    
    try {
      if (!prixdepersonne || !prixdebase) {
        setError("Veuillez remplir tous les champs");
        return;
      }

      if (tarif) {
        await updateTarif(tarif._id);
      } else {
        await addTarif();
      }
    } catch (error) {
      setError("Une erreur est survenue");
      console.error("Erreur:", error);
    }
  };

  const addTarif = async () => {
    const response = await axios.post(`${BASE_URL}/tariftransfet/add`, {
      prixdepersonne: Number(prixdepersonne),
      prixdebase: Number(prixdebase),
    });

    if (response.data.success) {
      alert("Tarif ajouté avec succès!");
      fetchTarif();
    }
  };

  const updateTarif = async (id) => {
    const response = await axios.put(`${BASE_URL}/tariftransfet/${id}`, {
      prixdepersonne: Number(prixdepersonne),
      prixdebase: Number(prixdebase),
    });

    if (response.data.success) {
      alert("Tarif mis à jour avec succès!");
      fetchTarif();
    }
  };

  return (
    <div className="list">
      <Sidebar />
      <div className="listContainer">
        <Navbar />
        <div className="tarif-manager">
          <h2>Gestion des Tarifs</h2>
          
          {error && <div className="error-message">{error}</div>}
          
          {isLoading ? (
            <div className="loading">Chargement...</div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="tarif-form">
                <div className="form-group">
                  <label>Prix par personne (€):</label>
                  <input
                    type="number"
                    value={prixdepersonne}
                    onChange={(e) => setPrixDePersonne(e.target.value)}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Prix de base (€):</label>
                  <input
                    type="number"
                    value={prixdebase}
                    onChange={(e) => setPrixDeBase(e.target.value)}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <button type="submit" className="submit-button">
                  {tarif ? "Mettre à jour le tarif" : "Ajouter un tarif"}
                </button>
              </form>

              {tarif && (
                <div className="current-tarif">
                  <h3>Tarif Actuel</h3>
                  <p>Prix par personne: {tarif.prixdepersonne} €</p>
                  <p>Prix de base: {tarif.prixdebase} €</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TarifManager;
