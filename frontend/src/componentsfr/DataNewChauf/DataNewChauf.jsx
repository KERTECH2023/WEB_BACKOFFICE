import './datanewchauf.scss'
import { DataGrid } from "@mui/x-data-grid";
import { ChaufColumns } from "../../datatablechauf";
import { Link } from "react-router-dom";
import {React, useState,useEffect } from "react";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import "react-toastify/dist/ReactToastify.css";

const DataNewChauf = () => {

    const [data, setData] = useState([]);
    const [search, setsearch] = useState("");
    const role = window.localStorage.getItem("userRole");
    console.log("role**",role)

    useEffect(()=>{
      getUsers();
    },[]);
    const getUsers = async () =>{
      const response = await axios.get(process.env.REACT_APP_BASE_URL + "/Chaufffr/newchauf");
      if(response.status===200){
        setData(response.data)
      }
    };
    console.log("data=>",data)
    // const handleDelete = async (id) => {
    //   if(window.confirm("Are you sure that you wanted to delete this client")
    //   ){
    //     const response = await axios.delete(`process.env.REACT_APP_BASE_URL + /Chauff/destroychauff/${id}`);
    //     if(response.status===200){
    //       toast.success('Agent Deleted with Success !', {
    //         position: toast.POSITION.TOP_RIGHT
    //     });
    //     getUsers();
    //     }
    //   }
    // };
    const handleSearchTerm = (e) =>{
      console.log(e.target.value)
      let value = e.target.value;
      setsearch(value)

    };
    console.log(search)
  
    const actionColumn = [
      {
        field: "action",
        headerName: "Action",
        width: 300,
        renderCell: (params) => {
          return (
            <div className="cellAction">


              <Link to={`/cosnultCfr/${params.row.id}`} style={{ textDecoration: "none" }}>
                <div className="viewButton">Consulté</div>
              </Link>
              
            <div>
            {(role === "Admin" || role === "Agentad") && (
            <Link to={`/updateChfr/${params.row.id}`} style={{ textDecoration: "none",color: "inherit" }}>
                <div className="upButton">Mettre a jour </div>
              </Link>
               )}
            </div>
           
{/*   
              <div
                className="deleteButton"
                onClick={() => handleDelete(params.row.id)}
              >
                Delete
              </div> */}
            </div>
          );
        },
      },
    ];
  return (
    <div className="datatable">
        <div className="datatableTitle">
          Listes Des Nouveaux Chauffeurs
          <Link to="/Chauffeurfr/new" className="link">
          Ajouter
          </Link>
        </div>

        <div className="search">
          <input type="text" placeholder="Search..." onChange={handleSearchTerm}  name="Search"
        id="Search" className="find"/>
          <SearchOutlinedIcon />
        </div>
        <DataGrid
          className="datagrid"
          rows={data.filter((val) => {
            const searchTerm = search.toLowerCase();
            const chauffName = val.Nom.toLowerCase();
            const chauffprenom = val.Prenom.toLowerCase();
            const chauffphone = val.phone.toLowerCase();
            
            return chauffName.includes(searchTerm) || 
            chauffprenom.includes(searchTerm) ||
            chauffphone.includes(searchTerm);
          })}
          columns={ChaufColumns.concat(actionColumn)}
          pageSize={9}
          rowsPerPageOptions={[9]}
          checkboxSelection
        />
        <ToastContainer />
      </div>
  )
}

export default DataNewChauf
