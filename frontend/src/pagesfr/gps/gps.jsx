import React from "react";
import "./ListFact.scss";
import Sidebar from "../../componentsfr/sidebar/Sidebar";
import Navbar from "../../componentsfr/navbar/Navbar";

import MapComponent from "../../componentsfr/gps/gps";
const Gpsfr = () => {
  return (
    <div className="list">
      <Sidebar />
      <div className="listContainer">
        <Navbar />
        <MapComponent />
      </div>
    </div>
  );
};

export default Gpsfr;

