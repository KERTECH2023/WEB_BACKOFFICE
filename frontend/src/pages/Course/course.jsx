import React, { useState, useEffect } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import axios from "axios";

const Liscourse = () => {
  const [rides, setRides] = useState([]); // Liste des courses
  const [filterStatus, setFilterStatus] = useState("all"); // Filtre par statut
  const [isLoading, setIsLoading] = useState(false); // État pour le chargement
  const BASE_URL = process.env.REACT_APP_BASE_URL; // Base URL de l'API

  // Récupérer les courses en fonction du filtre
  useEffect(() => {
    fetchRides();
  }, [filterStatus]);

  const fetchRides = async () => {
    setIsLoading(true); // Démarrer le chargement
    try {
      // Appeler l'API pour synchroniser Firebase avec MongoDB
      await axios.post(`${BASE_URL}/Ride/firebaseToMongoDB`, {});

      // Récupérer les courses après la synchronisation
      const endpoint =
        filterStatus === "all"
          ? "/ride/allRideRequests"
          : `/ride/ride-requests/status/${filterStatus}`;
      const response = await axios.get(`${BASE_URL}${endpoint}`);
      // Inverser l'ordre des courses pour afficher la dernière en premier
      setRides((response.data.rideRequests || []).reverse());
    } catch (error) {
      console.error("Erreur lors de la récupération des courses :", error);
    } finally {
      setIsLoading(false); // Arrêter le chargement
    }
  };

  // Mettre à jour le statut d'une course
  const updateStatus = async (id, newStatus) => {
    try {
      await axios.patch(`${BASE_URL}/ride/rides/${id}/status`, {
        status: newStatus,
      });
      fetchRides(); // Rafraîchir les données après la mise à jour
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut :", error);
    }
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
          >
            <option value="all">Tous</option>
            <option value="Ended">Terminer</option>
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
                  <th>Nom du conducteur</th>
                  <th>Montant</th>
                  <th>Adresse source</th>
                  <th>Statut</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rides.map((ride) => (
                  <tr key={ride._id}>
                    <td>{ride.userName}</td>
                    <td>{ride.driverName}</td>
                    <td>{ride.fareAmount}</td>
                    <td>{ride.sourceAddress}</td>
                    <td>{ride.status}</td>
                    <td>
                      <select
                        value={ride.status}
                        onChange={(e) =>
                          updateStatus(ride._id, e.target.value)
                        }
                      >
                        <option value="Pending">En attente</option>
                        <option value="Ended">Terminer</option>
                        <option value="Accepted">Accepté</option>
                        <option value="Rejected">Rejeté</option>
                      </select>
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
