import React from "react";
import "./ListFact.scss";
import Sidebar from "../../componentsfr/sidebar/Sidebar";
import Navbar from "../../componentsfr/navbar/Navbar";

import DataDetailSolde from "../../componentsfr/dataConsultsoldech/Consultesolde";
const ListDataDetailSolde = () => {
  return (
    <div className="list">
      <Sidebar />
      <div className="listContainer">
        <Navbar />
        <DataDetailSolde />
      </div>
    </div>
  );
};

export default ListDataDetailSolde;

