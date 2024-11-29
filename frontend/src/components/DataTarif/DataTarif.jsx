import React, { useState, useEffect } from "react";
import "./datatarif.scss";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";

const DataTarif = () => {
  const [data, setData] = useState({ day: [], night: [] });
  const [search, setSearch] = useState("");
  const [tarif, setTarif] = useState({ type: "day", baseFare: "", farePerKm: "", farePerMinute: "", id: null });
  const [modalOpen, setModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const apiBaseURL = process.env.REACT_APP_BASE_URL;

  const fetchData = async (type) => {
    const endpoint = `${apiBaseURL}/Tar${type === "day" ? "j" : "n"}/`;
    const response = await axios.get(endpoint);
    setData((prevData) => ({ ...prevData, [type]: response.data }));
  };

  useEffect(() => {
    fetchData("day");
    fetchData("night");
  }, []);

  const handleSave = async () => {
    const endpoint = `${apiBaseURL}/Tar${tarif.type === "day" ? "j" : "n"}/${
      tarif.id ? "update" : "tarif"
    }`;
    const method = tarif.id ? "put" : "post";

    try {
      await axios[method](endpoint, tarif);
      toast.success(
        `${tarif.id ? "Tarif mis à jour" : "Nouveau tarif ajouté"} pour ${
          tarif.type === "day" ? "jour" : "nuit"
        } !`
      );
      setModalOpen(false);
      setIsAdding(false);
      setTarif({ type: "day", baseFare: "", farePerKm: "", farePerMinute: "", id: null });
      fetchData(tarif.type);
    } catch {
      toast.error("Erreur lors de l'opération.");
    }
  };

  const handleEdit = (row, type) => {
    setTarif({ ...row, type, id: row.id });
    setModalOpen(true);
  };

  return (
    <div className="datatable">
      <input
        type="text"
        placeholder="Rechercher..."
        onChange={(e) => setSearch(e.target.value)}
        className="form-control mb-3"
      />
      {isAdding && (
        <div className="mb-3 d-flex">
          <select
            className="form-control me-2"
            value={tarif.type}
            onChange={(e) => setTarif({ ...tarif, type: e.target.value })}
          >
            <option value="day">Tarif de jour</option>
            <option value="night">Tarif de nuit</option>
          </select>
          {["Base Fare", "Fare Per Km", "Fare Per Minute"].map((label, i) => (
            <input
              key={i}
              type="text"
              placeholder={label}
              value={tarif[["baseFare", "farePerKm", "farePerMinute"][i]]}
              onChange={(e) =>
                setTarif({ ...tarif, [["baseFare", "farePerKm", "farePerMinute"][i]]: e.target.value })
              }
              className="form-control me-2"
            />
          ))}
          <button className="btn btn-primary" onClick={handleSave}>
            Soumettre
          </button>
        </div>
      )}
      <button className="btn btn-primary mb-3" onClick={() => setIsAdding(!isAdding)}>
        {isAdding ? "Annuler" : "Ajouter un tarif"}
      </button>
      {["day", "night"].map((type) => (
        <div key={type}>
          <h3>Tarifs de {type === "day" ? "jour" : "nuit"}</h3>
          <DataGrid
            className="datagrid mb-4"
            rows={data[type].filter(({ baseFare, farePerKm, farePerMinute }) =>
              `${baseFare}${farePerKm}${farePerMinute}`.includes(search)
            )}
            columns={[
              { field: "baseFare", headerName: "Base Fare", width: 120 },
              { field: "farePerKm", headerName: "Fare Per Km", width: 120 },
              { field: "farePerMinute", headerName: "Fare Per Minute", width: 150 },
              {
                field: "action",
                headerName: "Action",
                width: 150,
                renderCell: ({ row }) => (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleEdit(row, type)}
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
        </div>
      ))}
      {modalOpen && (
        <div className="modal show d-block">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Modifier le tarif ({tarif.type === "day" ? "jour" : "nuit"})</h5>
                <button className="btn-close" onClick={() => setModalOpen(false)}></button>
              </div>
              <div className="modal-body">
                {["Base Fare", "Fare Per Km", "Fare Per Minute"].map((label, i) => (
                  <div key={i} className="mb-3">
                    <label>{label} :</label>
                    <input
                      type="text"
                      className="form-control"
                      value={tarif[["baseFare", "farePerKm", "farePerMinute"][i]]}
                      onChange={(e) =>
                        setTarif({
                          ...tarif,
                          [["baseFare", "farePerKm", "farePerMinute"][i]]: e.target.value,
                        })
                      }
                    />
                  </div>
                ))}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Annuler
                </button>
                <button className="btn btn-primary" onClick={handleSave}>
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
