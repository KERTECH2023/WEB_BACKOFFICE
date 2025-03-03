import React from "react";
import "./listnewchauf.scss";

import Sidebar from "../../componentsfr/sidebar/Sidebar";
import Navbar from "../../componentsfr/navbar/Navbar";

import DataNewChauf from "../../componentsfr/DataNewChauf/DataNewChauf";

const ListNewChauf = () => {
  return (
    <div className="list">
      <Sidebar />
      <div className="listContainer">
        <Navbar />
        <DataNewChauf />
      </div>
    </div>
  );
};

export default ListNewChauf;
