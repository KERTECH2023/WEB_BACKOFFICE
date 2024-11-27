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
  const [newTarif, setNewTarif] = useState({ baseFare: "", farePerKm: "", farePerMinute: "" });
  const [isAddingTarif, setIsAddingTarif] = useState(false);

  useEffect(() => {
    getUsers();
  }, []);

  const getUsers = async () => {
    const response = await axios.get(process.env.REACT_APP_BASE_URL + "/Tar/show");
    if (response.status === 200) {
      setData(response.data);
    }
  };

  const handleSearchTerm = (e) => {
    setSearch(e.target.value);
  };

  const handleEdit = (tarif) => {
    setSelectedTarif(tarif);
    setNewTarif({
      baseFare: tarif.baseFare,
      farePerKm: tarif.farePerKm,
      farePerMinute: tarif.farePerMinute,
    });
    setIsModalOpen(true);
  };

  const handleUpdate = async () => {
    try {
      const response = await axios.put(process.env.REACT_APP_BASE_URL + `/Tar/update`, {
        tarifId: selectedTarif.id,
        ...newTarif,
      });
      if (response.status === 200) {
        toast.success("Tarif mis à jour avec succès !");
        setIsModalOpen(false);
        getUsers();
      }
    } catch (error) {
      toast.error("Échec de la mise à jour du tarif.");
    }
  };

  const handleAddTarif = async () => {
    if (isAddingTarif) {
      try {
        const response = await axios.post(process.env.REACT_APP_BASE_URL + `/Tar/tarif`, {
          ...newTarif,
        });
        if (response.status === 200) {
          toast.success("Nouveau tarif ajouté avec succès !");
          setIsAddingTarif(false);
          setNewTarif({ baseFare: "", farePerKm: "", farePerMinute: "" });
          getUsers();
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
              onChange={(e) => setNewTarif({ ...newTarif, farePerMinute: e.target.value })}
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
          `${val.baseFare}${val.farePerKm}${val.farePerMinute}`.includes(search)
        )}
        columns={[
          { field: "baseFare", headerName: "Base Fare", width: 120 },
          { field: "farePerKm", headerName: "Fare Per Km", width: 120 },
          { field: "farePerMinute", headerName: "Fare Per Minute", width: 150 },
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
                  <label className="form-label">Base Fare :</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newTarif.baseFare}
                    onChange={(e) => setNewTarif({ ...newTarif, baseFare: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Fare Per Km :</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newTarif.farePerKm}
                    onChange={(e) => setNewTarif({ ...newTarif, farePerKm: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Fare Per Minute :</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newTarif.farePerMinute}
                    onChange={(e) => setNewTarif({ ...newTarif, farePerMinute: e.target.value })}
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
