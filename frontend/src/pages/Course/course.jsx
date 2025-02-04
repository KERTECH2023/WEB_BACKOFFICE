import React, { useState, useEffect } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import axios from "axios";

const Liscourse = () => {
  const [rides, setRides] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const API_URL = "https://api.backofficegc.com/rideRequests/ride-requests";

  useEffect(() => {
    fetchRides();
  }, [filterStatus]);

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
      setRides(ridesArray.reverse());
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

  const getStatusClass = (status) => {
    const statusClasses = {
      Ended: "status-ended",
      Accepted: "status-accepted",
      Rejected: "status-rejected",
      Arrived: "status-arrived"
    };
    return statusClasses[status] || "";
  };

  return (
    <div className="list">
      <Sidebar />
      <div className="listContainer">
        <Navbar />
        <div className="filter">
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tous</option>
            <option value="Ended">Terminé</option>
            <option value="Accepted">Accepté</option>
            <option value="Rejected">Rejeté</option>
            <option value="Arrived">Arrivé</option>
          </select>
        </div>

        {error && <div className="error-message">{error}</div>}
        
        <div className="rides">
          {isLoading ? (
            <div className="loading">Chargement des données...</div>
          ) : (
            <table className="rides-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Téléphone</th>
                  <th>Adresse source</th>
                  <th>Adresse destination</th>
                  <th>Montant</th>
                  <th>Conducteur</th>
                  <th>Immatriculation</th>
                  <th>Modèle</th>
                  <th>Statut</th>
                  <th>Heure</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rides.map((ride) => (
                  <tr key={ride.id}>
                    <td>{ride.userName || ""}</td>
                    <td>{ride.userPhone || ""}</td>
                    <td>{ride.sourceAddress || ""}</td>
                    <td>{ride.destinationAddress || ""}</td>
                    <td>{ride.fareAmount ? `${ride.fareAmount} DT` : ""}</td>
                    <td>{formatDriverInfo(ride)}</td>
                    <td>{ride.driverCarImmatriculation || ""}</td>
                    <td>{ride.driverCarModelle || ""}</td>
                    <td className={getStatusClass(ride.status)}>
                      {ride.status || ""}
                    </td>
                    <td>
                      {ride.time ? new Date(ride.time).toLocaleString() : "N/A"}
                    </td>
                    <td>
                      <button 
                        onClick={() => handleDelete(ride.id)}
                        className="delete-button"
                      >
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
