import React from 'react'
import "./listtraif.scss"
import Sidebar from "../../componentsfr/sidebar/Sidebar"
import Navbar from "../../componentsfr/navbar/Navbar"

import DataTarif from "../../componentsfr/DataTarif/DataTarif"
const ListTraif = () => {
    return (
        <div className="list">
          <Sidebar/>
          <div className="listContainer">
            <Navbar/>
            <DataTarif/>
          </div>
        </div>
      )
}

export default ListTraif
