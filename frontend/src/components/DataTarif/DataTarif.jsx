import React, { useState, useEffect } from "react";
import "./datatarif.scss";
import { DataGrid } from "@mui/x-data-grid";
import { TarifColumns } from "../../datatarif";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";

const DataTarif = () => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedTarif, setSelectedTarif] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTarif, setNewTarif] = useState("");
  const [newTarifMaj, setNewTarifMaj] = useState("");
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
    setNewTarif(tarif.tarif);
    setNewTarifMaj(tarif.tarifmaj);
    setIsModalOpen(true);
  };

  const handleUpdate = async () => {
    try {
      const response = await axios.put(process.env.REACT_APP_BASE_URL + `/Tar/update`, {
        tarifId: selectedTarif.id,
        newTarif,
        newTarifMaj,
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
          tarif: newTarif,
          tarifMaj: newTarifMaj,
        });
        if (response.status === 200) {
          toast.success("Nouveau tarif ajouté avec succès !");
          setIsAddingTarif(false);
          setNewTarif("");
          setNewTarifMaj("");
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
              placeholder="Entrer le tarif du jour"
              value={newTarif}
              onChange={(e) => setNewTarif(e.target.value)}
              className="form-control me-2"
            />
            <input
              type="text"
              placeholder="Entrer le tarif après majoration"
              value={newTarifMaj}
              onChange={(e) => setNewTarifMaj(e.target.value)}
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
        rows={data.filter((val) => val.tarif.includes(search))}
        columns={[
          ...TarifColumns,
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
                  <label htmlFor="tarif" className="form-label">
                    Tarif du jour :
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="tarif"
                    value={newTarif}
                    onChange={(e) => setNewTarif(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="tarifMaj" className="form-label">
                    Tarif après majoration :
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="tarifMaj"
                    value={newTarifMaj}
                    onChange={(e) => setNewTarifMaj(e.target.value)}
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
