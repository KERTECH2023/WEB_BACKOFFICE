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

  useEffect(() => {
    getUsers();
  }, []);

  const getUsers = async () => {
    const response = await axios.get("http://localhost:3001/Tar/show");
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
      const response = await axios.put(`http://localhost:3001/Tar/update`, {
        tarifId: selectedTarif.id,
        newTarif,
        newTarifMaj,
      });
      console.log(data.id);
      if (response.status === 200) {
        toast.success("Tarif updated successfully!");
        setIsModalOpen(false);
        getUsers(); // Refresh data
      }
    } catch (error) {
      toast.error("Failed to update tarif.");
    }
  };

  return (
    <div className="datatable">
      <div className="search mb-3">
        <input
          type="text"
          placeholder="Search..."
          onChange={handleSearchTerm}
          name="Search"
          id="Search"
          className="form-control"
        />
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
                Modify
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
                <h5 className="modal-title">Edit Tarif</h5>
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
                    Tarif:
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
                    Tarif Majoration:
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
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleUpdate}
                >
                  Update
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
