import "./ClientDesa"
import Sidebar from "../../componentsfr/sidebar/Sidebar"
import Navbar from "../../componentsfr/navbar/Navbar"
import DataClientDesa from  "../../componentsfr/dataCLientDesac/DataClientDesa"

const List = () => {
  return (
    <div className="list">
      <Sidebar/>
      <div className="listContainer">
        <Navbar/>
        <DataClientDesa/>
       
      </div>
    </div>
  )
}

export default List