import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button, CircularProgress } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import moment from "moment";
import "./Consultesolde.css";

const ConsultCfr = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [financialData, setFinancialData] = useState(null);
  const [trips, setTrips] = useState([]);
  const [searchDate, setSearchDate] = useState("");
  const role = localStorage.getItem("userRole");

  useEffect(() => {
    const fetchDriverData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/Soldefr/getDriverFinancialInfo/${id}`
        );
        if (response.status === 200) {
          const data = response.data;
          setFinancialData(data);
          const sortedTrips = (data.tripHistory || []).map((trip, index) => ({
            id: trip.tripId || `trip-${index}`,
            formattedDate: trip.details?.time
              ? moment(trip.details.time._seconds * 1000).format("DD/MM/YYYY HH:mm")
              : "N/A",
            ...trip.details,
          })).sort((a, b) => b.formattedDate - a.formattedDate);
          setTrips(sortedTrips);
        }
      } catch (error) {
        toast.error("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };
    fetchDriverData();
  }, [id]);

  const filterTrips = (e) => {
    const value = e.target.value;
    setSearchDate(value);
    setTrips(trips.filter(trip => value === "week" 
      ? moment(trip.formattedDate).isBetween(moment().startOf('week'), moment().endOf('week'), null, '[]')
      : moment(trip.formattedDate).format("YYYY-MM-DD") === value
    ));
  };

  const columns = [
    { field: "formattedDate", headerName: "Date et Heure", width: 180 },
    { field: "userName", headerName: "Nom client", width: 200 },
    { field: "sourceAddress", headerName: "Départ", width: 250 },
    { field: "destinationAddress", headerName: "Destination", width: 250 },
    { field: "fareAmount", headerName: "Montant", width: 120, valueFormatter: (params) => `${params.value} €` },
  ];

  return loading ? (
    <div className="loadingContainer"><CircularProgress /><p>Chargement...</p></div>
  ) : (
    <div className="consultContainer">
      <h1>Informations du Chauffeur</h1>
      {financialData && (role === "Admin" || role === "Agentad") && (
        <div className="financialInfo">
          <p>Commission Flash Totale (€): {financialData.solde || 0}</p>
          <p>Totale par carte (€): {financialData.soldeCarte || 0}</p>
        </div>
      )}
      <h2>Historique des Courses</h2>
      <div className="searchContainer">
        <Button variant={searchDate === "week" ? "contained" : "outlined"} onClick={() => filterTrips({ target: { value: "week" } })}>Cette Semaine</Button>
        <input type="date" value={searchDate} onChange={filterTrips} className="datePicker" />
      </div>
      <DataGrid rows={trips} columns={columns} pageSize={10} autoHeight disableSelectionOnClick />
      <Link to="/datachauf"><Button startIcon={<ArrowBackIcon />}>Retour</Button></Link>
      <ToastContainer />
    </div>
  );
};

export default ConsultCfr;
