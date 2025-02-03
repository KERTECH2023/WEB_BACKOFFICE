import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "./datatarif.scss";

const DataTarif = () => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedTarif, setSelectedTarif] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTarif, setNewTarif] = useState({
    baseFare: "",
    farePerKm: "",
    farePerMinute: "",
    FraisDeService: "", // Nouvelle propriété
    percentage: "",
    type: "day",
  });
  const [isAddingTarif, setIsAddingTarif] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const API_ENDPOINTS = {
    day: {
      show: process.env.REACT_APP_BASE_URL + "/Tarj/show",
      add: process.env.REACT_APP_BASE_URL + "/Tarj/tarif",
      update: process.env.REACT_APP_BASE_URL + "/Tarj/update",
    },
    night: {
      show: process.env.REACT_APP_BASE_URL + "/Tarn/show",
      add: process.env.REACT_APP_BASE_URL + "/Tarn/tarif",
      update: process.env.REACT_APP_BASE_URL + "/Tarn/update",
    },
    peakTime: {
      show: process.env.REACT_APP_BASE_URL + "/Tart/show",
      add: process.env.REACT_APP_BASE_URL + "/Tart/tarif",
      update: process.env.REACT_APP_BASE_URL + "/Tart/update",
    },
  };

  useEffect(() => {
    getTariffs();
  }, []);

  const getTariffs = async () => {
    setIsLoading(true);
    try {
      const [dayResponse, nightResponse, peakTimeResponse] = await Promise.all([
        axios.get(API_ENDPOINTS.day.show),
        axios.get(API_ENDPOINTS.night.show),
        axios.get(API_ENDPOINTS.peakTime.show),
      ]);

      if (
        dayResponse.status === 200 &&
        nightResponse.status === 200 &&
        peakTimeResponse.status === 200
      ) {
        const combinedData = [
          ...dayResponse.data.map((tariff) => ({ ...tariff, type: "day" })),
          ...nightResponse.data.map((tariff) => ({ ...tariff, type: "night" })),
          ...peakTimeResponse.data.map((tariff) => ({
            ...tariff,
            type: "peakTime",
          })),
        ];
        setData(combinedData);
      }
    } catch (error) {
      toast.error("Erreur lors du chargement des tarifs");
      console.error("Error fetching tariffs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateTarifData = (tarifData) => {
    const numericFields = [
      "baseFare",
      "farePerKm",
      "farePerMinute",
      "FraisDeService",
      "percentage",
    ];
    for (const field of numericFields) {
      if (
        isNaN(parseFloat(tarifData[field])) ||
        parseFloat(tarifData[field]) < 0
      ) {
        toast.error(`Le champ ${field} doit être un nombre positif`);
        return false;
      }
    }
    return true;
  };

  const handleEdit = (tarif) => {
    setSelectedTarif(tarif);
    setNewTarif({
      baseFare: tarif.baseFare,
      farePerKm: tarif.farePerKm,
      farePerMinute: tarif.farePerMinute,
      FraisDeService: tarif.FraisDeService, // Remplir les frais existants
      percentage: tarif.percentage, 
      type: tarif.type,
    });
    setIsModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!validateTarifData(newTarif)) return;

    try {
      const endpoint = API_ENDPOINTS[newTarif.type].update;
      const response = await axios.put(endpoint, {
        tarifId: selectedTarif.id,
        ...newTarif,
      });

      if (response.status === 200) {
        toast.success("Tarif mis à jour avec succès !");
        setIsModalOpen(false);
        getTariffs();
      }
    } catch (error) {
      toast.error("Échec de la mise à jour du tarif");
      console.error("Update error:", error);
    }
  };

  const handleAddTarif = async () => {
    if (isAddingTarif) {
      if (!validateTarifData(newTarif)) return;

      try {
        const endpoint = API_ENDPOINTS[newTarif.type].add;
        const response = await axios.post(endpoint, newTarif);

        if (response.status === 200) {
          toast.success("Nouveau tarif ajouté avec succès !");
          setIsAddingTarif(false);
          setNewTarif({
            baseFare: "",
            farePerKm: "",
            farePerMinute: "",
            FraisDeService: "",
            percentage: "",
            type: "day",
          });
          getTariffs();
        }
      } catch (error) {
        toast.error("Échec de l'ajout du nouveau tarif");
        console.error("Add error:", error);
      }
    } else {
      setIsAddingTarif(true);
    }
  };

  const columns = [
    { field: "baseFare", headerName: "Base Fare", width: 120 },
    { field: "farePerKm", headerName: "Fare Per Km", width: 120 },
    { field: "farePerMinute", headerName: "Fare Per Minute", width: 150 },
    { field: "FraisDeService", headerName: "Frais De Service", width: 150 },
    { field: "percentage", headerName: "percentage", width: 150 },
    
    {
      field: "type",
      headerName: "Type",
      width: 120,
      renderCell: (params) => {
        const typeLabels = {
          day: "Tarif Jour",
          night: "Tarif Nuit",
          peakTime: "Temps Fort",
        };
        return typeLabels[params.value] || params.value;
      },
    },
    {
      field: "action",
      headerName: "Action",
      width: 150,
      renderCell: (params) => (
        <button
          className="btn btn-primary btn-sm"
          onClick={() => handleEdit(params.row)}
        >
          Modifier
        </button>
      ),
    },
  ];

  const renderTarifForm = () => (
    <div className="mb-3 d-flex flex-wrap gap-2">
      <select
        value={newTarif.type}
        onChange={(e) => setNewTarif({ ...newTarif, type: e.target.value })}
        className="form-control"
        style={{ width: "auto" }}
      >
        <option value="day">Tarif Jour</option>
        <option value="night">Tarif Nuit</option>
        <option value="peakTime">Temps Fort</option>
      </select>
      <input
        type="number"
        placeholder="Base Fare"
        value={newTarif.baseFare}
        onChange={(e) => setNewTarif({ ...newTarif, baseFare: e.target.value })}
        className="form-control"
        min="0"
        step="0.01"
      />
      <input
        type="number"
        placeholder="Fare Per Km"
        value={newTarif.farePerKm}
        onChange={(e) => setNewTarif({ ...newTarif, farePerKm: e.target.value })}
        className="form-control"
        min="0"
        step="0.01"
      />
      <input
        type="number"
        placeholder="Fare Per Minute"
        value={newTarif.farePerMinute}
        onChange={(e) =>
          setNewTarif({ ...newTarif, farePerMinute: e.target.value })
        }
        className="form-control"
        min="0"
        step="0.01"
      />
      <input
        type="number"
        placeholder="Frais De Service"
        value={newTarif.FraisDeService}
        onChange={(e) =>
          setNewTarif({ ...newTarif, FraisDeService: e.target.value })
        }
        className="form-control"
        min="0"
        step="0.01"
      />
      <input
        type="number"
        placeholder="percentage"
        value={newTarif.percentage}
        onChange={(e) =>
          setNewTarif({ ...newTarif, percentage: e.target.value })
        }
        className="form-control"
        min="0"
        step="0.01"
      />
    </div>
  );

  const renderModal = () => (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Modifier le tarif</h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => setIsModalOpen(false)}
              aria-label="Close"
            />
          </div>
          <div className="modal-body">
            {renderTarifForm()}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Annuler
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleUpdate}
            >
              Mettre à jour
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="datatable">
      <div className="search mb-3">
        <input
          type="text"
          placeholder="Rechercher..."
          onChange={(e) => setSearch(e.target.value)}
          className="form-control"
        />
      </div>

      <div className="mb-3">
        {isAddingTarif && renderTarifForm()}
        <button className="btn btn-primary" onClick={handleAddTarif}>
          {isAddingTarif ? "Soumettre" : "Ajouter un tarif"}
        </button>
      </div>

      {isLoading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      ) : (
        <DataGrid
          className="datagrid"
          rows={data.filter((val) =>
            search === ""
              ? true
              : val.baseFare.toLowerCase().includes(search.toLowerCase()) ||
                val.type.toLowerCase().includes(search.toLowerCase())
          )}
          columns={columns}
          pageSize={8}
          rowsPerPageOptions={[8]}
          checkboxSelection
        />
      )}

      {isModalOpen && renderModal()}

      <ToastContainer />
    </div>
  );
};

export default DataTarif;
