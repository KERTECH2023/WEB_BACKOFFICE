import React from "react";

import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";

import MapComponent from "../../components/gps/gps";
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

