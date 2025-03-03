import React from 'react'
import "./listclient.scss"
import Sidebar from "../../componentsfr/sidebar/Sidebar"
import Navbar from "../../componentsfr/navbar/Navbar"

import DataClient from "../../componentsfr/dataClient/DataClient"
const ListClient = () => {
    return (
        <div className="list">
          <Sidebar/>
          <div className="listContainer">
            <Navbar/>
            <DataClient/>
          </div>
        </div>
      )
}

export default ListClient