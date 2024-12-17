/* eslint-disable no-unused-vars */
import "./updchauf.scss";
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";

const UpdChauf = () => {
  const [form, setForm] = useState({});
  const [photoAvatar, setPhotoAvatar] = useState(null);
  const [photoCin, setPhotoCin] = useState(null);
  const [photoPermisRec, setPhotoPermisRec] = useState(null);
  const [photoPermisVer, setPhotoPermisVer] = useState(null);
  const [photoVtc, setPhotoVtc] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [clickedFile, setClickedFile] = useState(null);
  const role = window.localStorage.getItem("userRole");
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      getSingleUser(id);
      getVehicleDetails(id);
    }
  }, [id]);

  const getSingleUser = async (id) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/Chauff/searchchauf/${id}`);
      if (response.status === 200) {
        setForm({ ...response.data });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const getVehicleDetails = async (id) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/Voi/getvoi/${id}`);
      if (response.status === 200) {
        setVehicle(response.data);
      }
    } catch (error) {
      console.error("Error fetching vehicle data:", error);
    }
  };

  const onChangeHandler = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("photoAvatar", photoAvatar);
    data.append("photoCin", photoCin);
    data.append("photoPermisRec", photoPermisRec);
    data.append("photoPermisVer", photoPermisVer);
    data.append("photoVtc", photoVtc);

    for (const key in form) {
      data.append(key, form[key]);
    }

    try {
      const response = await axios.put(`${process.env.REACT_APP_BASE_URL}/Chauff/updatechauf/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.status === 200) {
        toast.success("Chauffeur mis à jour avec succès !");
        setTimeout(() => navigate("/Chauffeur"), 3000);
      }
    } catch (error) {
      console.error("Error updating chauffeur:", error);
      toast.error("Erreur lors de la mise à jour !");
    }
  };

  const handleFileClick = (file) => setClickedFile(file);
  const handleCloseFile = () => setClickedFile(null);

  const renderFile = (fileUrl, alt) => {
    if (!fileUrl) return null;
    const ext = fileUrl.toLowerCase().split(".").pop();
    const isPDF = ext === "pdf";
    const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(ext);

    return (
      <div onClick={() => handleFileClick(fileUrl)} style={{ cursor: "pointer" }}>
        {isImage ? <img src={fileUrl} alt={alt} style={{ width: "50px" }} /> : "Voir PDF"}
      </div>
    );
  };

  return (
    <div className="new">
      <Sidebar />
      <div className="newContainer">
        <Navbar />
        <div className="top">
          <h1>Mettre à jour Agent : {form.Nom}</h1>
        </div>
        <div className="bottom">
          <div className="right">
            <form onSubmit={handleSubmit}>
              <p className="item">
                <label>Nom :</label>
                <input type="text" name="Nom" onChange={onChangeHandler} value={form.Nom || ""} required />
              </p>
              <p className="item">
                <label>Prenom :</label>
                <input type="text" name="Prenom" onChange={onChangeHandler} value={form.Prenom || ""} required />
              </p>
              <p className="item">
                <label>Email :</label>
                <input type="email" name="email" onChange={onChangeHandler} value={form.email || ""} required disabled={role === "Agent"} />
              </p>
              <p className="item">
                <label>Photo Avatar :</label>
                <input type="file" onChange={(e) => setPhotoAvatar(e.target.files[0])} />
              </p>
              <button type="submit">Mettre à jour</button>
            </form>
          </div>
          <div className="vehicle-details">
            <h2>Détails de la voiture</h2>
            {vehicle ? (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Modelle</TableCell>
                      <TableCell>Immatriculation</TableCell>
                      <TableCell>Carte Grise</TableCell>
                      <TableCell>Assurance</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>{vehicle.modelle}</TableCell>
                      <TableCell>{vehicle.immatriculation}</TableCell>
                      <TableCell>{renderFile(vehicle.cartegrise, "Carte Grise")}</TableCell>
                      <TableCell>{renderFile(vehicle.assurance, "Assurance")}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <p>Aucune information sur la voiture disponible.</p>
            )}
          </div>
        </div>
      </div>
      {clickedFile && (
        <div className="fileOverlay" onClick={handleCloseFile}>
          {clickedFile.endsWith(".pdf") ? (
            <iframe src={clickedFile} title="PDF Viewer" style={{ width: "90%", height: "90%", border: "none" }} />
          ) : (
            <img src={clickedFile} alt="Aperçu" style={{ maxWidth: "90%", maxHeight: "90%" }} />
          )}
          <span className="close">&times;</span>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default UpdChauf;
