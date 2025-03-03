import React from 'react'
import "./listrec.scss"
import Sidebar from "../../componentsfr/sidebar/Sidebar"
import Navbar from "../../componentsfr/navbar/Navbar"

import DataRec from "../../componentsfr/DataRec/DataRec"
const ListClient = () => {
    return (
        <div className="list">
          <Sidebar/>
          <div className="listContainer">
            <Navbar/>
            <DataRec/>
          </div>
        </div>
      )
}

export default ListClient