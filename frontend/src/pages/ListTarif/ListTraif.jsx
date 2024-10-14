import React, { useState } from 'react';
import "./listtraif.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import DataTarif from "../../components/DataTarif/DataTarif";
import axios from 'axios';

const ListTraif = () => {
    const [tarifName, setTarifName] = useState('');
    const [message, setMessage] = useState('');

    // Function to add a new tariff
    const addTarif = async () => {
        try {
            const response = await axios.post('/api/tarifs', { tarifName });
            setMessage(response.data.message);
            setTarifName('');  // Clear input field after success
        } catch (error) {
            console.error(error);
            setMessage('Failed to add tariff.');
        }
    };

    return (
        <div className="list">
            <Sidebar />
            <div className="listContainer">
                <Navbar />
                {/* Add Tarif Section */}
                <div className="addTarifSection">
                    <h2>Add a New Tariff</h2>
                    <input
                        type="text"
                        value={tarifName}
                        onChange={(e) => setTarifName(e.target.value)}
                        placeholder="Enter Tarif Name"
                        className="tarifInput"
                    />
                    <button onClick={addTarif} className="addTarifButton">Add Tarif</button>
                    {/* Display message from the server */}
                    {message && <p>{message}</p>}
                </div>
                {/* Existing Tarifs List */}
                <DataTarif />
            </div>
        </div>
    );
};

export default ListTraif;
