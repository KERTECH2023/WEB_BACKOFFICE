import React, { useState, useEffect } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import axios from "axios";

const Liscourse = () => {
  const [rides, setRides] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const API_URL = "https://api.backofficegc.com/rideRequests/ride-requests";

  useEffect(() => {
    fetchRides();
  }, [filterStatus]);

 const fetchRides = async () => {
  setIsLoading(true);
  try {
    const response = await axios.get(API_URL);

    // Convertir l'objet en tableau
    let ridesArray = Object.values(response.data);

    if (filterStatus !== "all") {
      ridesArray = ridesArray.filter(ride => ride.status === filterStatus);
    }
    
    setRides(ridesArray.reverse());
  } catch (error) {
    console.error("Erreur lors de la récupération des courses :", error);
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="list">
      <Sidebar />
      <div className="listContainer">
        <Navbar />
        <div className="filter">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">Tous</option>
            <option value="Ended">Terminé</option>
            <option value="Accepted">Accepté</option>
            <option value="Rejected">Rejeté</option>
          </select>
        </div>
        <div className="rides">
          {isLoading ? (
            <div className="loading">Chargement des données...</div>
          ) : (
            <table>
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
                </tr>
              </thead>
              <tbody>
                {rides.map((ride) => (
                  <tr key={ride.id}>
                    <td>{ride.userName}</td>
                    <td>{ride.userPhone}</td>
                    <td>{ride.sourceAddress}</td>
                    <td>{ride.destinationAddress}</td>
                    <td>{ride.fareAmount} DT</td>
                    <td>{ride.driverName} ({ride.driverPhone})</td>
                    <td>{ride.driverCarImmatriculation}</td>
                    <td>{ride.driverCarModelle}</td>
                    <td>{ride.status}</td>
                    <td>{new Date(ride.time).toLocaleString()}</td>
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
