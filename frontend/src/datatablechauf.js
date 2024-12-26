export const ChaufColumns = [
  {
    field: "Nom d'utilisateur",
    headerName: "Nom d'utilisateur",
    width: 160,
    renderCell: (params) => {
      return (
        <div className="cellWithImg">
          <img className="cellImg" src={params.row.photoAvatar} alt="avatar" />
          {params.row.username}
        </div>
      );
    },
  },
  {
    field: "Nom",
    headerName: "Nom",
    width: 180,
    renderCell: (params) => {
      return (
        <div className="cellWithImg">
          {params.row.Nom}
        </div>
      );
    },
  },
  {
    field: "Prenom",
    headerName: "Prenom",
    width: 180,
    renderCell: (params) => {
      return (
        <div className="cellWithImg">
          {params.row.Prenom}
        </div>
      );
    },
  },
  {
    field: "email",
    headerName: "Email",
    width: 200,
  },
  {
    field: "phone",
    headerName: "Téléphone",
    width: 100,
  },
  {
    field: "Cstatus",
    headerName: "Compte Status",
    width: 120,
    renderCell: (params) => {
      return (
        <div className={`cellWithStatus ${params.row.Cstatus}`}>
          {params.row.Cstatus}
        </div>
      );
    },
  },
  {
    field: "role",
    headerName: "Rôle",
    width: 160,
    renderCell: (params) => {
      return (
        <div className={`cellWithStatus ${params.row.role}`}>
          {params.row.role}
        </div>
      );
    },
  },
  // Nouvelle colonne pour afficher la date de mise à jour
  {
    field: "updatedAt",
    headerName: "Dernière Mise à Jour",
    width: 180,
    renderCell: (params) => {
      // Formater la date dans un format lisible
      const updatedDate = new Date(params.row.updatedAt).toLocaleString();
      return (
        <div className="cellWithDate">
          {updatedDate}
        </div>
      );
    },
  },
  // Nouvelle colonne pour afficher l'adresse
  {
    field: "address",
    headerName: "Adresse",
    width: 200,
    renderCell: (params) => {
      return (
        <div className="cellWithAddress">
          {params.row.address}
        </div>
      );
    },
  },
];
