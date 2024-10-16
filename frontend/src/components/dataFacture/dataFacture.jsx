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
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearch(params.get("search") || "");
    setSelectedMonth(params.get("month") || new Date().getMonth() + 1);
    setSelectedYear(params.get("year") || new Date().getFullYear());
  }, [location]);

  useEffect(() => {
    getFactures();
  }, [selectedMonth, selectedYear]);

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
        (row.nomChauffeur && row.nomChauffeur.toLowerCase().includes(search));

      return matchesSearch;
    });

    setFilteredData(filtered);
  }, [search, data]);

  const getFactures = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching factures...");
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/Chauff/factures?month=${selectedMonth}&year=${selectedYear}`);
      if (response.status === 200) {
        const factures = response.data;
        console.log("Factures fetched:", factures);
        setData(factures);
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
    getFactures();
  };

  const handleExport = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/Chauff/export-factures?month=${selectedMonth}&year=${selectedYear}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `factures_${selectedMonth}_${selectedYear}.xlsx`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Error exporting factures:", error);
      toast.error("Erreur lors de l'exportation des factures");
    }
  };

  const handleGenerateFacture = async (driverId) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/Chauff/generate-facture/${driverId}`);
      if (response.status === 200) {
        toast.success("Facture générée avec succès");
        getFactures();
      }
    } catch (error) {
      console.error("Error generating facture:", error);
      toast.error("Erreur lors de la génération de la facture");
    }
  };

  const handleDownloadPDF = async (driverId) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/Chauff/facture-pdf/${driverId}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `facture_${driverId}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error("Erreur lors du téléchargement du PDF");
    }
  };

  const columns = [
    { field: "numero", headerName: "Numéro", width: 150 },
    { field: "nomChauffeur", headerName: "Nom du chauffeur", width: 200 },
    { field: "nbTrajet", headerName: "Nombre de trajets", width: 150 },
    { field: "montantTTC", headerName: "Montant TTC", width: 150 },
    { field: "fraisDeService", headerName: "Frais de service", width: 150 },
    { field: "dateEcheance", headerName: "Date d'échéance", width: 150 },
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
                <Button onClick={() => handleDownloadPDF(params.row.chauffeurId)}>
                  Télécharger PDF
                </Button>
                <Button onClick={() => handleGenerateFacture(params.row.chauffeurId)}>
                  Générer Facture
                </Button>
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
