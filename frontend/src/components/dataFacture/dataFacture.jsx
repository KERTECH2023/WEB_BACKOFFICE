import React, { useState, useEffect } from "react";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useLocation } from "react-router-dom";
import "./dataFacture.css";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import RefreshIcon from "@mui/icons-material/Refresh";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

const DataFact = () => {
  const [data, setData] = useState([]); // Toutes les factures
  const [filteredData, setFilteredData] = useState([]); // Factures filtrées
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    generateAndGetFactures();
  }, []);

  // Récupérer toutes les factures une seule fois
  const generateAndGetFactures = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer toutes les factures sans filtre
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/Chauff/factures/all`);
      if (response.status === 200) {
        const factures = response.data;
        setData(factures); // Stocker toutes les factures
        filterData(factures); // Appliquer le filtre
      }
    } catch (error) {
      console.error("Erreur avec les factures :", error);
      setError("Une erreur est survenue lors de la gestion des factures.");
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  // Appliquer le filtre par mois, année et recherche
  const filterData = (factures) => {
    const filtered = factures.filter((facture) => {
      const matchesSearch = facture.nomChauffeur.toLowerCase().includes(search.toLowerCase()) ||
                            facture.numero.toLowerCase().includes(search.toLowerCase());
      const matchesMonth = facture.mois === parseInt(selectedMonth);
      const matchesYear = facture.annee === parseInt(selectedYear);
      
      return matchesSearch && matchesMonth && matchesYear;
    });
    setFilteredData(filtered);
  };

  // Filtrer à chaque changement de mois, d'année ou de recherche
  useEffect(() => {
    filterData(data); // Appliquer le filtre aux données récupérées
  }, [search, selectedMonth, selectedYear]);

  const handleSearchTerm = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
  };

  const handleMonthFilter = (e) => {
    setSelectedMonth(e.target.value);
  };

  const handleYearFilter = (e) => {
    setSelectedYear(e.target.value);
  };

  const handleRefresh = () => {
    generateAndGetFactures();
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
      valueGetter: (params) => formatDate(params.row.dateEcheance),
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
                <a href={`/consultF/${params.row._id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <div className="viewButton">Consulter</div>
                </a>
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

        <select onChange={handleMonthFilter} value={selectedMonth} className="filterSelect">
          {[...Array(12)].map((_, i) => (
            <option key={i} value={i + 1}>
              {new Date(0, i).toLocaleString('default', { month: 'long' })}
            </option>
          ))}
        </select>

        <select onChange={handleYearFilter} value={selectedYear} className="filterSelect">
          {[...Array(5)].map((_, i) => {
            const year = new Date().getFullYear() - i;
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
