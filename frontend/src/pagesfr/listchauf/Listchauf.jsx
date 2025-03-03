import React from 'react';
import "./listchauf.scss"
import Sidebar from "../../componentsfr/sidebar/Sidebar"
import Navbar from "../../componentsfr/navbar/Navbar"

import Datachauf from "../../componentsfr/datachauf/Datachauf"
const Listchauf = () => {
  return (
    <div className="list">
      <Sidebar/>
      <div className="listContainer">
        <Navbar/>
        <Datachauf/>
      </div>
    </div>
  )
}

export default Listchauf