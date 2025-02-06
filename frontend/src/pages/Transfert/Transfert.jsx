import React, { useState, useEffect } from "react"; 
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import axios from "axios";
import "./LisTransfer.css"; // Ajout du fichier CSS pour le style

const LisTransfer = () => {
  const [transfers, setTransfers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // "accepted" ou "notAccepted"
  
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

  // ✅ Accepter un transfert
  const acceptTransfer = async (id) => {
    try {
      await axios.put(`${BASE_URL}/transfer/transfert/${id}`, { accepted: true });
      alert("Transfert accepté avec succès !");
      fetchTransfers(); // Rafraîchir la liste après acceptation
    } catch (error) {
      console.error("Erreur lors de l'acceptation du transfert :", error);
    }
  };

  // Filtrage des transferts
  const filteredTransfers = transfers.filter((transfer) => {
    const transferDate = transfer.datevol ? new Date(transfer.datevol).toISOString().split("T")[0] : "";
 // Utilisation de datevol
    const isDateMatch = !dateFilter || transferDate === dateFilter;
    const isStatusMatch = !statusFilter || 
      (statusFilter === "accepted" && transfer.accepter === "accepter") ||
      (statusFilter === "notAccepted" && transfer.accepter !== "accepter");
  
    return isDateMatch && isStatusMatch;
  });

  return (
    <div className="list">
      <Sidebar />
      <div className="listContainer">
        <Navbar />
        <h2>Liste des Transferts</h2>

        {/* Filtres */}
        <div className="filters">
          <input 
            type="date" 
            value={dateFilter} 
            onChange={(e) => setDateFilter(e.target.value)} 
            className="filter-input"
          />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)} 
            className="filter-select"
          >
            <option value="">Tous</option>
            <option value="accepted">Accepté</option>
            <option value="notAccepted">Non accepté</option>
          </select>
        </div>

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
                <th>Bagage Cabine</th>
                <th>Bagage Soute</th>
                <th>bagageHorsFormat</th>
                <th>Date vol</th>
                <th>Heure vol</th>
                <th>Numéro vol</th>
                <th>Aéroport</th>
                <th>Destination</th>
                <th>Passagers</th>
                <th>Prix (€)</th>
                <th>Date de résevation</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransfers.map((transfer) => (
                <tr key={transfer._id} className={transfer.accepter=="accepter" ? "accepted" : "not-accepted"}>
                  <td>{transfer.firstName}</td>
                  <td>{transfer.lastName}</td>
                  <td>{transfer.email}</td>
                  <td>{transfer.phone}</td>
                  <td>{transfer.bagageCabine}</td>
                  <td>{transfer.bagageSoute}</td>
                  <td>{transfer.bagageHorsFormat}</td>
                  <td>{transfer.datevol}</td>
                  <td>{transfer.heurvol}</td>
                  <td>{transfer.numvol}</td>
                  <td>{transfer.airport}</td>
                  <td>{transfer.destination}</td>
                  <td>{transfer.passengers}</td>
                  <td>{parseFloat(transfer.price).toFixed(2)}</td>
                  <td>{new Date(transfer.createdAt).toLocaleDateString()}</td>
                  <td>{transfer.accepter=="accepter"? "✅ Accepté" : "❌ Non accepté"}</td>
                  <td>
                    {transfer.accepter!="accepter" && (
                      <button className="accept-btn" onClick={() => acceptTransfer(transfer._id)}>
                        ✅ Accepter
                      </button>
                    )}
                  </td>
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
