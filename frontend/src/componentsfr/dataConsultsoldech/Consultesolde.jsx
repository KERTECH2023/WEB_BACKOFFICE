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
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DateRangeIcon from "@mui/icons-material/DateRange";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import RefreshIcon from "@mui/icons-material/Refresh";
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
  const [selectedWeekType, setSelectedWeekType] = useState("");
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
        
        // Process trip data - note we're using 'trips' instead of 'tripHistory'
        const processedTrips = (data.trips || []).map((trip, index) => ({
          ...trip,
          id: trip.tripId || `trip-${index}`,
          date: trip.time ? new Date(trip.time) : null,
          formattedDate: trip.time ? moment(new Date(trip.time)).format("DD/MM/YYYY HH:mm") : "N/A",
          fareAmount: trip.fareAmount || 0,
          sourceAddress: trip.sourceAddress || "N/A",
          destinationAddress: trip.destinationAddress || "N/A",
          paymentMethod: trip.healthStatus || "N/A",
          userName: trip.userName || "N/A",
          userPhone: trip.userPhone || "N/A",
          estPaye: trip.sipayer !== undefined ? trip.sipayer : false
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

  // Function to get week boundaries (Monday to Sunday)
  const getWeekBoundaries = (date) => {
    const day = date.getDay(); // 0 is Sunday, 1 is Monday, etc.
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday as first day
    
    const monday = new Date(date);
    monday.setDate(diff);
    monday.setHours(0, 0, 0, 0);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    
    return { start: monday, end: sunday };
  };

  // Function to get the previous week dates
  const getPreviousWeekDates = () => {
    const today = new Date();
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);
    return getWeekBoundaries(oneWeekAgo);
  };

  // Function to get the current week dates
  const getCurrentWeekDates = () => {
    return getWeekBoundaries(new Date());
  };

  // Function to get the next week dates
  const getNextWeekDates = () => {
    const today = new Date();
    const oneWeekLater = new Date(today);
    oneWeekLater.setDate(today.getDate() + 7);
    return getWeekBoundaries(oneWeekLater);
  };

  // Filter trips by week type
  const filterTripsByWeekType = (weekType) => {
    setSelectedWeekType(weekType);
    
    if (!weekType) {
      setFilteredTrips(trips);
      setShowWeeklyCardTotal(false);
      return;
    }
    
    let dateRange;
    
    switch(weekType) {
      case 'previous':
        dateRange = getPreviousWeekDates();
        break;
      case 'current':
        dateRange = getCurrentWeekDates();
        break;
      case 'next':
        dateRange = getNextWeekDates();
        break;
      default:
        setFilteredTrips(trips);
        setShowWeeklyCardTotal(false);
        return;
    }
    
    const weekTrips = trips.filter(trip => 
      trip.date && trip.date >= dateRange.start && trip.date <= dateRange.end
    );
    
    setFilteredTrips(weekTrips);
    setShowWeeklyCardTotal(true);
    calculateWeeklyCardTotal(weekTrips);
    
    // Format dates for display
    const startFormatted = moment(dateRange.start).format("DD/MM/YYYY");
    const endFormatted = moment(dateRange.end).format("DD/MM/YYYY");
    toast.info(`Affichage des courses du ${startFormatted} au ${endFormatted}`);
  };

  const filterTripsByDate = (e) => {
    const value = e.target.value;
    setSearchDate(value);
    setSelectedWeekType("");
    
    if (!value) {
      setFilteredTrips(trips);
      setShowWeeklyCardTotal(false);
      return;
    }
    
    setFilteredTrips(trips.filter(trip => 
      trip.date && moment(trip.date).format("YYYY-MM-DD") === value
    ));
    setShowWeeklyCardTotal(false);
  };

  const resetFilters = () => {
    setSelectedWeekType("");
    setSearchDate("");
    setFilteredTrips(trips);
    setShowWeeklyCardTotal(false);
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
    // If a week type is already selected, use that
    if (selectedWeekType) {
      filterTripsByWeekType(selectedWeekType);
    } else {
      // Otherwise, use current week
      filterTripsByWeekType('current');
    }
    
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
    { field: "paymentMethod", headerName: "Méthode de Paiement", width: 180 },
    { 
      field: "estPaye", 
      headerName: "Payé", 
      width: 100,
      renderCell: (params) => (
        <Chip 
          label={params.value ? "Payé" : "Non payé"} 
          color={params.value ? "success" : "error"}
          size="small"
        />
      )
    }
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
        
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            {/* Week type selector */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel id="week-type-select-label">Sélectionner une période</InputLabel>
                <Select
                  labelId="week-type-select-label"
                  value={selectedWeekType}
                  onChange={(e) => filterTripsByWeekType(e.target.value)}
                  label="Sélectionner une période"
                  startAdornment={<DateRangeIcon sx={{ mr: 1, color: 'primary.main' }} />}
                >
                  <MenuItem value="">
                    <em>Toutes les périodes</em>
                  </MenuItem>
                  <MenuItem value="previous">Semaine précédente</MenuItem>
                  <MenuItem value="current">Semaine courante</MenuItem>
                  <MenuItem value="next">Semaine prochaine</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Date specific selector */}
            <Grid item xs={12} md={4}>
              <input
                type="date"
                value={searchDate}
                onChange={filterTripsByDate}
                style={{ 
                  padding: '9px', 
                  borderRadius: '4px', 
                  border: '1px solid #ccc',
                  width: '100%'
                }}
              />
            </Grid>
            
            {/* Reset filters button */}
            <Grid item xs={12} md={4}>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<RefreshIcon />}
                onClick={resetFilters}
                fullWidth
              >
                Réinitialiser
              </Button>
            </Grid>
          </Grid>
          
          <Box display="flex" justifyContent="flex-end" mt={2}>
            <Chip 
              label={`${filteredTrips.length} course(s) trouvée(s)`} 
              color="primary" 
              variant="outlined" 
            />
          </Box>
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
