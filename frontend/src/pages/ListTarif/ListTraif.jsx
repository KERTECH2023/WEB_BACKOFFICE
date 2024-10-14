import React, { useState } from 'react';
import './listtraif.scss';
import Sidebar from '../../components/sidebar/Sidebar';
import Navbar from '../../components/navbar/Navbar';
import DataTarif from '../../components/DataTarif/DataTarif';

const ListTraif = () => {
  const [tarifName, setTarifName] = useState('');

  const handleAddTarif = () => {
    // Logique pour ajouter le tarif
    console.log('Ajouter Tarif:', tarifName);
    // Ici, vous pouvez appeler une API ou mettre à jour l'état global
    setTarifName('');
  };

  return (
    <div className="list">
      <Sidebar />
      <div className="listContainer">
        <Navbar />
        <div className="formContainer">
          <input
            type="text"
            value={tarifName}
            onChange={(e) => setTarifName(e.target.value)}
            placeholder="Nom du tarif"
          />
          <button onClick={handleAddTarif}>Ajouter Tarif</button>
        </div>
        <DataTarif />
      </div>
    </div>
  );
};

export default ListTraif;
