import React, { useState, useEffect } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import axios from "axios";

const Liscourse = () => {
  const [rides, setRides] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc"); // "desc" pour descendant (plus récent d'abord), "asc" pour ascendant
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const API_URL = "https://api.backofficegc.com/rideRequests/ride-requests";

  // Styles intégrés
  const styles = {
    ridesTable: {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '20px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    },
    tableCell: {
      padding: '12px',
      border: '1px solid #ddd',
      textAlign: 'left'
    },
    tableHeader: {
      padding: '12px',
      border: '1px solid #ddd',
      textAlign: 'left',
      backgroundColor: '#f5f5f5',
      fontWeight: '600'
    },
    deleteButton: {
      backgroundColor: '#F44336',
      color: 'white',
      border: 'none',
      padding: '5px 10px',
      borderRadius: '4px',
      cursor: 'pointer'
    },
    filterSelect: {
      padding: '8px',
      margin: '10px 0',
      borderRadius: '4px',
      border: '1px solid #ddd',
      backgroundColor: 'white',
      minWidth: '150px'
    },
    errorMessage: {
      color: '#F44336',
      padding: '10px',
      margin: '10px 0',
      backgroundColor: '#FFEBEE',
      borderRadius: '4px',
      border: '1px solid #FFCDD2'
    },
    loading: {
      padding: '20px',
      textAlign: 'center',
      color: '#666'
    },
    statusStyles: {
      Ended: { color: '#2196F3', fontWeight: '500' },
      Accepted: { color: '#4CAF50', fontWeight: '500' },
      Rejected: { color: '#F44336', fontWeight: '500' },
      Arrived: { color: '#9C27B0', fontWeight: '500' }
    }
  };

  useEffect(() => {
    fetchRides();
  }, [filterStatus, sortOrder]);

  const fetchRides = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(API_URL);
      let ridesArray = Object.entries(response.data).map(([id, ride]) => ({
        id,
        ...ride
      }));
      
      if (filterStatus !== "all") {
        ridesArray = ridesArray.filter(ride => ride.status === filterStatus);
      }
      
      // Tri par date
      ridesArray.sort((a, b) => {
        const timeA = a.time?._seconds || (a.time ? new Date(a.time).getTime() / 1000 : 0);
        const timeB = b.time?._seconds || (b.time ? new Date(b.time).getTime() / 1000 : 0);
        
        return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
      });
      
      setRides(ridesArray);
    } catch (error) {
      setError("Erreur lors de la récupération des courses");
      console.error("Erreur lors de la récupération des courses :", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (rideId) => {
    if (!rideId) {
      alert("ID de course invalide");
      return;
    }

    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette course ?")) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/${rideId}`);
      setRides(rides.filter(ride => ride.id !== rideId));
      alert("Course supprimée avec succès");
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Erreur lors de la suppression de la course";
      console.error("Erreur lors de la suppression de la course :", error);
      alert(errorMessage);
    }
  };

  const formatDriverInfo = (ride) => {
    if (!ride.driverName && !ride.driverPhone) return "Non assigné";
    return `${ride.driverName || "N/A"} (${ride.driverPhone || "N/A"})`;
  };

  return (
    <div className="list">
      <Sidebar />
      <div style={{ padding: '20px' }}>
        <Navbar />
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">Tous les statuts</option>
            <option value="Ended">Terminé</option>
            <option value="Accepted">Accepté</option>
            <option value="Rejected">Rejeté</option>
            <option value="Arrived">Arrivé</option>
          </select>
          
          <select 
            value={sortOrder} 
            onChange={(e) => setSortOrder(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="desc">Plus récent d'abord</option>
            <option value="asc">Plus ancien d'abord</option>
          </select>
        </div>

        {error && <div style={styles.errorMessage}>{error}</div>}
        
        <div className="rides">
          {isLoading ? (
            <div style={styles.loading}>Chargement des données...</div>
          ) : (
            <table style={styles.ridesTable}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>Nom</th>
                  <th style={styles.tableHeader}>Téléphone</th>
                  <th style={styles.tableHeader}>Adresse source</th>
                  <th style={styles.tableHeader}>Adresse destination</th>
                  <th style={styles.tableHeader}>Montant</th>
                  <th style={styles.tableHeader}>Conducteur</th>
                  <th style={styles.tableHeader}>Immatriculation</th>
                  <th style={styles.tableHeader}>Modèle</th>
                  <th style={styles.tableHeader}>Statut</th>
                  <th style={styles.tableHeader}>Heure</th>
                  <th style={styles.tableHeader}>Action</th>
                </tr>
              </thead>
              <tbody>
                {rides.map((ride) => (
                  <tr key={ride.id}>
                    <td style={styles.tableCell}>{ride.userName || ""}</td>
                    <td style={styles.tableCell}>{ride.userPhone || ""}</td>
                    <td style={styles.tableCell}>{ride.sourceAddress || ""}</td>
                    <td style={styles.tableCell}>{ride.destinationAddress || ""}</td>
                    <td style={styles.tableCell}>{ride.fareAmount ? `${ride.fareAmount} DT` : ""}</td>
                    <td style={styles.tableCell}>{formatDriverInfo(ride)}</td>
                    <td style={styles.tableCell}>{ride.driverCarImmatriculation || ""}</td>
                    <td style={styles.tableCell}>{ride.driverCarModelle || ""}</td>
                    <td style={{...styles.tableCell, ...styles.statusStyles[ride.status]}}>
                      {ride.status || ""}
                    </td>
                    <td style={styles.tableCell}>
                      {ride.time ? 
  (ride.time._seconds ? 
    new Date(ride.time._seconds * 1000).toLocaleString() : 
    new Date(ride.time).toLocaleString()) : 
  "N/A"}
                    </td>
                    <td style={styles.tableCell}>
                      <button onClick={() => handleDelete(ride.id)} style={styles.deleteButton}>
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Liscourse;
