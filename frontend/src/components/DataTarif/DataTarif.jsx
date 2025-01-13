import React, { useState, useEffect } from "react";
import "./datatarif.scss";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";

const DataTarif = () => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedTarif, setSelectedTarif] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTarif, setNewTarif] = useState({
    baseFare: "",
    farePerKm: "",
    farePerMinute: "",
    type: "day", // Par défaut : jour
  });
  const [isAddingTarif, setIsAddingTarif] = useState(false);

  // Charger les tarifs au chargement du composant
  useEffect(() => {
    getTariffs();
  }, []);

  // Récupérer les tarifs
  const getTariffs = async () => {
    try {
      const dayResponse = await axios.get(
        process.env.REACT_APP_BASE_URL + "/Tarj/show"
      );
      const nightResponse = await axios.get(
        process.env.REACT_APP_BASE_URL + "/Tarn/show"
      );
      const peakResponse = await axios.get(
        process.env.REACT_APP_BASE_URL + "/Tart/show"
      ); // Tarifs Temps Fort

      if (
        dayResponse.status === 200 &&
        nightResponse.status === 200 &&
        peakResponse.status === 200
      ) {
        setData([
          ...dayResponse.data.map((tariff) => ({ ...tariff, type: "day" })),
          ...nightResponse.data.map((tariff) => ({ ...tariff, type: "night" })),
          ...peakResponse.data.map((tariff) => ({ ...tariff, type: "peak" })), // Ajouter les temps forts
        ]);
      }
    } catch (error) {
      toast.error("Erreur lors du chargement des tarifs.");
    }
  };

  // Gestion de la recherche
  const handleSearchTerm = (e) => {
    setSearch(e.target.value);
  };

  // Modifier un tarif
  const handleEdit = (tarif) => {
    setSelectedTarif(tarif);
    setNewTarif({
      baseFare: tarif.baseFare,
      farePerKm: tarif.farePerKm,
      farePerMinute: tarif.farePerMinute,
      type: tarif.type,
    });
    setIsModalOpen(true);
  };

  // Mettre à jour un tarif
  const handleUpdate = async () => {
    try {
      const apiEndpoint =
        newTarif.type === "day"
          ? "/Tarj/update"
          : newTarif.type === "night"
          ? "/Tarn/update"
          : "/Tart/update"; // Temps Fort
      const response = await axios.put(
        process.env.REACT_APP_BASE_URL + apiEndpoint,
        {
          tarifId: selectedTarif.id,
          ...newTarif,
        }
      );

      if (response.status === 200) {
        toast.success("Tarif mis à jour avec succès !");
        setIsModalOpen(false);
        getTariffs();
      }
    } catch (error) {
      toast.error("Échec de la mise à jour du tarif.");
    }
  };

  // Ajouter un nouveau tarif
  const handleAddTarif = async () => {
    if (isAddingTarif) {
      try {
        const apiEndpoint =
          newTarif.type === "day"
            ? "/Tarj/tarif"
            : newTarif.type === "night"
            ? "/Tarn/tarif"
            : "/Tart/tarif"; // Temps Fort
        const response = await axios.post(
          process.env.REACT_APP_BASE_URL + apiEndpoint,
          {
            ...newTarif,
          }
        );

        if (response.status === 200) {
          toast.success("Nouveau tarif ajouté avec succès !");
          setIsAddingTarif(false);
          setNewTarif({ baseFare: "", farePerKm: "", farePerMinute: "", type: "day" });
          getTariffs();
        }
      } catch (error) {
        toast.error("Échec de l'ajout du nouveau tarif.");
      }
    } else {
      setIsAddingTarif(true);
    }
  };

  return (
    <div className="datatable">
      <div className="search mb-3">
        <input
          type="text"
          placeholder="Rechercher..."
          onChange={handleSearchTerm}
          name="Search"
          id="Search"
          className="form-control"
        />
      </div>
      <div className="mb-3 d-flex">
        {isAddingTarif && (
          <>
            <select
              value={newTarif.type}
              onChange={(e) => setNewTarif({ ...newTarif, type: e.target.value })}
              className="form-control me-2"
            >
              <option value="day">Tarif Jour</option>
              <option value="night">Tarif Nuit</option>
              <option value="peak">Tarif Temps Fort</option> {/* Nouveau type */}
            </select>
            <input
              type="text"
              placeholder="Base Fare"
              value={newTarif.baseFare}
              onChange={(e) => setNewTarif({ ...newTarif, baseFare: e.target.value })}
              className="form-control me-2"
            />
            <input
              type="text"
              placeholder="Fare Per Km"
              value={newTarif.farePerKm}
              onChange={(e) => setNewTarif({ ...newTarif, farePerKm: e.target.value })}
              className="form-control me-2"
            />
            <input
              type="text"
              placeholder="Fare Per Minute"
              value={newTarif.farePerMinute}
              onChange={(e) =>
                setNewTarif({ ...newTarif, farePerMinute: e.target.value })
              }
              className="form-control me-2"
            />
          </>
        )}
        <button className="btn btn-primary" onClick={handleAddTarif}>
          {isAddingTarif ? "Soumettre" : "Ajouter un tarif"}
        </button>
      </div>
      <DataGrid
        className="datagrid"
        rows={data.filter((val) =>
          `${val.baseFare}${val.farePerKm}${val.farePerMinute}${val.type}`.includes(search)
        )}
        columns={[
          { field: "baseFare", headerName: "Base Fare", width: 120 },
          { field: "farePerKm", headerName: "Fare Per Km", width: 120 },
          { field: "farePerMinute", headerName: "Fare Per Minute", width: 150 },
          { field: "type", headerName: "Type", width: 150 },
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
        ]}
        pageSize={9}
        rowsPerPageOptions={[9]}
        checkboxSelection
      />

      {isModalOpen && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Modifier le tarif</h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={() => setIsModalOpen(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Type de Tarif :</label>
                  <select
                    className="form-control"
                    value={newTarif.type}
                    onChange={(e) =>
                      setNewTarif({ ...newTarif, type: e.target.value })
                    }
                  >
                    <option value="day">Tarif Jour</option>
                    <option value="night">Tarif Nuit</option>
                    <option value="peak">Tarif Temps Fort</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Base Fare :</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newTarif.baseFare}
                    onChange={(e) =>
                      setNewTarif({ ...newTarif, baseFare: e.target.value })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Fare Per Km :</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newTarif.farePerKm}
                    onChange={(e) =>
                      setNewTarif({ ...newTarif, farePerKm: e.target.value })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Fare Per Minute :</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newTarif.farePerMinute}
                    onChange={(e) =>
                      setNewTarif({ ...newTarif, farePerMinute: e.target.value })
                    }
                  />
                </div>
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
      )}

      <ToastContainer />
    </div>
  );
};

export default DataTarif;
