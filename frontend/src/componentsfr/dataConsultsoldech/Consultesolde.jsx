import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { 
  Button, CircularProgress, Card, CardContent, Typography, Container, 
  Box, Chip, Divider, Paper, Grid, Select, MenuItem, FormControl, InputLabel
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DateRangeIcon from "@mui/icons-material/DateRange";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import RefreshIcon from "@mui/icons-material/Refresh";
import moment from "moment";

const ConsultCfr = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ solde: 0, soldeCarte: 0, trips: [] });
  const [soldeSemaineCarte, setSoldeSemaineCarte] = useState(0);
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [showWeeklyCardTotal, setShowWeeklyCardTotal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedWeek, setSelectedWeek] = useState("");
  const [availableWeeks, setAvailableWeeks] = useState([]);
  const role = localStorage.getItem("userRole");
  const isAdmin = role === "Admin" || role === "Agentad";

  // Génère les mois de l'année courante
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: moment().month(i).format("YYYY-MM"),
    label: moment().month(i).format("MMMM YYYY")
  }));

  useEffect(() => {
    fetchDriverData();
  }, [id]);

  // Génère les semaines quand un mois est sélectionné
  useEffect(() => {
    if (!selectedMonth) {
      setAvailableWeeks([]);
      setSelectedWeek("");
      return;
    }

    const [year, month] = selectedMonth.split("-");
    const firstDay = moment(`${year}-${month}-01`);
    const lastDay = moment(firstDay).endOf("month");
    
    let startOfWeek = moment(firstDay).startOf("week");
    if (startOfWeek.date() > 7) startOfWeek.add(1, "week");
    
    const weeks = [];
    let weekNum = 1;
    
    while (startOfWeek.isBefore(lastDay) && weekNum <= 6) {
      const endOfWeek = moment(startOfWeek).endOf("week");
      weeks.push({
        value: `${startOfWeek.format("YYYY-MM-DD")}:${endOfWeek.format("YYYY-MM-DD")}`,
        label: `Semaine ${weekNum} (${startOfWeek.format("DD/MM")} - ${endOfWeek.format("DD/MM")})`
      });
      
      startOfWeek.add(1, "week");
      weekNum++;
    }
    
    setAvailableWeeks(weeks);
  }, [selectedMonth]);

  const fetchDriverData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/Soldefr/getDriverFinancialInfo/${id}`
      );
      
      if (response.status === 200) {
        const responseData = response.data;
        setData(responseData);
        
        // Traitement des données des courses
        const processedTrips = (responseData.trips || []).map((trip, index) => ({
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

  // Filtre les courses par semaine du mois
  const handleWeekChange = (event) => {
    const value = event.target.value;
    setSelectedWeek(value);
    
    if (!value) {
      // Si aucune semaine n'est sélectionnée mais un mois l'est, afficher toutes les courses du mois
      if (selectedMonth) {
        const [year, month] = selectedMonth.split("-");
        const startOfMonth = moment(`${year}-${month}-01`).startOf('month');
        const endOfMonth = moment(startOfMonth).endOf('month');
        
        setFilteredTrips(trips.filter(trip => 
          trip.date && moment(trip.date).isBetween(startOfMonth, endOfMonth, null, '[]')
        ));
      } else {
        setFilteredTrips(trips);
      }
      setShowWeeklyCardTotal(false);
      return;
    }
    
    const [startDateStr, endDateStr] = value.split(":");
    const weekTrips = trips.filter(trip => 
      trip.date && moment(trip.date).isBetween(moment(startDateStr), moment(endDateStr), null, '[]')
    );
    
    setFilteredTrips(weekTrips);
    setShowWeeklyCardTotal(false);
  };

  // Filtre les courses par mois
  const handleMonthChange = (event) => {
    const value = event.target.value;
    setSelectedMonth(value);
    setSelectedWeek("");
    
    if (!value) {
      setFilteredTrips(trips);
      setShowWeeklyCardTotal(false);
      return;
    }
    
    const [year, month] = value.split("-");
    const monthTrips = trips.filter(trip => 
      trip.date && moment(trip.date).format("YYYY-MM") === `${year}-${month}`
    );
    
    setFilteredTrips(monthTrips);
    setShowWeeklyCardTotal(false);
  };

  const resetFilters = () => {
    setSelectedMonth("");
    setSelectedWeek("");
    setFilteredTrips(trips);
    setShowWeeklyCardTotal(false);
  };

  // Calculer et marquer les courses comme payées
  const calculateAndPay = async () => {
    let weekTrips = [];
    
    // Déterminer la plage de dates à utiliser
    if (selectedWeek) {
      const [startDateStr, endDateStr] = selectedWeek.split(":");
      weekTrips = trips.filter(trip => 
        trip.date && moment(trip.date).isBetween(moment(startDateStr), moment(endDateStr), null, '[]')
      );
    } else if (selectedMonth) {
      // Utiliser la première semaine du mois si le mois est sélectionné mais pas la semaine
      if (availableWeeks.length > 0) {
        const [startDateStr, endDateStr] = availableWeeks[0].value.split(":");
        weekTrips = trips.filter(trip => 
          trip.date && moment(trip.date).isBetween(moment(startDateStr), moment(endDateStr), null, '[]')
        );
        setSelectedWeek(availableWeeks[0].value);
      } else {
        // Utiliser tout le mois si pas de semaines disponibles
        const [year, month] = selectedMonth.split("-");
        weekTrips = trips.filter(trip => 
          trip.date && moment(trip.date).format("YYYY-MM") === `${year}-${month}`
        );
      }
    } else {
      // Utiliser la semaine courante par défaut
      const now = moment();
      const startOfWeek = moment(now).startOf('week');
      const endOfWeek = moment(now).endOf('week');
      
      weekTrips = trips.filter(trip => 
        trip.date && moment(trip.date).isBetween(startOfWeek, endOfWeek, null, '[]')
      );
    }
    
    // Vérifier si toutes les courses sont déjà payées
    const unpaidTrips = weekTrips.filter(trip => !trip.estPaye);
    
    if (unpaidTrips.length === 0 && weekTrips.length > 0) {
      toast.info("Cette semaine est déjà payée");
      return;
    }
    
    // Calculer la commission
    const cardPaymentTrips = weekTrips.filter(trip => 
      trip.paymentMethod === "Paiement par carte" && !trip.estPaye
    );
    
    // Nouveau calcul: montant à payer = totaleCarte + solde - (totaleCarte * 0.015) - (cartes non payées * 0.25)
    const totalMontantAPayer = data.soldeCarte + data.solde - (data.soldeCarte * 0.015) - (cardPaymentTrips.length * 0.25);
    
    const totalDue = parseFloat(totalMontantAPayer.toFixed(2));
    
    setSoldeSemaineCarte(totalDue);
    setShowWeeklyCardTotal(true);
    setFilteredTrips(weekTrips);
    
    // Marquer les courses comme payées et mettre à jour le serveur
    if (unpaidTrips.length > 0) {
      const tripIds = unpaidTrips.map(trip => trip.tripId);
      
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_BASE_URL}/Soldefr/facturepayer`,
          { tripIds }
        );
        
        if (response.status === 200) {
          toast.success("Paiement enregistré avec succès");
          
          // Mettre à jour l'état local
          const updatePaymentStatus = tripList => 
            tripList.map(trip => tripIds.includes(trip.tripId) ? {...trip, estPaye: true} : trip);
          
          setTrips(updatePaymentStatus(trips));
          setFilteredTrips(updatePaymentStatus(filteredTrips));
        }
      } catch (error) {
        console.error("Erreur lors de l'enregistrement du paiement:", error);
        toast.error("Erreur lors de l'enregistrement du paiement");
      }
    } else {
      toast.info("Aucune course non payée pour cette période");
    }
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
      <Container sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
        <CircularProgress color="primary" />
        <Typography variant="body1" sx={{ mt: 2 }}>Chargement des données...</Typography>
      </Container>
    );
  }

  if (!data) {
    return (
      <Container sx={{ textAlign: 'center', py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, maxWidth: 500, mx: 'auto' }}>
          <Typography variant="h6" color="error" gutterBottom>
            Aucune donnée trouvée pour ce chauffeur.
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
                      {data.solde} €
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
                      {data.soldeCarte} €
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
                    '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.12)' }
                  }}
                  onClick={calculateAndPay}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1}>
                      <CreditCardIcon color="primary" />
                      <Typography variant="subtitle1" color="text.secondary">
                        Montant à Payer
                      </Typography>
                    </Box>
                    <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold' }}>
                      {showWeeklyCardTotal ? `${soldeSemaineCarte} €` : "Calculer"}
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
            {/* Sélecteur de mois */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel id="month-select-label">Sélectionner un mois</InputLabel>
                <Select
                  labelId="month-select-label"
                  value={selectedMonth}
                  onChange={handleMonthChange}
                  label="Sélectionner un mois"
                  startAdornment={<CalendarMonthIcon sx={{ mr: 1, color: 'primary.main' }} />}
                >
                  <MenuItem value=""><em>Tous les mois</em></MenuItem>
                  {months.map((month) => (
                    <MenuItem key={month.value} value={month.value}>{month.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Sélecteur de semaine */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth variant="outlined" size="small" disabled={!selectedMonth}>
                <InputLabel id="week-select-label">Sélectionner une semaine</InputLabel>
                <Select
                  labelId="week-select-label"
                  value={selectedWeek}
                  onChange={handleWeekChange}
                  label="Sélectionner une semaine"
                  startAdornment={<DateRangeIcon sx={{ mr: 1, color: 'primary.main' }} />}
                >
                  <MenuItem value=""><em>Toutes les semaines</em></MenuItem>
                  {availableWeeks.map((week) => (
                    <MenuItem key={week.value} value={week.value}>{week.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Bouton réinitialiser */}
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
