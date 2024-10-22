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
    fetchFactures();
  }, []);

  const fetchFactures = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer toutes les factures
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/Chauff/factures`);
      if (response.status === 200) {
        const factures = response.data;
        console.log("Factures fetched:", factures);
        setData(factures);
        setFilteredData(factures); // Initialiser filteredData avec toutes les factures
      }
    } catch (error) {
      console.error("Error with factures:", error);
      setError("Une erreur est survenue lors de la gestion des factures.");
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedMonth && !selectedYear) {
      // Si aucun filtre n'est sélectionné, afficher toutes les factures
      setFilteredData(data);
      return;
    }

    // Appliquer le filtre si un mois ou une année est sélectionné
    const filtered = data.filter((facture) => {
      const dateEcheance = new Date(facture.dateEcheance.$date); // Format correct pour extraire la date

      // Filtrer en fonction du mois et de l'année sélectionnés
      const matchMonth = selectedMonth ? dateEcheance.getMonth() + 1 === parseInt(selectedMonth) : true;
      const matchYear = selectedYear ? dateEcheance.getFullYear() === parseInt(selectedYear) : true;

      return matchMonth && matchYear;
    });

    console.log("Filtered data:", filtered);
    setFilteredData(filtered);
  }, [selectedMonth, selectedYear, data]);

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

  const handleRefresh = () => {
    fetchFactures();
  };

  const handleExport = () => {
    toast.info("Fonctionnalité d'exportation à implémenter");
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const columns = [
    { field: "numero", headerName: "Numéro", width: 150 },
    {
      field: "nomChauffeur", 
      headerName: "Nom du chauffeur", 
      width: 200,
      valueGetter: (params) => `${params.row.nomChauffeur || ''}`,
    },
    { 
      field: "periode", 
      headerName: "Période", 
      width: 150,
      valueGetter: (params) => {
        const mois = new Date(0, params.row.mois - 1).toLocaleString('fr-FR', { month: 'long' });
        return `${mois} ${params.row.annee}`;
      }
    },
    { field: "nbTrajet", headerName: "Nombre de trajets", width: 150 },
    {
      field: "montantTTC",
      headerName: "Montant TTC",
      width: 130,
      valueFormatter: (params) => {
        if (params.value == null) {
          return '';
        }
        return `${params.value.toFixed(2)} DT`;
      },
    },
    {
      field: "fraisDeService",
      headerName: "Frais de service",
      width: 130,
      valueFormatter: (params) => {
        if (params.value == null) {
          return '';
        }
        return `${params.value.toFixed(2)} DT`;
      },
    },
    {
      field: "dateEcheance",
      headerName: "Date d'échéance",
      width: 130,
      valueGetter: (params) => formatDate(params.row.dateEcheance.$date), // Corrigé pour extraire le champ $date
    },
    {
      field: "status",
      headerName: "Status",
      width: 130,
      renderCell: (params) => (
        <div className={`status ${params.value ? params.value.toLowerCase() : ''}`}>
          {params.value}
        </div>
      ),
    },
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
        columns={columns}
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
