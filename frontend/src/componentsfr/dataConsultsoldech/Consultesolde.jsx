import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { 
  Button, 
  CircularProgress, 
  Card, 
  CardContent, 
  Typography, 
  Container, 
  Box, 
  Chip,
  Divider,
  Paper,
  Grid
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DateRangeIcon from "@mui/icons-material/DateRange";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import moment from "moment";
import "./Consultesolde.css";

const ConsultCfr = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [financialData, setFinancialData] = useState(null);
  const [solde, setSolde] = useState(0);
  const [soldeCarte, setSoldeCarte] = useState(0);
  const [soldeSemaineCarte, setSoldeSemaineCarte] = useState(0);
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [searchDate, setSearchDate] = useState("");
  const [showWeeklyCardTotal, setShowWeeklyCardTotal] = useState(false);
  const role = window.localStorage.getItem("userRole");
  const isAdmin = role === "Admin" || role === "Agentad";

  useEffect(() => {
    fetchDriverData();
  }, [id]);

  const fetchDriverData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/Soldefr/getDriverFinancialInfo/${id}`
      );
      
      if (response.status === 200) {
        const data = response.data;
        setFinancialData(data);
        setSolde(data.solde || 0);
        setSoldeCarte(data.soldeCarte || 0);
        
        // Process trip history
        const processedTrips = (data.tripHistory || []).map((trip, index) => ({
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
          destinationAddress: trip.details?.destinationAddress || "N/A",
          paymentMethod: trip.details?.healthStatus || "N/A",
          userName: trip.details?.userName || "N/A",
          userPhone: trip.details?.userPhone|| "N/A"
        })).sort((a, b) => !a.date ? 1 : !b.date ? -1 : b.date - a.date);
        
        setTrips(processedTrips);
        setFilteredTrips(processedTrips);
      }
    } catch (error) {
      console.error("Error fetching driver data:", error);
      toast.error("Erreur lors du chargement des données du chauffeur");
    } finally {
      setLoading(false);
    }
  };

  const filterTripsByDate = (e) => {
    const value = e.target.value;
    setSearchDate(value);
    
    if (!value) {
      setFilteredTrips(trips);
      setShowWeeklyCardTotal(false);
      return;
    }
    
    if (value === "week") {
      const startOfWeek = moment().startOf('week');
      const endOfWeek = moment().endOf('week');
      
      const weekTrips = trips.filter(trip => 
        trip.date && moment(trip.date).isBetween(startOfWeek, endOfWeek, null, '[]')
      );
      
      setFilteredTrips(weekTrips);
      setShowWeeklyCardTotal(true);
      calculateWeeklyCardTotal(weekTrips);
    } else {
      setFilteredTrips(trips.filter(trip => 
        trip.date && moment(trip.date).format("YYYY-MM-DD") === value
      ));
      setShowWeeklyCardTotal(false);
    }
  };

  const calculateWeeklyCardTotal = (weekTrips) => {
    // Filter trips with payment method "Paiement par carte"
    const cardPaymentTrips = weekTrips.filter(trip => 
      trip.paymentMethod === "Paiement par carte"
    );
    
    // Calculate commission for each card payment trip: (amount * 1.5%) + 0.25€
    const totalCommission = cardPaymentTrips.reduce((total, trip) => {
      const commission = (trip.fareAmount * 0.015) + 0.25;
      return total + commission;
    }, 0);
    
    // Set the calculated total
    setSoldeSemaineCarte(parseFloat(totalCommission.toFixed(2)));
  };

  const calculateWeeklyCardTotalOnDemand = () => {
    const startOfWeek = moment().startOf('week');
    const endOfWeek = moment().endOf('week');
    
    const weekTrips = trips.filter(trip => 
      trip.date && moment(trip.date).isBetween(startOfWeek, endOfWeek, null, '[]')
    );
    
    setSearchDate("week");
    setFilteredTrips(weekTrips);
    setShowWeeklyCardTotal(true);
    calculateWeeklyCardTotal(weekTrips);
    
    toast.success("Calcul du solde carte semaine effectué");
  };

  const columns = [
    { field: "formattedDate", headerName: "Date et Heure", width: 180 },
    { field: "userName", headerName: "Nom client", width: 200 },
    { field: "userPhone", headerName: "Client Tel", width: 150 },
    { field: "sourceAddress", headerName: "Départ", width: 220 },
    { field: "destinationAddress", headerName: "Destination", width: 220 },
    { 
      field: "fareAmount", 
      headerName: "Montant", 
      width: 120,
      valueFormatter: (params) => `${params.value} €`
    },
    { field: "paymentMethod", headerName: "Méthode de Paiement", width: 180 }
  ];

  if (loading) {
    return (
      <Container className="loadingContainer" sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '70vh' 
      }}>
        <CircularProgress color="primary" />
        <Typography variant="body1" sx={{ mt: 2 }}>Chargement des données...</Typography>
      </Container>
    );
  }

  if (!financialData) {
    return (
      <Container className="errorContainer" sx={{ textAlign: 'center', py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, maxWidth: 500, mx: 'auto' }}>
          <Typography variant="h6" color="error" gutterBottom>
            Aucune donnée financière trouvée pour ce chauffeur.
          </Typography>
          <Link to="/datachauf" style={{ textDecoration: 'none' }}>
            <Button variant="contained" startIcon={<ArrowBackIcon />} sx={{ mt: 2 }}>
              Retour
            </Button>
          </Link>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ mb: 4, p: 5, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 500, color: 'primary.main' }}>
          Informations du Chauffeur
        </Typography>
        
        {isAdmin && (
          <Box mt={3}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle1" color="text.secondary">
                      Commission Flash Totale
                    </Typography>
                    <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold' }}>
                      {solde} €
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle1" color="text.secondary">
                      Totale par carte
                    </Typography>
                    <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold' }}>
                      {soldeCarte} €
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    height: '100%', 
                    bgcolor: showWeeklyCardTotal ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                    transition: 'background-color 0.3s',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'rgba(25, 118, 210, 0.12)'
                    }
                  }}
                  onClick={calculateWeeklyCardTotalOnDemand}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1}>
                      <CreditCardIcon color="primary" />
                      <Typography variant="subtitle1" color="text.secondary">
                        Commission Carte Semaine
                      </Typography>
                    </Box>
                    <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold' }}>
                      {showWeeklyCardTotal ? `${soldeSemaineCarte} €` : "Cliquer pour calculer"}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      <Paper elevation={3} sx={{ p: 5, borderRadius: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 500 }}>
          Historique des Courses
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" gap={2} alignItems="center">
            <Button 
              variant={searchDate === "week" ? "contained" : "outlined"}
              startIcon={<DateRangeIcon />}
              onClick={() => {
                setSearchDate("week");
                filterTripsByDate({ target: { value: "week" } });
              }}
            >
              Cette Semaine
            </Button>
            
            <Box display="flex" alignItems="center" gap={1}>
              <input
                type="date"
                value={searchDate !== "week" ? searchDate : ""}
                onChange={filterTripsByDate}
                style={{ 
                  padding: '8px', 
                  borderRadius: '4px', 
                  border: '1px solid #ccc' 
                }}
              />
              {searchDate && (
                <Button 
                  size="small"
                  onClick={() => {
                    setSearchDate("");
                    setFilteredTrips(trips);
                    setShowWeeklyCardTotal(false);
                  }}
                >
                  Réinitialiser
                </Button>
              )}
            </Box>
          </Box>
          
          <Chip 
            label={`${filteredTrips.length} course(s) trouvée(s)`} 
            color="primary" 
            variant="outlined" 
          />
        </Box>

        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={filteredTrips}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10]}
            disableSelectionOnClick
            disableColumnMenu
            sx={{
              boxShadow: 2,
              border: 1,
              borderColor: 'divider',
              '& .MuiDataGrid-cell:hover': {
                color: 'primary.main',
              },
            }}
          />
        </Box>
      </Paper>
      <ToastContainer position="bottom-right" />
    </Container>
  );
};

export default ConsultCfr;
