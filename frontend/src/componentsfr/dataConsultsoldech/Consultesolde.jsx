import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Link } from "react-router-dom";
import moment from "moment";
import "./Consultesolde.css";

const ConsultCfr = () => {
  const { id } = useParams(); // This is now the Firebase UID directly
  const [loading, setLoading] = useState(true);
  const [financialData, setFinancialData] = useState(null);
  const [solde, setSolde] = useState("");
  const [soldeCarte, setSoldeCarte] = useState("");
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [searchDate, setSearchDate] = useState("");
  const role = window.localStorage.getItem("userRole");

  useEffect(() => {
    getDriverData();
  }, [id]);

  const getDriverData = async () => {
    try {
      setLoading(true);
      
      // Use the id directly as Firebase UID from the URL parameter
      const uid = id;
      
      // Get financial data using the Firebase UID
      const responseFinancial = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/Soldefr/getDriverFinancialInfo/${uid}`
      );
      
      if (responseFinancial.status === 200) {
        setFinancialData(responseFinancial.data);
        setSolde(responseFinancial.data.solde || 0);
        setSoldeCarte(responseFinancial.data.soldeCarte || 0);
        
        // Try to get basic driver data if needed
       
        
        // Process trip history
        const tripHistory = responseFinancial.data.tripHistory || [];
        const tripsWithIds = tripHistory.map((trip, index) => ({
          ...trip,
          id: trip.tripId || `trip-${index}`,
          date: trip.details?.time 
            ? new Date(trip.details.time._seconds * 1000) 
            : null,
          formattedDate: trip.details?.time 
            ? moment(new Date(trip.details.time._seconds * 1000)).format("DD/MM/YYYY HH:mm") 
            : "N/A",
          fareAmount: trip.details?.fareAmount || 0,
          sourceAddress: trip.details?.sourceAddress || "N/A",
          sourceCoordinates: trip.details?.sourceLocation 
            ? `(${trip.details.sourceLocation.latitude}, ${trip.details.sourceLocation.longitude})`
            : "N/A",
          destinationAddress: trip.details?.destinationAddress || "N/A",
          destinationCoordinates: trip.details?.destinationLocation 
            ? `(${trip.details.destinationLocation.latitude}, ${trip.details.destinationLocation.longitude})`
            : "N/A",
          paymentMethod: trip.details?.paymentMethod || "N/A",
          driverName: trip.details?.driver?.name || "N/A",
          driverPhone: trip.details?.driver?.phone || "N/A",
          driverVehicle: trip.details?.driver?.vehicle || "N/A",
          driverLicensePlate: trip.details?.driver?.licensePlate || "N/A",
          clientName: trip.details?.client?.name || "N/A",
          clientPhone: trip.details?.client?.phone || "N/A"
        }));
        
        
        // Sort by date, most recent first
        const sortedTrips = tripsWithIds.sort((a, b) => {
          if (!a.date) return 1;
          if (!b.date) return -1;
          return b.date - a.date;
        });
        
        setTrips(sortedTrips);
        setFilteredTrips(sortedTrips);
      }
    } catch (error) {
      console.error("Error fetching driver data:", error);
      toast.error("Erreur lors du chargement des données du chauffeur");
    } finally {
      setLoading(false);
    }
  };

  const updateDriverBalance = async (field) => {
    try {
      const value = field === "solde" ? solde : soldeCarte;
      await axios.put(
        `${process.env.REACT_APP_BASE_URL}/Soldefr/update/${id}`,
        {
          [field]: parseFloat(value)
        }
      );
      toast.success(`${field === "solde" ? "Solde" : "Solde carte"} mis à jour avec succès !`);
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      toast.error(`Erreur lors de la mise à jour du ${field === "solde" ? "solde" : "solde carte"}`);
    }
  };

  const filterTripsByDate = (e) => {
    const value = e.target.value;
    setSearchDate(value);
    
    if (!value) {
      setFilteredTrips(trips);
      return;
    }
    
    // Filter trips for the current week if "week" is selected
    if (value === "week") {
      const startOfWeek = moment().startOf('week');
      const endOfWeek = moment().endOf('week');
      
      const weekTrips = trips.filter(trip => {
        if (!trip.date) return false;
        const tripDate = moment(trip.date);
        return tripDate.isBetween(startOfWeek, endOfWeek, null, '[]');
      });
      
      setFilteredTrips(weekTrips);
    } else {
      // Otherwise filter by specific date
      const filtered = trips.filter(trip => {
        if (!trip.date) return false;
        return moment(trip.date).format("YYYY-MM-DD") === value;
      });
      
      setFilteredTrips(filtered);
    }
  };

  const columns = [
    { 
      field: "formattedDate", 
      headerName: "Date et Heure", 
      width: 180 
    },
    { 
      field: "fareAmount", 
      headerName: "Montant", 
      width: 120,
      valueFormatter: (params) => `${params.value} €`
    },
    { 
      field: "sourceAddress", 
      headerName: "Départ", 
      width: 250 
    },
    { 
      field: "destinationAddress", 
      headerName: "Destination", 
      width: 250 
    },
    { 
      field: "paymentMethod", 
      headerName: "Méthode de Paiement", 
      width: 180 
    }
  ];

  if (loading) {
    return (
      <div className="loadingContainer">
        <CircularProgress />
        <p>Chargement des données...</p>
      </div>
    );
  }

  if (!financialData) {
    return (
      <div className="errorContainer">
        <p>Aucune donnée financière trouvée pour ce chauffeur.</p>
        <Link to="/datachauf">
          <Button startIcon={<ArrowBackIcon />}>Retour</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="consultContainer">
      <div className="consultHeader">
        <h1>Informations du Chauffeur</h1>
        <Link to="/datachauf">
          <Button startIcon={<ArrowBackIcon />} variant="outlined">
            Retour
          </Button>
        </Link>
      </div>

      <div className="driverInfoCard">
       

        {financialData && (role === "Admin" || role === "Agentad") && (
          <div className="driverFinancialInfo">
            <div className="balanceField">
              <label>Solde (€):</label>
              <div className="balanceInput">
                <input
                  type="number"
                  value={solde}
                  onChange={(e) => setSolde(e.target.value)}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => updateDriverBalance("solde")}
                >
                  Enregistrer
                </Button>
              </div>
            </div>

            <div className="balanceField">
              <label>Solde Carte (€):</label>
              <div className="balanceInput">
                <input
                  type="number"
                  value={soldeCarte}
                  onChange={(e) => setSoldeCarte(e.target.value)}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => updateDriverBalance("soldeCarte")}
                >
                  Enregistrer
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="tripHistorySection">
        <h2>Historique des Courses</h2>
        
        <div className="searchDateContainer">
          <div className="searchDateOptions">
            <Button 
              variant={searchDate === "week" ? "contained" : "outlined"}
              onClick={() => {
                setSearchDate("week");
                filterTripsByDate({ target: { value: "week" } });
              }}
            >
              Cette Semaine
            </Button>
            
            <div className="datePickerContainer">
              <input
                type="date"
                value={searchDate !== "week" ? searchDate : ""}
                onChange={filterTripsByDate}
                className="datePicker"
              />
              {searchDate && searchDate !== "week" && (
                <Button 
                  size="small"
                  onClick={() => {
                    setSearchDate("");
                    setFilteredTrips(trips);
                  }}
                >
                  Réinitialiser
                </Button>
              )}
            </div>
          </div>
          
          <div className="tripCount">
            {filteredTrips.length} course(s) trouvée(s)
          </div>
        </div>

        <div style={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={filteredTrips}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10]}
            disableSelectionOnClick
            disableColumnMenu
          />
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ConsultCfr;