import "./chauffdesac.scss"
import Sidebar from "../../componentsfr/sidebar/Sidebar"
import Navbar from "../../componentsfr/navbar/Navbar"

import DataChaufdesac from "../../componentsfr/dataChaufdesac/ChauffDesac"

const List = () => {
  return (
    <div className="list">
      <Sidebar/>
      <div className="listContainer">
        <Navbar/>
        <DataChaufdesac/>
       
      </div>
    </div>
  )
}

export default List