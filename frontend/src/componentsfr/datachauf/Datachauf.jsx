/* eslint-disable no-unused-vars */
import "./datachauf.scss";
import { DataGrid } from "@mui/x-data-grid";
import { ChaufColumns } from "../../datatablechauf";
import { Link } from "react-router-dom";
import { React, useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import "react-toastify/dist/ReactToastify.css";

const Datachauf = () => {
  const [data, setData] = useState([]);
  const [search, setsearch] = useState("");
  const role = window.localStorage.getItem("userRole");
  console.log("role**", role);

  useEffect(() => {
    getUsers();
  }, []);

  const getUsers = async () => {
    const response = await axios.get(process.env.REACT_APP_BASE_URL + "/Chaufffr/affiche");
    if (response.status === 200) {
      setData(response.data);
    }
  };

  const handleSearchTerm = (e) => {
    console.log(e.target.value);
    setsearch(e.target.value);
  };

  const actionColumn = [
    {
      field: "action",
      headerName: "Action",
      width: 300,
      renderCell: (params) => {
        return (
          <div className="cellAction">
            <Link to={`/cosnultCfr/${params.row.id}`} style={{ textDecoration: "none", color: "inherit" }}>
              <div className="viewButton">Consulté</div>
            </Link>
            <div>
              {(role === "Admin" || role === "Agentad") && (
                <>
                  <Link to={`/updateChfr/${params.row.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                    <div className="upButton">Mettre a jour </div>
                  </Link>
                </>
              )}
            </div>

            <div>
              {(role === "Admin" || role === "Agentad") && (
                <>
                  {(params.row.Cstatus === "Validé") && (
                  <Link to={`/renitialisemotpassChfr/${params.row.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                    <div className="upButton">Change password<</div>
                  </Link> 
                )}
                </>
              )}
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <div className="datatable">
      <div className="datatableTitle">
        Listes Des Chauffeurs
        <Link to="/Chauffeurfr/new" className="link">
          Ajouter
        </Link>
      </div>

      <div className="search">
        <input
          type="text"
          placeholder="Search..."
          onChange={handleSearchTerm}
          name="Search"
          id="Search"
          className="find"
        />
        <SearchOutlinedIcon />
      </div>

      <DataGrid
        className="datagrid"
        rows={data.filter((val) => {
          const searchTerm = search.toLowerCase();
          const chauffName = val.Nom.toLowerCase();
          const chauffprenom = val.Prenom.toLowerCase();
          const chauffphone = val.phone.toLowerCase();
          const chauffaddress = val.address.toLowerCase(); // Include address in search
          const Cstatus = val.Cstatus.toLowerCase();
          return (
            chauffName.includes(searchTerm) ||
            chauffprenom.includes(searchTerm) ||
            chauffphone.includes(searchTerm) ||
            chauffaddress.includes(searchTerm) ||
            Cstatus.includes(searchTerm) 
          );
        })}
        columns={ChaufColumns.concat(actionColumn)}
        pageSize={9}
        rowsPerPageOptions={[9]}
        checkboxSelection
      />
      <ToastContainer />
    </div>
  );
};

export default Datachauf;
