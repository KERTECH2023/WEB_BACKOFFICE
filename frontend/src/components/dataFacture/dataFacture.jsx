import React, { useState, useEffect } from "react";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./dataFacture.css";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import RefreshIcon from "@mui/icons-material/Refresh";

const BalanceActions = ({ row, role, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newBalance, setNewBalance] = useState(row.solde);

  const handleUpdateClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    onUpdate(row.firebaseUID, newBalance);
    setIsEditing(false);
  };

  return (
    <div className="cellAction">
      <Link
        to={`/consultC/${row.id}`}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <div className="viewButton">Consulté</div>
      </Link>
      {(role === "Admin" || role === "Agentad") &&
        (isEditing ? (
          <>
            <input
              type="number"
              value={newBalance}
              onChange={(e) => setNewBalance(e.target.value)}
              style={{ width: "100px", marginRight: "10px" }}
            />
            <Button onClick={handleSaveClick} variant="contained" size="small">
              Enregistrer
            </Button>
          </>
        ) : (
          <Button onClick={handleUpdateClick} variant="outlined" size="small">
            Modifier Solde
          </Button>
        ))}
    </div>
  );
};

const Datachauf = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [totalSolde, setTotalSolde] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const role = window.localStorage.getItem("userRole");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearch(params.get("search") || "");
  }, [location]);

  useEffect(() => {
    getChauffeurs();
    getTotalSolde();
  }, []);

  const getTotalSolde = async () => {
    try {
      const response = await axios.get(
        "https://api.backofficegc.com/Solde/soldetotal"
      );
      setTotalSolde(response.data?.totalSolde || "N/A");
    } catch (error) {
      console.error("Error fetching total balance:", error);
      toast.error("Erreur lors du chargement du solde total");
    }
  };

  const getDriverBalance = async (firebaseUID) => {
    try {
      const response = await axios.get(
        `https://api.backofficegc.com/Solde/solde/${firebaseUID}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching balance for driver ${firebaseUID}:`, error);
      return null;
    }
  };

  const enrichDataWithBalance = async (drivers) => {
    const enrichedDrivers = await Promise.all(
      drivers.map(async (driver) => {
        if (driver.firebaseUID) {
          const balanceData = await getDriverBalance(driver.firebaseUID);
          return {
            ...driver,
            solde: balanceData ? balanceData.solde : "N/A",
          };
        }
        return {
          ...driver,
          solde: "N/A",
        };
      })
    );
    return enrichedDrivers;
  };

  const handleSearchTerm = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    updateURL({ search: value });
  };

  const updateURL = (params) => {
    const searchParams = new URLSearchParams(location.search);
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        searchParams.set(key, value);
      } else {
        searchParams.delete(key);
      }
    });
    navigate(`${location.pathname}?${searchParams.toString()}`, {
      replace: true,
    });
  };

  const getChauffeurs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        process.env.REACT_APP_BASE_URL + "/Chauff/affiche"
      );
      if (response.status === 200) {
        const validatedDrivers = response.data.filter(
          (driver) => driver.Cstatus === "Validé"
        );
        const driversWithBalance = await enrichDataWithBalance(validatedDrivers);
        setData(driversWithBalance);
        setFilteredData(driversWithBalance);
      }
    } catch (error) {
      console.error("Error fetching chauffeurs:", error);
      setError("Une erreur est survenue lors du chargement des chauffeurs.");
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

const updateDriverBalance = async (firebaseUID, addedBalance) => {
    try {
        // Récupérer le solde actuel du chauffeur
        const response = await axios.get(
            `https://api.backofficegc.com/Solde/solde/${firebaseUID}`
        );
        const currentBalance = response.data?.solde || 0;
        
        // Calculer le nouveau solde en ajoutant la valeur saisie
        const newBalance = parseFloat(currentBalance) + parseFloat(addedBalance);

        // Mettre à jour le solde
        await axios.put(
            `https://api.backofficegc.com/Solde/update/${firebaseUID}`,
            {
                solde: newBalance,
            }
        );
        
        toast.success("Solde mis à jour avec succès !");
        getChauffeurs();
    } catch (error) {
        console.error(`Error updating balance for driver ${firebaseUID}:`, error);
        toast.error("Erreur lors de la mise à jour du solde");
    }
};

  const handleRefresh = () => {
    getChauffeurs();
    getTotalSolde();
  };

  const columns = [
    { field: "Nom", headerName: "Nom", width: 150 },
    { field: "Prenom", headerName: "Prénom", width: 150 },
    { field: "phone", headerName: "Téléphone", width: 130 },
    { field: "address", headerName: "Adresse", width: 200 },
    {
      field: "solde",
      headerName: "Solde",
      width: 130,
      valueFormatter: (params) => {
        if (params.value === "N/A") return "N/A";
        return `${Number(params.value).toFixed(2)} DT`;
      },
    },
    {
      field: "action",
      headerName: "Action",
      width: 400,
      renderCell: (params) => (
        <BalanceActions
          row={params.row}
          role={role}
          onUpdate={updateDriverBalance}
        />
      ),
    },
  ];

  useEffect(() => {
    const validatedDrivers = data.filter((driver) => driver.Cstatus === "Validé");
    const searchFiltered = validatedDrivers.filter((row) => {
      const searchTerm = search.toLowerCase();
      return (
        (row.Nom && row.Nom.toLowerCase().includes(searchTerm)) ||
        (row.Prenom && row.Prenom.toLowerCase().includes(searchTerm)) ||
        (row.phone && row.phone.toLowerCase().includes(searchTerm)) ||
        (row.address && row.address.toLowerCase().includes(searchTerm))
      );
    });


    const sortedData = searchFiltered.sort((a, b) => {
  const soldeA = parseFloat(a.solde) || 0;
  const soldeB = parseFloat(b.solde) || 0;
  return soldeA - soldeB;
});

    setFilteredData(sortedData);
  }, [search, data]);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <div>Erreur : {error}</div>;
  }

  return (
    <div className="datatable">
      <div
        style={{
          backgroundColor: "#ffffff",
          padding: "15px",
          marginBottom: "20px",
          textAlign: "center",
          borderRadius: "4px",
          border: "1px solid #e0e0e0",
        }}
      >
        <div style={{ fontSize: "18px", marginBottom: "5px" }}>Solde Total</div>
        <div style={{ fontSize: "24px", fontWeight: "bold" }}>
          {totalSolde !== null ? `${totalSolde} DT` : "Chargement..."}
        </div>
      </div>

      <div className="datatableTitle">
        Liste Des Chauffeurs Validés
        <div>
          <Link to="/Chauffeur/new" className="link">
            Ajouter
          </Link>
          <Button
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            style={{ marginLeft: "10px" }}
          >
            Rafraîchir
          </Button>
        </div>
      </div>

      <div className="search">
        <input
          type="text"
          placeholder="Rechercher..."
          onChange={handleSearchTerm}
          value={search}
          className="find"
        />
        <SearchOutlinedIcon />
      </div>

      <DataGrid
        className="datagrid"
        rows={filteredData}
        columns={columns}
        pageSize={9}
        rowsPerPageOptions={[9]}
        checkboxSelection
        getRowId={(row) => row.id}
      />
      <ToastContainer />
    </div>
  );
};

export default Datachauf;
