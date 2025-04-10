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
  const [search, setSearch] = useState("");
  const role = window.localStorage.getItem("userRole");
  console.log("role**", role);

  // Fetch data from the API
  useEffect(() => {
    getUsers();
  }, []);

  const getUsers = async () => {
    try {
      const response = await axios.get(process.env.REACT_APP_BASE_URL + "/Chauff/affiche");
      if (response.status === 200) {
        // Inverser les données avant de les définir
        setData(response.data.reverse());
      } else {
        toast.error("Failed to fetch data!");
      }
    } catch (error) {
      toast.error("An error occurred while fetching data!");
      console.error("Error fetching data:", error);
    }
  };
  

  // Handle search term change
  const handleSearchTerm = (e) => {
    setSearch(e.target.value);
  };

  // Columns for action buttons (view, update, change password)
  const actionColumn = [
    {
      field: "action",
      headerName: "Action",
      width: 300,
      renderCell: (params) => {
        return (
          <div className="cellAction">
            <Link to={`/cosnultC/${params.row.id}`} style={{ textDecoration: "none", color: "inherit" }}>
              <div className="viewButton">Consulté</div>
            </Link>
            <div>
              {(role === "Admin" || role === "Agentad") && (
                <Link to={`/updateCh/${params.row.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <div className="upButton">Mettre à jour</div>
                </Link>
              )}
            </div>
            <div>
              {(role === "Admin" || role === "Agentad") && params.row.Cstatus === "Validé" && (
                <Link to={`/renitialisemotpassCh/${params.row.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <div className="upButton">Change password</div>
                </Link>
              )}
            </div>
          </div>
        );
      },
    },
  ];

  // Ajout ou modification de la largeur de la colonne 'phone' dans ChaufColumns
  const ChaufColumnsUpdated = ChaufColumns.map((column) => {
    if (column.field === "phone") {
      return {
        ...column,
        width: 220, // Augmente la largeur de la colonne du téléphone
        minWidth: 180, // Ajoute un minWidth pour éviter que la colonne soit trop petite
        flex: 1, // Assure une largeur flexible si nécessaire
      };
    }
    return column;
  });

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
          value={search}
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
          return (
            val.Nom.toLowerCase().includes(searchTerm) ||
            val.Prenom.toLowerCase().includes(searchTerm) ||
            val.phone.toLowerCase().includes(searchTerm) ||
            val.address.toLowerCase().includes(searchTerm) ||
            val.Cstatus.toLowerCase().includes(searchTerm)
          );
        })}
        columns={ChaufColumnsUpdated.concat(actionColumn)}
        pageSize={9}
        rowsPerPageOptions={[9]}
        checkboxSelection
      />
      <ToastContainer />
    </div>
  );
};

export default Datachauf;
