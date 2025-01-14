import React from 'react';
import "./ListFact.scss";
import Sidebar from "../../components/sidebar/Sidebar"
import Navbar from "../../components/navbar/Navbar"

import Datachauf from "../../components/datachauf/Datachauf"
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
