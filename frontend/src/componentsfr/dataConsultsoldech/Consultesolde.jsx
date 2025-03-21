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
  FormControl,
  InputLabel,
  Select,
  MenuItem
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
  const [filterType, setFilterType] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedWeek, setSelectedWeek] = useState("");
  const role = window.localStorage.getItem("userRole");
  const isAdmin = role === "Admin" || role === "Agentad";

  // Available months and weeks for filtering
  const [availableMonths, setAvailableMonths] = useState([]);
  const [availableWeeks, setAvailableWeeks] = useState([]);

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
        
        // Process trip history with new format
        const processedTrips = (data.trips || []).map((trip) => ({
          ...trip,
          id: trip.tripId || trip._id,
          date: trip.time ? new Date(trip.time) : null,
          formattedDate: trip.time ? moment(new Date(trip.time)).format("DD/MM/YYYY HH:mm") : "N/A",
          fareAmount: trip.fareAmount || 0,
          sourceAddress: trip.sourceAddress || "N/A",
          destinationAddress: trip.destinationAddress || "N/A",
          paymentMethod: trip.healthStatus || "N/A",
          userName: trip.userName || "N/A",
          userPhone: trip.userPhone || "N/A",
          isPaid: trip.sipayer === true ? "Oui" : "Non"
        })).sort((a, b) => !a.date ? 1 : !b.date ? -1 : b.date - a.date);
        
        setTrips(processedTrips);
        setFilteredTrips(processedTrips);
        
        // Generate available months and weeks for filtering
        generateDateFilters(processedTrips);
      }
    } catch (error) {
      console.error("Error fetching driver data:", error);
      toast.error("Erreur lors du chargement des données du chauffeur");
    } finally {
      setLoading(false);
    }
  };

  const generateDateFilters = (processedTrips) => {
    // Generate months
    const months = [];
    const weeks = [];
    
    processedTrips.forEach(trip => {
      if (trip.date) {
        const monthKey = moment(trip.date).format("YYYY-MM");
        const monthLabel = moment(trip.date).format("MMMM YYYY");
        
        if (!months.some(m => m.key === monthKey)) {
          months.push({ key: monthKey, label: monthLabel });
        }
        
        // Generate weeks (excluding current week)
        const tripWeek = moment(trip.date).startOf('week');
        const currentWeek = moment().startOf('week');
        
        if (tripWeek.isBefore(currentWeek)) {
          const weekKey = tripWeek.format("YYYY-[W]WW");
          const weekLabel = `Semaine du ${tripWeek.format("DD/MM/YYYY")}`;
          
          if (!weeks.some(w => w.key === weekKey)) {
            weeks.push({ key: weekKey, label: weekLabel });
          }
        }
      }
    });
    
    setAvailableMonths(months);
    setAvailableWeeks(weeks);
  };

  const handleFilterChange = (e) => {
    setFilterType(e.target.value);
    setSelectedMonth("");
    setSelectedWeek("");
    setFilteredTrips(trips);
  };

  const handleMonthChange = (e) => {
    const value = e.target.value;
    setSelectedMonth(value);
    setSelectedWeek("");
    
    if (!value) {
      setFilteredTrips(trips);
      return;
    }
    
    const [year, month] = value.split('-');
    const filtered = trips.filter(trip => 
      trip.date && 
      moment(trip.date).year() === parseInt(year) && 
      moment(trip.date).month() === parseInt(month) - 1
    );
    
    setFilteredTrips(filtered);
  };

  const handleWeekChange = (e) => {
    const value = e.target.value;
    setSelectedWeek(value);
    setSelectedMonth("");
    
    if (!value) {
      setFilteredTrips(trips);
      return;
    }
    
    const [year, weekNum] = value.replace('-W', '-').split('-');
    const weekStart = moment().year(parseInt(year)).week(parseInt(weekNum)).startOf('week');
    const weekEnd = moment(weekStart).endOf('week');
    
    const filtered = trips.filter(trip => 
      trip.date && moment(trip.date).isBetween(weekStart, weekEnd, null, '[]')
    );
    
    setFilteredTrips(filtered);
  };

  const resetFilters = () => {
    setFilterType("");
    setSelectedMonth("");
    setSelectedWeek("");
    setFilteredTrips(trips);
  };

  const columns = [
    { field: "formattedDate", headerName: "Date et Heure", width: 180 },
    { field: "userName", headerName: "Nom client", width: 180 },
    { field: "userPhone", headerName: "Client Tel", width: 150 },
    { field: "sourceAddress", headerName: "Départ", width: 200 },
    { field: "destinationAddress", headerName: "Destination", width: 200 },
    { 
      field: "fareAmount", 
      headerName: "Montant", 
      width: 120,
      valueFormatter: (params) => `${params.value} €`
    },
    { field: "paymentMethod", headerName: "Méthode de Paiement", width: 180 },
    { field: "isPaid", headerName: "Payé", width: 100 }
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
              <Grid item xs={12} md={6}>
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
              <Grid item xs={12} md={6}>
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
            </Grid>
          </Box>
        )}
      </Paper>

      <Paper elevation={3} sx={{ p: 5, borderRadius: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 500 }}>
          Historique des Courses
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
          <Box display="flex" gap={2} alignItems="center">
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel id="filter-type-label">Type de filtre</InputLabel>
              <Select
                labelId="filter-type-label"
                value={filterType}
                label="Type de filtre"
                onChange={handleFilterChange}
              >
                <MenuItem value="">Tous</MenuItem>
                <MenuItem value="month">Par mois</MenuItem>
                <MenuItem value="week">Par semaine</MenuItem>
              </Select>
            </FormControl>

            {filterType === 'month' && (
              <FormControl sx={{ minWidth: 180 }}>
                <InputLabel id="month-select-label">Mois</InputLabel>
                <Select
                  labelId="month-select-label"
                  value={selectedMonth}
                  label="Mois"
                  onChange={handleMonthChange}
                >
                  <MenuItem value="">Tous les mois</MenuItem>
                  {availableMonths.map(month => (
                    <MenuItem key={month.key} value={month.key}>{month.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {filterType === 'week' && (
              <FormControl sx={{ minWidth: 180 }}>
                <InputLabel id="week-select-label">Semaine</InputLabel>
                <Select
                  labelId="week-select-label"
                  value={selectedWeek}
                  label="Semaine"
                  onChange={handleWeekChange}
                >
                  <MenuItem value="">Toutes les semaines</MenuItem>
                  {availableWeeks.map(week => (
                    <MenuItem key={week.key} value={week.key}>{week.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {(filterType || selectedMonth || selectedWeek) && (
              <Button 
                variant="outlined"
                size="small"
                onClick={resetFilters}
              >
                Réinitialiser
              </Button>
            )}
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
