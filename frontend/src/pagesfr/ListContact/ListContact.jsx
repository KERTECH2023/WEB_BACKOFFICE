import React from 'react'

import "./listcontact.scss"
import Sidebar from "../../componentsfr/sidebar/Sidebar"
import Navbar from "../../componentsfr/navbar/Navbar"
import DataContact from "../../componentsfr/DataContact/DataContact"
const ListContact = () => {
    return (
        <div className="list">
          <Sidebar/>
          <div className="listContainer">
            <Navbar/>
            <DataContact/>
          </div>
        </div>
      )
}

export default ListContact