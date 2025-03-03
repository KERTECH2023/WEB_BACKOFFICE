import React from "react";
import "./ListFact.scss";
import Sidebar from "../../componentsfr/sidebar/Sidebar";
import Navbar from "../../componentsfr/navbar/Navbar";

import DataFact from "../../componentsfr/dataFacture/dataFacture";
const ListFacture = () => {
  return (
    <div className="list">
      <Sidebar />
      <div className="listContainer">
        <Navbar />
        <DataFact />
      </div>
    </div>
  );
};

export default ListFacture;

