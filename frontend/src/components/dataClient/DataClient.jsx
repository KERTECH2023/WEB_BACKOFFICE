/* eslint-disable no-unused-vars */
import "./dataclient.scss";
import { DataGrid } from "@mui/x-data-grid";
import { ClientColumns } from "../../datatableClient";
import { Link } from "react-router-dom";
import { React, useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import "react-toastify/dist/ReactToastify.css";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDgBbTBbjIo8hVD128y5TG9FswyZVO8XGE",
  authDomain: "prd-transport.firebaseapp.com",
  databaseURL: "https://prd-transport-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "prd-transport",
  storageBucket: "prd-transport.appspot.com",
  messagingSenderId: "824880668007",
  appId: "1:824880668007:web:91bd07b347a51542c0a3c2",
  measurementId: "G-Q8X6MDK1V9",
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

const DataClient = () => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const role = window.localStorage.getItem("userRole");
  console.log("role**", role);

  useEffect(() => {
    getUsers();
  }, []);

  const getUsers = () => {
    const db = getDatabase(app); // Utilisation de l'app Firebase initialisée
    const usersRef = ref(db, "Users");
    onValue(usersRef, (snapshot) => {
      const usersData = snapshot.val();
      if (usersData) {
        const usersArray = Object.keys(usersData).map((key) => ({
          id: key,
          ...usersData[key],
        }));
        setData(usersArray);
      }
    });
  };

  console.log("data=>", data);

  const handleSearchTerm = (e) => {
    let value = e.target.value;
    setSearch(value);
  };
  console.log(search);

  const actionColumn = [
    {
      field: "action",
      headerName: "Action",
      width: 300,
      renderCell: (params) => {
        return (
          <div className="cellAction">
            <Link
              to={`/ConsultCL/${params.row.id}`}
              style={{ textDecoration: "none" }}
            >
              <div className="viewButton">Consulté</div>
            </Link>
            <div>
              {(role === "Admin" || role === "Agentad") && (
                <Link
                  to={`/updateClient/${params.row.id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div className="upButton">Mettre à jour</div>
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
          const clientName = val.name.toLowerCase();
          const clientPhone = val.phone.toLowerCase();

          return (
            clientName.includes(searchTerm) || clientPhone.includes(searchTerm)
          );
        })}
        columns={ClientColumns.concat(actionColumn)}
        pageSize={9}
        rowsPerPageOptions={[9]}
        checkboxSelection
      />
      <ToastContainer />
    </div>
  );
};

export default DataClient;
