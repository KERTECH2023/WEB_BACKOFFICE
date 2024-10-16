import React, { useState, useEffect } from "react";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import { InvoiceColumns } from "../../DataTableInvoice";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./dataFacture.css";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import RefreshIcon from "@mui/icons-material/Refresh";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

const DataFact = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearch(params.get("search") || "");
    setSelectedMonth(params.get("month") || "");
    setSelectedYear(params.get("year") || "");
  }, [location]);

  useEffect(() => {
    getUsers();
  }, []);

  const handleSearchTerm = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    updateURL({ search: value });
  };

  const handleMonthFilter = (e) => {
    setSelectedMonth(e.target.value);
    updateURL({ month: e.target.value });
  };

  const handleYearFilter = (e) => {
    setSelectedYear(e.target.value);
    updateURL({ year: e.target.value });
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
    navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true });
  };

  useEffect(() => {
    const filtered = data.filter((row) => {
      const matchesSearch =
        (row.chauffeurName &&
          row.chauffeurName.toLowerCase().includes(search)) ||
        (row.chauffeurPrenom &&
          row.chauffeurPrenom.toLowerCase().includes(search));

      const matchesMonth = selectedMonth
        ? row.Month === parseInt(selectedMonth, 10)
        : true;

      const matchesYear = selectedYear
        ? row.Year === parseInt(selectedYear, 10)
        : true;

      return matchesSearch && matchesMonth && matchesYear;
    });

    setFilteredData(filtered);
  }, [search, selectedMonth, selectedYear, data]);

  const getUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching factures...");
      const response = await axios.get(process.env.REACT_APP_BASE_URL + "/Chauff/factures");
      if (response.status === 200) {
        const factures = response.data;
        console.log("Factures fetched:", factures);

        const enhancedFactures = await Promise.all(
          factures.map(async (facture) => {
            if (!facture.chauffeur) {
              return { ...facture, chauffeurName: "N/A", chauffeurPrenom: "N/A" };
            }
            try {
              const [chauffeurResponse, rideRequestsResponse] = await Promise.all([
                axios.get(process.env.REACT_APP_BASE_URL + `/Chauff/searchchauf/${facture.chauffeur}`),
                axios.get(process.env.REACT_APP_BASE_URL + `/Chauff/rideCounts?driverPhone=${facture.chauffeur}`)
              ]);

              const chauffeurData = chauffeurResponse.data;
              const rideCounts = rideRequestsResponse.data;

              return {
                ...facture,
                chauffeurName: chauffeurData.Nom,
                chauffeurPrenom: chauffeurData.Prenom,
                chauffeurEmail: chauffeurData.email,
                chauffeurPhone: chauffeurData.phone,
                photoAvatar: chauffeurData.photoAvatar,
                acceptedRides: rideCounts.accepted,
                cancelledRides: rideCounts.cancelled,
              };
            } catch (error) {
              console.error(`Error fetching data for ${facture.chauffeur}:`, error);
              return facture;
            }
          })
        );

        setData(enhancedFactures);
      }
    } catch (error) {
      console.error("Error fetching factures:", error);
      setError("Une erreur est survenue lors de la récupération des factures.");
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    getUsers();
  };

  const handleExport = () => {
    // Implement export functionality here
    toast.info("Fonctionnalité d'exportation à implémenter");
  };

  const actionColumn = [
    {
      field: "action",
      headerName: "Action",
      width: 300,
      renderCell: (params) => {
        const role = window.localStorage.getItem("userRole");
        return (
          <div className="cellAction">
            {(role === "Admin" || role === "Agentad") && (
              <>
                <Link
                  to={`/consultF/${params.row._id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div className="viewButton">Consulter</div>
                </Link>
              </>
            )}
          </div>
        );
      },
    },
  ];

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <div>Erreur : {error}</div>;
  }

  return (
    <div className="datatable">
      <div className="datatableTitle">
        Liste des Factures
        <div>
          <Button startIcon={<RefreshIcon />} onClick={handleRefresh}>
            Rafraîchir
          </Button>
          <Button startIcon={<FileDownloadIcon />} onClick={handleExport}>
            Exporter
          </Button>
        </div>
      </div>
      <div className="filters">
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
        <select
          onChange={handleMonthFilter}
          value={selectedMonth}
          className="filterSelect"
        >
          <option value="">Tous les mois</option>
          {[...Array(12)].map((_, i) => (
            <option key={i} value={i + 1}>
              {new Date(0, i).toLocaleString('default', { month: 'long' })}
            </option>
          ))}
        </select>
        <select
          onChange={handleYearFilter}
          value={selectedYear}
          className="filterSelect"
        >
          <option value="">Toutes les années</option>
          {[...Array(5)].map((_, i) => {
            const year = new Date().getFullYear() + i;
            return (
              <option key={year} value={year}>
                {year}
              </option>
            );
          })}
        </select>
      </div>

      <DataGrid
        className="datagrid"
        rows={filteredData}
        columns={InvoiceColumns.concat(actionColumn)}
        pageSize={9}
        rowsPerPageOptions={[9]}
        checkboxSelection
        getRowId={(row) => row._id}
      />
      <ToastContainer />
    </div>
  );
};

export default DataFact;
