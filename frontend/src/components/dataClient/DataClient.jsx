
import "./dataclient.scss"
import { DataGrid } from "@mui/x-data-grid";
import { ClientColumns } from "../../datatableClient";
import { Link } from "react-router-dom";
import {React, useState,useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import "react-toastify/dist/ReactToastify.css";

const DataClient = () => {
    const [data, setData] = useState([]);
    const [search, setsearch] = useState("");
    const role = window.localStorage.getItem("userRole");

    const syncFirebaseMongo = async () => {
      try {
        const response = await axios.post(process.env.REACT_APP_BASE_URL + "/Client/syncFirebaseMongo");
        if (response.status === 200) {
          toast.success('Synchronisation réussie');
          getUsers(); // Recharger les données
        }
      } catch (error) {
        toast.error('Erreur de synchronisation');
        console.error(error);
      }
    };
    
    useEffect(() => {
      syncFirebaseMongo(); // Synchroniser au chargement
      getUsers();
    }, []);

    const getUsers = async () => {
      try {
        const response = await axios.get(process.env.REACT_APP_BASE_URL + "/Client/afficheCl");
        if(response.status === 200) {
          setData(response.data)
        }
      } catch (error) {
        toast.error('Erreur de chargement des clients');
      }
    };

    const handleSearchTerm = (e) => {
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
              <Link to={`/ConsultCL/${params.row.id}`} style={{ textDecoration: "none" }}>
                <div className="viewButton">Consulté</div>
              </Link>
              <div>
                {(role === "Admin" || role === "Agentad") && (
                  <Link to={`/updateClient/${params.row.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                    <div className="upButton">Mettre a jour</div>
                  </Link>
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
          Listes Des Clients
          <Link to="/Client/newCL" className="link">
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
            
            return chauffName.includes(searchTerm) || 
                   chauffprenom.includes(searchTerm) ||
                   chauffphone.includes(searchTerm);
          })}
          columns={ClientColumns.concat(actionColumn)}
          pageSize={9}
          rowsPerPageOptions={[9]}
          checkboxSelection
        />
        <ToastContainer />
      </div>
    );
}

export default DataClient
