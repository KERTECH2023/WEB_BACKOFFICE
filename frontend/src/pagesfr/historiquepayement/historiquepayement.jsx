import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Sidebar from "../../componentsfr/sidebar/Sidebar";
import Navbar from "../../componentsfr/navbar/Navbar";

const PaymentHistory = () => {
    const { idFirebaseChauffeur } = useParams(); // Récupération de l'ID chauffeur via l'URL
    const [payments, setPayments] = useState([]);
    const [filteredPayments, setFilteredPayments] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedWeek, setSelectedWeek] = useState("");
    const [months, setMonths] = useState([]);
    const [weeks, setWeeks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_BASE_URL}/historiquepayement/payments/${idFirebaseChauffeur}`
                );

                // Trier les paiements par `dateAjout` (du plus récent au plus ancien)
                const sortedPayments = response.data.sort((a, b) => 
                    new Date(b.dateAjout) - new Date(a.dateAjout)
                );

                setPayments(sortedPayments);
                setFilteredPayments(sortedPayments);

                // Extraire les mois et semaines uniques pour le filtrage
                const uniqueMonths = [...new Set(sortedPayments.map(p => p.mois))];
                setMonths(uniqueMonths);

                const uniqueWeeks = [...new Set(sortedPayments.map(p => p.semaine))];
                setWeeks(uniqueWeeks);
            } catch (err) {
                setError("Erreur lors du chargement des paiements.");
            } finally {
                setLoading(false);
            }
        };

        fetchPayments();
    }, [idFirebaseChauffeur]);

    // Fonction de filtrage
    useEffect(() => {
        let filtered = payments;

        if (selectedMonth) {
            filtered = filtered.filter(p => p.mois === selectedMonth);
        }

        if (selectedWeek) {
            filtered = filtered.filter(p => p.semaine === selectedWeek);
        }

        setFilteredPayments(filtered);
    }, [selectedMonth, selectedWeek, payments]);

    if (loading) return <p>Chargement en cours...</p>;
    if (error) return <p>{error}</p>;

    return (
      <div className="home">
      <Sidebar />
      <div className="homeContainer">
        <Navbar />
        <div>
            <h2>Historique des paiements du chauffeur {idFirebaseChauffeur}</h2>

            {/* Sélection du mois */}
            <label>Mois :</label>
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                <option value="">Tous les mois</option>
                {months.map((month) => (
                    <option key={month} value={month}>{month}</option>
                ))}
            </select>

            {/* Sélection de la semaine */}
            <label>Semaine :</label>
            <select value={selectedWeek} onChange={(e) => setSelectedWeek(e.target.value)}>
                <option value="">Toutes les semaines</option>
                {weeks.map((week) => (
                    <option key={week} value={week}>{week}</option>
                ))}
            </select>

            {/* Tableau des paiements filtrés */}
            <table border="1">
                <thead>
                    <tr>
                        <th>Date d'Ajout</th>
                        <th>Prix à Payer</th>
                        <th>Mois</th>
                        <th>Semaine</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredPayments.length > 0 ? (
                        filteredPayments.map((payment) => (
                            <tr key={payment._id}>
                                <td>{new Date(payment.dateAjout).toLocaleString()}</td>
                                <td>{payment.prixAPayer} €</td>
                                <td>{payment.mois}</td>
                                <td>{payment.semaine}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4">Aucun paiement trouvé.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
       </div>
       </div> 
    );
};

export default PaymentHistory;
