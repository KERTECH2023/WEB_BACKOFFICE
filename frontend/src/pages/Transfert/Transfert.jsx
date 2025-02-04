import React, { useState, useEffect } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import axios from "axios";
import "./LisTransfer.css"; // Ajout d'un fichier CSS pour le style

const LisTransfer = () => {
  const [transfers, setTransfers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  useEffect(() => {
    fetchTransfers();
  }, []);

  const fetchTransfers = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/transfer/transfert`);
      setTransfers((response.data || []).reverse());
    } catch (error) {
      console.error("Erreur lors de la récupération des transferts :", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="list">
      <Sidebar />
      <div className="listContainer">
        <Navbar />
        <h2>Liste des Transferts</h2>
        {isLoading ? (
          <p>Chargement...</p>
        ) : (
          <table className="transfer-table">
            <thead>
              <tr>
                <th>Prénom</th>
                <th>Nom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Aéroport</th>
                <th>Destination</th>
                <th>Passagers</th>
                <th>Prix (€)</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {transfers.map((transfer) => (
                <tr key={transfer._id}>
                  <td>{transfer.firstName}</td>
                  <td>{transfer.lastName}</td>
                  <td>{transfer.email}</td>
                  <td>{transfer.phone}</td>
                  <td>{transfer.airport}</td>
                  <td>{transfer.destination}</td>
                  <td>{transfer.passengers}</td>
                  <td>{parseFloat(transfer.price).toFixed(2)}</td>
                  <td>{new Date(transfer.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default LisTransfer;