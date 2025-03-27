import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Sidebar from "../../componentsfr/sidebar/Sidebar";
import Navbar from "../../componentsfr/navbar/Navbar";
import "./HistoriquepaymentCfr.scss";

const HistoriquepaymentCfr = () => {
    const { id } = useParams();
    const [payments, setPayments] = useState([]);
    const [filteredPayments, setFilteredPayments] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedWeek, setSelectedWeek] = useState("");
    const [months, setMonths] = useState([]);
    const [weeks, setWeeks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalAmount, setTotalAmount] = useState(0);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_BASE_URL}/historiquepayement/payments/${id}`
                );

                // Trier les paiements par `dateAjout` (du plus récent au plus ancien)
                const sortedPayments = response.data.sort((a, b) => 
                    new Date(b.dateAjout) - new Date(a.dateAjout)
                );

                setPayments(sortedPayments);
                setFilteredPayments(sortedPayments);

                // Calculer le montant total des paiements
                const total = sortedPayments.reduce((sum, payment) => sum + payment.prixAPayer, 0);
                setTotalAmount(total);

                // Extraire les mois et semaines uniques pour le filtrage
                const uniqueMonths = [...new Set(sortedPayments.map(p => p.mois))];
                setMonths(uniqueMonths);

                const uniqueWeeks = [...new Set(sortedPayments.map(p => p.semaine))];
                setWeeks(uniqueWeeks);
            } catch (err) {
                setError("Erreur lors du chargement des paiements.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPayments();
    }, [id]);

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

        // Recalculer le montant total après filtrage
        const total = filtered.reduce((sum, payment) => sum + payment.prixAPayer, 0);
        setTotalAmount(total);
    }, [selectedMonth, selectedWeek, payments]);

    // Fonction pour réinitialiser les filtres
    const resetFilters = () => {
        setSelectedMonth("");
        setSelectedWeek("");
    };

    if (loading) return <div className="loading">Chargement en cours...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="home">
            <Sidebar />
            <div className="homeContainer">
                <Navbar />
                <div className="payment-history">
                    <h2>Historique des paiements du chauffeur</h2>

                    <div className="filter-container">
                        <div className="filter-group">
                            <label>Mois :</label>
                            <select 
                                value={selectedMonth} 
                                onChange={(e) => setSelectedMonth(e.target.value)}
                            >
                                <option value="">Tous les mois</option>
                                {months.map((month) => (
                                    <option key={month} value={month}>{month}</option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>Semaine :</label>
                            <select 
                                value={selectedWeek} 
                                onChange={(e) => setSelectedWeek(e.target.value)}
                            >
                                <option value="">Toutes les semaines</option>
                                {weeks.map((week) => (
                                    <option key={week} value={week}>{week}</option>
                                ))}
                            </select>
                        </div>

                        {(selectedMonth || selectedWeek) && (
                            <div className="filter-group">
                                <button 
                                    className="reset-filters-btn" 
                                    onClick={resetFilters}
                                >
                                    Réinitialiser les filtres
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="total-amount">
                        <strong>Montant total : </strong> 
                        {totalAmount.toFixed(2)} €
                    </div>

                    <table className="payment-table">
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
                                        <td>{payment.prixAPayer.toFixed(2)} €</td>
                                        <td>{payment.mois}</td>
                                        <td>{payment.semaine}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="no-payments">
                                        Aucun paiement trouvé.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div> 
    );
};

export default HistoriquepaymentCfr;
