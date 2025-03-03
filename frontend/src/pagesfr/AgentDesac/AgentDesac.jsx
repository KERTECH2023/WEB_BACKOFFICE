import "./agentdesac.scss"
import Sidebar from "../../componentsfr/sidebar/Sidebar"
import Navbar from "../../componentsfr/navbar/Navbar"
import AgentDesac from "../../componentsfr/dataAgentdesac/AgentDesac"

const List = () => {
  return (
    <div className="list">
      <Sidebar/>
      <div className="listContainer">
        <Navbar/>
        <AgentDesac/>
       
      </div>
    </div>
  )
}

export default List