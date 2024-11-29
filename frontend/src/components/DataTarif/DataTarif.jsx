import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./datatarif.scss";

const DataTarif = () => {
  const [tarifs, setTarifs] = useState({ day: [], night: [] });
  const [selectedTarif, setSelectedTarif] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const apiBaseURL = process.env.REACT_APP_BASE_URL;

  const fetchData = async () => {
    try {
      const [dayResponse, nightResponse] = await Promise.all([
        axios.get(`${apiBaseURL}/Tarj/show`),
        axios.get(`${apiBaseURL}/Tarn/show`),
      ]);

      setTarifs({
        day: dayResponse.data,
        night: nightResponse.data,
      });
    } catch (error) {
      toast.error("Erreur lors du chargement des tarifs.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (tarif, type) => {
    setSelectedTarif({ ...tarif, type });
    setIsEditing(true);
  };

  const handleSave = async () => {
    const endpoint =
      selectedTarif.type === "day"
        ? `${apiBaseURL}/Tarj/update`
        : `${apiBaseURL}/Tarn/update`;

    try {
      await axios.put(endpoint, selectedTarif);
      toast.success(
        `Tarif mis à jour avec succès pour ${selectedTarif.type === "day" ? "le jour" : "la nuit"}`
      );
      setIsEditing(false);
      setSelectedTarif(null);
      fetchData();
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du tarif.");
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Gestion des Tarifs</h1>

      {/* Table des tarifs */}
      <div className="tarif-table">
        <table className="table table-bordered">
          <thead className="table-light">
            <tr>
              <th>Type</th>
              <th>Base Fare</th>
              <th>Fare Per Km</th>
              <th>Fare Per Minute</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {["day", "night"].map((type) =>
              tarifs[type].map((tarif) => (
                <tr key={tarif.id}>
                  <td>{type === "day" ? "Jour" : "Nuit"}</td>
                  <td>{tarif.baseFare}</td>
                  <td>{tarif.farePerKm}</td>
                  <td>{tarif.farePerMinute}</td>
                  <td>
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() => handleEdit(tarif, type)}
                    >
                      Modifier
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Formulaire de modification */}
      {isEditing && (
        <div className="edit-form mt-4 p-4 border rounded bg-light">
          <h4>{`Modifier le Tarif (${selectedTarif.type === "day" ? "Jour" : "Nuit"})`}</h4>
          <div className="mb-3">
            <label className="form-label">Base Fare</label>
            <input
              type="text"
              className="form-control"
              value={selectedTarif.baseFare}
              onChange={(e) =>
                setSelectedTarif({ ...selectedTarif, baseFare: e.target.value })
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Fare Per Km</label>
            <input
              type="text"
              className="form-control"
              value={selectedTarif.farePerKm}
              onChange={(e) =>
                setSelectedTarif({ ...selectedTarif, farePerKm: e.target.value })
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Fare Per Minute</label>
            <input
              type="text"
              className="form-control"
              value={selectedTarif.farePerMinute}
              onChange={(e) =>
                setSelectedTarif({
                  ...selectedTarif,
                  farePerMinute: e.target.value,
                })
              }
            />
          </div>
          <div className="d-flex justify-content-between">
            <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>
              Annuler
            </button>
            <button className="btn btn-primary" onClick={handleSave}>
              Sauvegarder
            </button>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default DataTarif;
