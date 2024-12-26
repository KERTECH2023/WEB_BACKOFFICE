import React, { useState, useEffect } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import axios from "axios";

const Liscourse = () => {
  const [rides, setRides] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  useEffect(() => {
    fetchRides();
  }, [filterStatus]);

  const fetchRides = async () => {
    try {
      const endpoint =
        filterStatus === "all"
          ? "/Ride/firebaseToMongoDB"
          : `/Ride/ride-requests/status/${filterStatus}`;
      const response = await axios.post(`${BASE_URL}${endpoint}`, {});
      if (filterStatus === "all") {
        setRides(response.data.rideRequests || []);
      } else {
        setRides(response.data.rideRequests || []);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des courses :", error);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.post(
        `${BASE_URL}/Ride/rides/${id}/status`,
        { status: newStatus }
      );
      fetchRides(); // Rafraîchir les données après mise à jour
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
            <option value="Pending">En attente</option>
            <option value="Accepted">Accepté</option>
            <option value="Rejected">Rejeté</option>
          </select>
        </div>
        <div className="rides">
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Destination</th>
                <th>Statut</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rides.map((ride) => (
                <tr key={ride._id}>
                  <td>{ride.userName}</td>
                  <td>{ride.destinationAddress}</td>
                  <td>{ride.status}</td>
                  <td>
                    <select
                      value={ride.status}
                      onChange={(e) =>
                        updateStatus(ride._id, e.target.value)
                      }
                    >
                      <option value="Pending">En attente</option>
                      <option value="Accepted">Accepté</option>
                      <option value="Rejected">Rejeté</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Liscourse;
