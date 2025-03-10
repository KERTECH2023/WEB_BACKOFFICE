// MapComponent.js
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Définir une icône personnalisée pour la voiture
const carIcon = new L.Icon({
  iconUrl: 'https://img.icons8.com/color/48/000000/car--v1.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40], // pour bien positionner l'icône sur le marqueur
});

const MapComponent = () => {
  const [positions, setPositions] = useState([]);

  // Fonction pour récupérer les positions depuis l'API Node.js
  const fetchPositions = async () => {
    try {
      const response = await fetch(process.env.REACT_APP_BASE_URL + '/gpspostion/getallgpsposition');
      const data = await response.json();
      setPositions(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des positions:", error);
    }
  };

  useEffect(() => {
    fetchPositions(); // appel initial
    const interval = setInterval(fetchPositions, 30000);
    return () => clearInterval(interval);
  }, []);

  // Centre initial de la carte
  const center = [33.8813476, 10.860914];

  return (
    <MapContainer center={center} zoom={8} style={{ height: '100vh', width: '100vw' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {positions.map((driver) => (
        <Marker
          key={driver.id}
          position={[driver.latitude, driver.longitude]}
          icon={carIcon}
        >
          <Tooltip permanent direction="top" offset={[0, -40]}>
            <div style={{ textAlign: 'center', fontSize: '12px', background: 'white', padding: '2px 4px', borderRadius: '4px' }}>
              <strong>{driver.name}</strong><br />
              {driver.phone}
            </div>
          </Tooltip>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapComponent;
