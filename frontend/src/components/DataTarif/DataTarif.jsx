import React, { useState, useEffect } from "react";
import "./datatarif.scss";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";

const DataTarif = () => {
  // États pour les données
  const [standardTariffs, setStandardTariffs] = useState([]);
  const [peakTariffs, setPeakTariffs] = useState([]);
  const [search, setSearch] = useState("");

  // États pour la gestion des modales et formulaires
  const [selectedTarif, setSelectedTarif] = useState(null);
  const [isStandardModalOpen, setIsStandardModalOpen] = useState(false);
  const [isPeakModalOpen, setIsPeakModalOpen] = useState(false);
  const [isAddingStandard, setIsAddingStandard] = useState(false);
  const [isAddingPeak, setIsAddingPeak] = useState(false);

  // États pour les formulaires
  const [newStandardTarif, setNewStandardTarif] = useState({
    baseFare: "",
    farePerKm: "",
    farePerMinute: "",
    type: "day"
  });

  const [newPeakTarif, setNewPeakTarif] = useState({
    startHour: "",
    endHour: "",
    baseFare: "",
    farePerKm: "",
    farePerMinute: ""
  });

  // Chargement initial des données
  useEffect(() => {
    getStandardTariffs();
    getPeakTariffs();
  }, []);

  // Fonctions pour récupérer les données
  const getStandardTariffs = async () => {
    try {
      const dayResponse = await axios.get(`${process.env.REACT_APP_BASE_URL}/Tarj/show`);
      const nightResponse = await axios.get(`${process.env.REACT_APP_BASE_URL}/Tarn/show`);

      if (dayResponse.status === 200 && nightResponse.status === 200) {
        setStandardTariffs([
          ...dayResponse.data.map(tariff => ({ ...tariff, type: 'day', id: tariff._id || tariff.id })),
          ...nightResponse.data.map(tariff => ({ ...tariff, type: 'night', id: tariff._id || tariff.id }))
        ]);
      }
    } catch (error) {
      toast.error("Erreur lors du chargement des tarifs standards");
    }
  };

  const getPeakTariffs = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/TarifsDeTempsFort/show`);
      if (response.status === 200) {
        setPeakTariffs(response.data.map(tariff => ({
          ...tariff,
          id: tariff._id || tariff.id
        })));
      }
    } catch (error) {
      toast.error("Erreur lors du chargement des tarifs de temps fort");
    }
  };

  // Gestionnaires pour les tarifs standards
  const handleAddStandardTarif = async () => {
    if (isAddingStandard) {
      try {
        const endpoint = newStandardTarif.type === 'day' ? '/Tarj/tarif' : '/Tarn/tarif';
        const response = await axios.post(
          `${process.env.REACT_APP_BASE_URL}${endpoint}`,
          newStandardTarif
        );

        if (response.status === 200) {
          toast.success("Nouveau tarif standard ajouté avec succès !");
          setIsAddingStandard(false);
          setNewStandardTarif({ baseFare: "", farePerKm: "", farePerMinute: "", type: "day" });
          getStandardTariffs();
        }
      } catch (error) {
        toast.error("Échec de l'ajout du tarif standard");
      }
    } else {
      setIsAddingStandard(true);
    }
  };

  const handleEditStandardTarif = (tarif) => {
    setSelectedTarif(tarif);
    setNewStandardTarif({
      baseFare: tarif.baseFare,
      farePerKm: tarif.farePerKm,
      farePerMinute: tarif.farePerMinute,
      type: tarif.type
    });
    setIsStandardModalOpen(true);
  };

  const handleUpdateStandardTarif = async () => {
    try {
      const endpoint = newStandardTarif.type === 'day' ? '/Tarj/update' : '/Tarn/update';
      const response = await axios.put(
        `${process.env.REACT_APP_BASE_URL}${endpoint}`,
        {
          tarifId: selectedTarif.id,
          ...newStandardTarif
        }
      );

      if (response.status === 200) {
        toast.success("Tarif standard mis à jour avec succès !");
        setIsStandardModalOpen(false);
        getStandardTariffs();
      }
    } catch (error) {
      toast.error("Échec de la mise à jour du tarif standard");
    }
  };

  // Gestionnaires pour les tarifs de temps fort
  const handleAddPeakTarif = async () => {
    if (isAddingPeak) {
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_BASE_URL}/TarifsDeTempsFort/add`,
          newPeakTarif
        );

        if (response.status === 201) {
          toast.success("Nouveau tarif de temps fort ajouté avec succès !");
          setIsAddingPeak(false);
          setNewPeakTarif({
            startHour: "",
            endHour: "",
            baseFare: "",
            farePerKm: "",
            farePerMinute: ""
          });
          getPeakTariffs();
        }
      } catch (error) {
        toast.error("Échec de l'ajout du tarif de temps fort");
      }
    } else {
      setIsAddingPeak(true);
    }
  };

  const handleEditPeakTarif = (tarif) => {
    setSelectedTarif(tarif);
    setNewPeakTarif({
      startHour: tarif.startHour,
      endHour: tarif.endHour,
      baseFare: tarif.baseFare,
      farePerKm: tarif.farePerKm,
      farePerMinute: tarif.farePerMinute
    });
    setIsPeakModalOpen(true);
  };

  const handleUpdatePeakTarif = async () => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/TarifsDeTempsFort/update`,
        {
          tarifId: selectedTarif.id,
          ...newPeakTarif
        }
      );

      if (response.status === 200) {
        toast.success("Tarif de temps fort mis à jour avec succès !");
        setIsPeakModalOpen(false);
        getPeakTariffs();
      }
    } catch (error) {
      toast.error("Échec de la mise à jour du tarif de temps fort");
    }
  };

  // Configuration des colonnes pour les DataGrids
  const standardColumns = [
    { field: "baseFare", headerName: "Tarif de base", width: 130 },
    { field: "farePerKm", headerName: "Tarif par km", width: 130 },
    { field: "farePerMinute", headerName: "Tarif par minute", width: 150 },
    { field: "type", headerName: "Type", width: 100 },
    {
      field: "action",
      headerName: "Action",
      width: 150,
      renderCell: (params) => (
        <button
          className="btn btn-primary btn-sm"
          onClick={() => handleEditStandardTarif(params.row)}
        >
          Modifier
        </button>
      ),
    },
  ];

  const peakColumns = [
    { field: "startHour", headerName: "Heure de début", width: 130 },
    { field: "endHour", headerName: "Heure de fin", width: 130 },
    { field: "baseFare", headerName: "Tarif de base", width: 130 },
    { field: "farePerKm", headerName: "Tarif par km", width: 130 },
    { field: "farePerMinute", headerName: "Tarif par minute", width: 150 },
    {
      field: "action",
      headerName: "Action",
      width: 150,
      renderCell: (params) => (
        <button
          className="btn btn-primary btn-sm"
          onClick={() => handleEditPeakTarif(params.row)}
        >
          Modifier
        </button>
      ),
    },
  ];

  return (
    <div className="datatable">
      {/* Barre de recherche */}
      <div className="search mb-3">
        <input
          type="text"
          placeholder="Rechercher..."
          onChange={(e) => setSearch(e.target.value)}
          className="form-control"
        />
      </div>

      {/* Section des tarifs standards */}
      <div className="standard-tariffs mb-5">
        <h3 className="mb-3">Tarifs Standards</h3>
        <div className="mb-3 d-flex">
          {isAddingStandard && (
            <>
              <select
                value={newStandardTarif.type}
                onChange={(e) => setNewStandardTarif({ ...newStandardTarif, type: e.target.value })}
                className="form-control me-2"
              >
                <option value="day">Tarif Jour</option>
                <option value="night">Tarif Nuit</option>
              </select>
              <input
                type="number"
                placeholder="Tarif de base"
                value={newStandardTarif.baseFare}
                onChange={(e) => setNewStandardTarif({ ...newStandardTarif, baseFare: e.target.value })}
                className="form-control me-2"
              />
              <input
                type="number"
                placeholder="Tarif par km"
                value={newStandardTarif.farePerKm}
                onChange={(e) => setNewStandardTarif({ ...newStandardTarif, farePerKm: e.target.value })}
                className="form-control me-2"
              />
              <input
                type="number"
                placeholder="Tarif par minute"
                value={newStandardTarif.farePerMinute}
                onChange={(e) => setNewStandardTarif({ ...newStandardTarif, farePerMinute: e.target.value })}
                className="form-control me-2"
              />
            </>
          )}
          <button className="btn btn-primary" onClick={handleAddStandardTarif}>
            {isAddingStandard ? "Soumettre" : "Ajouter un tarif standard"}
          </button>
        </div>

        <DataGrid
          className="datagrid"
          rows={standardTariffs.filter((val) =>
            Object.values(val).some(
              value => value && value.toString().toLowerCase().includes(search.toLowerCase())
            )
          )}
          columns={standardColumns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          checkboxSelection
          disableSelectionOnClick
          autoHeight
        />
      </div>

      {/* Section des tarifs de temps fort */}
      <div className="peak-tariffs">
        <h3 className="mb-3">Tarifs de Temps Fort</h3>
        <div className="mb-3 d-flex">
          {isAddingPeak && (
            <>
              <input
                type="number"
                placeholder="Heure de début (0-23)"
                value={newPeakTarif.startHour}
                onChange={(e) => setNewPeakTarif({ ...newPeakTarif, startHour: e.target.value })}
                className="form-control me-2"
                min="0"
                max="23"
              />
              <input
                type="number"
                placeholder="Heure de fin (0-23)"
                value={newPeakTarif.endHour}
                onChange={(e) => setNewPeakTarif({ ...newPeakTarif, endHour: e.target.value })}
                className="form-control me-2"
                min="0"
                max="23"
              />
              <input
                type="number"
                placeholder="Tarif de base"
                value={newPeakTarif.baseFare}
                onChange={(e) => setNewPeakTarif({ ...newPeakTarif, baseFare: e.target.value })}
                className="form-control me-2"
              />
              <input
                type="number"
                placeholder="Tarif par km"
                value={newPeakTarif.farePerKm}
                onChange={(e) => setNewPeakTarif({ ...newPeakTarif, farePerKm: e.target.value })}
                className="form-control me-2"
              />
              <input
                type="number"
                placeholder="Tarif par minute"
                value={newPeakTarif.farePerMinute}
                onChange={(e) => setNewPeakTarif({ ...newPeakTarif, farePerMinute: e.target.value })}
                className="form-control me-2"
              />
            </>
          )}
          <button className="btn btn-primary" onClick={handleAddPeakTarif}>
            {isAddingPeak ? "Soumettre" : "Ajouter un tarif de temps fort"}
          </button>
        </div>

        <DataGrid
          className="datagrid"
          rows={peakTariffs.filter((val) =>
            Object.values(val).some(
              value => value && value.toString().toLowerCase().includes(search.toLowerCase())
            )
          )}
          columns={peakColumns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          checkboxSelection
          disableSelectionOnClick
          autoHeight
        />
      </div>

      {/* Modal pour modifier un tarif standard */}
      {isStandardModalOpen && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Modifier le tarif standard</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setIsStandardModalOpen(false)}
                ></button>
              </div>
              <div className="modal-body">
              <div className="mb-3">
                  <label className="form-label">Type de Tarif :</label>
                  <select
                    className="form-control"
                    value={newStandardTarif.type}
                    onChange={(e) => setNewStandardTarif({ ...newStandardTarif, type: e.target.value })}
                  >
                    <option value="day">Tarif Jour</option>
                    <option value="night">Tarif Nuit</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Tarif de base :</label>
                  <input
                    type="number"
                    className="form-control"
                    value={newStandardTarif.baseFare}
                    onChange={(e) => setNewStandardTarif({ ...newStandardTarif, baseFare: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Tarif par km :</label>
                  <input
                    type="number"
                    className="form-control"
                    value={newStandardTarif.farePerKm}
                    onChange={(e) => setNewStandardTarif({ ...newStandardTarif, farePerKm: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Tarif par minute :</label>
                  <input
                    type="number"
                    className="form-control"
                    value={newStandardTarif.farePerMinute}
                    onChange={(e) => setNewStandardTarif({ ...newStandardTarif, farePerMinute: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsStandardModalOpen(false)}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleUpdateStandardTarif}
                >
                  Mettre à jour
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal pour modifier un tarif de temps fort */}
      {isPeakModalOpen && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Modifier le tarif de temps fort</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setIsPeakModalOpen(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Heure de début :</label>
                  <input
                    type="number"
                    className="form-control"
                    value={newPeakTarif.startHour}
                    onChange={(e) => setNewPeakTarif({ ...newPeakTarif, startHour: e.target.value })}
                    min="0"
                    max="23"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Heure de fin :</label>
                  <input
                    type="number"
                    className="form-control"
                    value={newPeakTarif.endHour}
                    onChange={(e) => setNewPeakTarif({ ...newPeakTarif, endHour: e.target.value })}
                    min="0"
                    max="23"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Tarif de base :</label>
                  <input
                    type="number"
                    className="form-control"
                    value={newPeakTarif.baseFare}
                    onChange={(e) => setNewPeakTarif({ ...newPeakTarif, baseFare: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Tarif par km :</label>
                  <input
                    type="number"
                    className="form-control"
                    value={newPeakTarif.farePerKm}
                    onChange={(e) => setNewPeakTarif({ ...newPeakTarif, farePerKm: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Tarif par minute :</label>
                  <input
                    type="number"
                    className="form-control"
                    value={newPeakTarif.farePerMinute}
                    onChange={(e) => setNewPeakTarif({ ...newPeakTarif, farePerMinute: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsPeakModalOpen(false)}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleUpdatePeakTarif}
                >
                  Mettre à jour
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default DataTarif;
