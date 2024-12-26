import "./datachauf.scss";
import { DataGrid } from "@mui/x-data-grid";
import { Link } from "react-router-dom";
import {React, useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import "react-toastify/dist/ReactToastify.css";

// Define ChaufColumns with address field
export const ChaufColumns = [
  { field: "id", headerName: "ID", width: 70 },
  { field: "Nom", headerName: "Nom", width: 130 },
  { field: "Prenom", headerName: "Prenom", width: 130 },
  { field: "phone", headerName: "Téléphone", width: 130 },
  { 
    field: "address", 
    headerName: "Adresse", 
    width: 200,
    renderCell: (params) => (
      <div className="cellAddress">
        {params.row.address || "Non spécifié"}
      </div>
    )
  }
];

const Datachauf = () => {
  const [data, setData] = useState([]);
  const [search, setsearch] = useState("");
  const role = window.localStorage.getItem("userRole");

  useEffect(() => {
    getUsers();
  }, []);

  const getUsers = async () => {
    const response = await axios.get(process.env.REACT_APP_BASE_URL + "/Chauff/affiche");
    if(response.status === 200) {
      setData(response.data);
    }
  };

  const handleSearchTerm = (e) => {
    let value = e.target.value;
    setsearch(value);
  };

  const actionColumn = [
    {
      field: "action",
      headerName: "Action",
      width: 300,
      renderCell: (params) => {
        return (
          <div className="cellAction">
            <Link to={`/cosnultC/${params.row.id}`} style={{ textDecoration: "none", color: "inherit"}}>
              <div className="viewButton">Consulté</div>
            </Link>
            
            <div>
              {(role === "Admin" || role === "Agentad") && (
                <>
                  <Link to={`/updateCh/${params.row.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                    <div className="upButton">Mettre a jour</div>
                  </Link>
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
        <Link to="/Chauffeur/new" className="link">
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
          const chauffAddress = (val.address || "").toLowerCase();
          
          return chauffName.includes(searchTerm) || 
                 chauffprenom.includes(searchTerm) ||
                 chauffphone.includes(searchTerm) ||
                 chauffAddress.includes(searchTerm);
        })}
        columns={ChaufColumns.concat(actionColumn)}
        pageSize={9}
        rowsPerPageOptions={[9]}
        checkboxSelection
      />
      <ToastContainer />
    </div>
  );
}

export default Datachauf;
