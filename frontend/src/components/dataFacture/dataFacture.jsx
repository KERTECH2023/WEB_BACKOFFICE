import React, { useState, useEffect } from "react";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import { InvoiceColumns } from "../../DataTableInvoice";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
import "./dataFacture.css";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";

const DataFact = () => {
  const [data, setData] = useState([]);

  const [search, setSearch] = useState("");
  const [filteredData, setFilteredData] = useState(data);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  useEffect(() => {
    getUsers();
  }, []);

  const handleSearchTerm = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
  };

  const handleMonthFilter = (e) => {
    setSelectedMonth(e.target.value);
  };

  const handleYearFilter = (e) => {
    setSelectedYear(e.target.value);
  };

  useEffect(() => {
    const filtered = data.filter((row) => {
      const matchesSearch =
        (row.chauffeurName &&
          row.chauffeurName.toLowerCase().includes(search)) ||
        (row.chauffeurPrenom &&
          row.chauffeurPrenom.toLowerCase().includes(search));

      const matchesMonth = selectedMonth
        ? row.Month === parseInt(selectedMonth, 10)
        : true;

      const matchesYear = selectedYear
        ? row.Year === parseInt(selectedYear, 10)
        : true;

      return matchesSearch && matchesMonth && matchesYear;
    });

    setFilteredData(filtered);
  }, [search, selectedMonth, selectedYear, data]);

  const getUsers = async () => {
    try {
      console.log("Fetching factures...");
      const response = await axios.get("http://localhost:3001/Chauff/factures");
      if (response.status === 200) {
        const factures = response.data;
        console.log("Factures fetched:", factures);

        const filteredFactures = factures.filter(
          (facture) => facture.chauffeur
        );
        console.log("Filtered Factures:", filteredFactures);

        const enhancedFactures = await Promise.all(
          filteredFactures.map(async (facture) => {
            try {
              console.log(
                `Fetching chauffeur data for ${facture.chauffeur}...`
              );
              const chauffeurResponse = await axios.get(
                `http://localhost:3001/Chauff/searchchauf/${facture.chauffeur}`
              );
              if (chauffeurResponse.status === 200) {
                const chauffeurData = chauffeurResponse.data;
                console.log("Chauffeur data:", chauffeurData);

                console.log(
                  `Fetching ride counts for ${chauffeurData.phone}...`
                );
                const rideRequestsResponse = await axios.get(
                  `http://localhost:3001/Chauff/rideCounts?driverPhone=${chauffeurData.phone}`
                );
                if (rideRequestsResponse.status === 200) {
                  const rideCounts = rideRequestsResponse.data;
                  console.log("Ride counts:", rideCounts);

                  const acceptedCount = rideCounts.accepted;
                  const cancelledCount = rideCounts.cancelled;

                  return {
                    ...facture,
                    chauffeurName: chauffeurData.Nom,
                    chauffeurPrenom: chauffeurData.Prenom,
                    chauffeurEmail: chauffeurData.email,
                    chauffeurPhone: chauffeurData.phone,
                    photoAvatar: chauffeurData.photoAvatar,
                    acceptedRides: acceptedCount,
                    cancelledRides: cancelledCount,
                  };
                }
                return {
                  ...facture,
                  chauffeurName: chauffeurData.Nom,
                  chauffeurPrenom: chauffeurData.Prenom,
                  chauffeurEmail: chauffeurData.email,
                  chauffeurPhone: chauffeurData.phone,
                  photoAvatar: chauffeurData.photoAvatar,
                  acceptedRides: 0,
                  cancelledRides: 0,
                };
              }
              return facture;
            } catch (error) {
              console.error(
                `Error fetching chauffeur data for ${facture.chauffeur}:`,
                error
              );
              return facture;
            }
          })
        );

        setData(enhancedFactures);
      }
    } catch (error) {
      console.error("Error fetching factures:", error);
    }
  };

  const actionColumn = [
    {
      field: "action",
      headerName: "Action",
      width: 300,
      renderCell: (params) => {
        const role = window.localStorage.getItem("userRole");
        return (
          <div className="cellAction">
            {(role === "Admin" || role === "Agentad") && (
              <>
                <Link
                  to={`/consultF/${params.row._id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div className="viewButton">Consulté</div>
                </Link>
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="datatable">
      <div className="datatableTitle">
        Listes Des Facture
        <Link to="/Chauffeur/new" className="link"></Link>
      </div>
      <div className="filters">
        <div className="search">
          <input
            type="text"
            placeholder="Search..."
            onChange={handleSearchTerm}
            name="Search"
            id="Search"
            className="find"
          />
          <SearchOutlinedIcon />
        </div>
        <select
          onChange={handleMonthFilter}
          value={selectedMonth}
          className="filterSelect"
        >
          <option value="">Tous les mois</option>
          <option value="1">Janvier</option>
          <option value="2">Février</option>
          <option value="3">Mars</option>
          <option value="4">Avril</option>
          <option value="5">Mai</option>
          <option value="6">Juin</option>
          <option value="7">Juillet</option>
          <option value="8">Août</option>
          <option value="9">Septembre</option>
          <option value="10">Octobre</option>
          <option value="11">Novembre</option>
          <option value="12">Décembre</option>
        </select>
        <select
          onChange={handleYearFilter}
          value={selectedYear}
          className="filterSelect"
        >
          <option value="">Toutes les années</option>
          <option value="2023">2023</option>
          <option value="2024">2024</option>
          <option value="2025">2025</option>
          <option value="2026">2026</option>
          <option value="2027">2027</option>
        </select>
      </div>

      <DataGrid
        className="datagrid"
        rows={filteredData}
        columns={InvoiceColumns.concat(actionColumn)}
        pageSize={9}
        rowsPerPageOptions={[9]}
        checkboxSelection
        getRowId={(row) => row._id}
      />
      <ToastContainer />
    </div>
  );
};

export default DataFact;
