import * as React from "react";
import { DataGrid } from "@mui/x-data-grid";

export const InvoiceColumns = [
  {
    field: "Nom Chauffeur",
    headerName: "Nom Chauffeur",
    width: 150,
    headerAlign: "center",
    renderCell: (params) => {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%",
          }}
        >
          <img
            style={{ marginRight: "10px", borderRadius: "50%" }}
            src={params.row.photoAvatar}
            alt="avatar"
            width="30"
            height="30"
          />
          {params.row.chauffeurPrenom} {params.row.chauffeurName}
        </div>
      );
    },
  },
  {
    field: "NumTelChauffeur",
    headerName: "Num Tel Chauffeur",
    width: 140,
    headerAlign: "center",
    renderCell: (params) => {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%",
          }}
        >
          {params.row.chauffeurPhone}
        </div>
      );
    },
  },
  {
    field: "Montant Total",
    headerName: "Montant Total",
    width: 120,
    headerAlign: "center",
    renderCell: (params) => {
      const totalFareAmount = Number(params.row.totalFareAmount);
      const formattedtotalFareAmount = !isNaN(totalFareAmount)
        ? totalFareAmount.toFixed(1)
        : "N/A";
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%",
          }}
        >
          {formattedtotalFareAmount}
        </div>
      );
    },
  },
  {
    field: "Montant à Payer",
    headerName: "Montant à Payer",
    width: 120,
    headerAlign: "center",
    renderCell: (params) => {
      const totalFareAmount = Number(params.row.totalFareAmount);
      const montantMultiplie = totalFareAmount * 0.15;
      const formattedMontantTva = !isNaN(montantMultiplie)
        ? montantMultiplie.toFixed(1)
        : "N/A";
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%",
          }}
        >
          {formattedMontantTva}
        </div>
      );
    },
  },
  {
    field: "Mois",
    headerName: "Mois",
    width: 140,
    headerAlign: "center",
    renderCell: (params) => {
      const getMonthName = (monthNumber) => {
        const monthNames = [
          "Janvier",
          "Février",
          "Mars",
          "Avril",
          "Mai",
          "Juin",
          "Juillet",
          "Août",
          "Septembre",
          "Octobre",
          "Novembre",
          "Décembre",
        ];
        return monthNames[monthNumber - 1];
      };

      const month = params.row.Month;
      const year = params.row.Year;
      const monthYear = `${getMonthName(month)} - ${year}`;

      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%",
          }}
        >
          {monthYear}
        </div>
      );
    },
  },
  {
    field: "Trajets Annulé",
    headerName: "Trajets Annulé",
    width: 120,
    headerAlign: "center",
    renderCell: (params) => {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%",
          }}
        >
          {params.row.cancelledRides || 0}
        </div>
      );
    },
  },
  {
    field: "Trajets Accepté",
    headerName: "Trajets Accepté",
    width: 120,
    headerAlign: "center",
    renderCell: (params) => {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%",
          }}
        >
          {params.row.acceptedRides || 0}
        </div>
      );
    },
  },
  {
    field: "Status",
    headerName: "Status",
    width: 150,
    headerAlign: "center",
    renderCell: (params) => {
      const isPaid = params.row.isPaid;

      const invoiceYear = params.row.Year;
      const invoiceMonth = params.row.Month;
      const invoiceDate = new Date(invoiceYear, invoiceMonth - 1, 1);

      const currentDate = new Date();
      const differenceInTime = currentDate - invoiceDate;
      const differenceInDays = differenceInTime / (1000 * 3600 * 24);

      const isLate = !isPaid && differenceInDays > 45;

      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%",
          }}
        >
          {isPaid ? "Payé" : isLate ? "En retard" : "Non payé"}
        </div>
      );
    },
  },
  {
    field: "Envoyé Par Email",
    headerName: "Envoyé Par Email",
    width: 170,
    headerAlign: "center",
    renderCell: (params) => {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%",
          }}
        >
          {params.row.envoieFacture ? "Envoyé" : "Non Envoyé"}
        </div>
      );
    },
  },
];

const InvoiceTable = () => {
  return (
    <div style={{ height: 600, width: "100%" }}>
      <DataGrid
        columns={InvoiceColumns}
        pageSize={10}
        rowsPerPageOptions={[5, 10, 20]}
        checkboxSelection
      />
    </div>
  );
};

export default InvoiceTable;
