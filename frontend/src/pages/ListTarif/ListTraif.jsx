import React, { useState } from 'react';
import "./listtraif.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import DataTarif from "../../components/DataTarif/DataTarif";

const ListTraif = () => {
    const [showForm, setShowForm] = useState(false);

    const handleAddClick = () => {
        setShowForm(!showForm);
    };

    return (
        <div className="list">
            <Sidebar/>
            <div className="listContainer">
                <Navbar/>
                <button onClick={handleAddClick}>
                    {showForm ? "Fermer le formulaire" : "Ajouter un tarif"}
                </button>
                {showForm && <TarifForm />}
                <DataTarif/>
            </div>
        </div>
    );
}

const TarifForm = () => {
    const [tarif, setTarif] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Logique pour soumettre le tarif
        console.log("Tarif ajouté:", tarif);
    };

    return (
        <form onSubmit={handleSubmit}>
            <input 
                type="text" 
                value={tarif} 
                onChange={(e) => setTarif(e.target.value)} 
                placeholder="Entrez le tarif" 
            />
            <button type="submit">Ajouter</button>
        </form>
    );
};

export default ListTraif;
