/* eslint-disable no-unused-vars */
import "./updchauf.scss";
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const UpdChauf = () => {
  const [photoAvatar, setPhotoAvatar] = useState(null);
  const [photoCin, setPhotoCin] = useState(null);
  const [photoPermisRec, setPhotoPermisRec] = useState(null);
  const [photoPermisVer, setPhotoPermisVer] = useState(null);
  const [photoVtc, setPhotoVtc] = useState(null);
  const [carteGrise, setCarteGrise] = useState(null);
  const [assurance, setAssurance] = useState(null);
  const [form, setForm] = useState({});
  const [voiture, setVoiture] = useState({});
  const role = window.localStorage.getItem("userRole");
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      getSingleUser(id);
      getVoiture(id);
    }
  }, [id]);

  const getSingleUser = async (id) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/Chauff/searchchauf/${id}`);
      if (response.status === 200) {
        setForm(response.data);
      }
    } catch (error) {
      console.error("Error fetching user data", error);
    }
  };

  const getVoiture = async (id) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/Voi/getvoi/${id}`);
      if (response.status === 200) {
        setVoiture(response.data);
      }
    } catch (error) {
      console.error("Error fetching vehicle data", error);
    }
  };

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
    setVoiture((prevVoiture) => ({ ...prevVoiture, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    const datav = new FormData();

    if (photoAvatar) data.append("photoAvatar", photoAvatar);
    if (photoCin) data.append("photoCin", photoCin);
    if (photoPermisRec) data.append("photoPermisRec", photoPermisRec);
    if (photoPermisVer) data.append("photoPermisVer", photoPermisVer);
    if (photoVtc) data.append("photoVtc", photoVtc);

    if (carteGrise) datav.append("cartegrise", carteGrise);
    if (assurance) datav.append("assurance", assurance);

    Object.keys(form).forEach((key) => data.append(key, form[key]));
    Object.keys(voiture).forEach((key) => datav.append(key, voiture[key]));

    try {
      await axios.put(`${process.env.REACT_APP_BASE_URL}/Chauff/updatechauf/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Chauffeur updated successfully!", { position: "top-right" });
    } catch (err) {
      toast.error("Error updating chauffeur!", { position: "top-right" });
    }

    try {
      await axios.put(`${process.env.REACT_APP_BASE_URL}/Voi/updatevoi/${voiture.id}`, datav, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Vehicle updated successfully!", { position: "top-right" });
      setTimeout(() => navigate("/Chauffeur"), 3000);
    } catch (err) {
      toast.error("Error updating vehicle!", { position: "top-right" });
    }
  };

  return (
    <div className="new">
      <Sidebar />
      <div className="newContainer">
        <Navbar />
        <div className="top">
          <h1>Mettre à jour Agent : {form.Nom || "N/A"}</h1>
        </div>
        <div className="bottom">
          <div className="right">
            <form id="login" method="PUT" onSubmit={handleSubmit}>
              {/* General Fields */}
              <p className="item">
                <label>Nom :</label><br />
                <input
                  type="text"
                  onChange={onChangeHandler}
                  name="Nom"
                  className="InputBox"
                  id="Nom"
                  value={form.Nom || ""}
                  required
                />
              </p>
              <p className="item">
                <label>Prénom :</label><br />
                <input
                  type="text"
                  onChange={onChangeHandler}
                  name="Prenom"
                  className="InputBox"
                  id="Prenom"
                  value={form.Prenom || ""}
                  required
                />
              </p>
              <p className="item">
                <label>Email :</label><br />
                <input
                  type="email"
                  onChange={onChangeHandler}
                  name="email"
                  className="InputBox"
                  id="email"
                  value={form.email || ""}
                  required
                  disabled={role === "Agent"}
                />
              </p>
              <p className="item">
                <label>Phone :</label><br />
                <input
                  type="text"
                  onChange={onChangeHandler}
                  name="phone"
                  className="InputBox"
                  id="phone"
                  value={form.phone || ""}
                  required
                />
              </p>
  
              {/* Vehicle Details */}
              <p className="item">
                <label>Modèle Voiture :</label><br />
                <input
                  type="text"
                  onChange={onChangeHandler}
                  name="modelle"
                  className="InputBox"
                  id="modelle"
                  value={voiture?.modelle || ""}
                  required
                />
              </p>
              <p className="item">
                <label>Immatriculation Voiture :</label><br />
                <input
                  type="text"
                  onChange={onChangeHandler}
                  name="immatriculation"
                  className="InputBox"
                  id="immatriculation"
                  value={voiture?.immatriculation || ""}
                  required
                />
              </p>
  
              {/* Other Details */}
              <p className="item">
                <label>Genre :</label><br />
                <select
                  onChange={onChangeHandler}
                  value={form.gender || ""}
                  name="gender"
                  id="gender"
                  required
                >
                  <option value="">-</option>
                  <option value="male">Homme</option>
                  <option value="female">Femme</option>
                </select>
              </p>
              <p className="item">
                <label>Nationalité :</label><br />
                <select
                  onChange={onChangeHandler}
                  value={form.Nationalite || ""}
                  name="Nationalite"
                  id="Nationalite"
                  required
                >
                  <option value="">-</option>
                  <option value="Tunisian">Tunisienne</option>
                  <option value="Francais">Française</option>
                  <option value="Marocain">Marocaine</option>
                </select>
              </p>
              <p className="item">
                <label>N° Permis :</label><br />
                <input
                  type="text"
                  onChange={onChangeHandler}
                  name="cnicNo"
                  className="InputBox"
                  id="cnicNo"
                  value={form.cnicNo || ""}
                  required
                  disabled={role === "Agent"}
                />
              </p>
              <p className="item">
                <label>Adresse :</label><br />
                <input
                  type="text"
                  onChange={onChangeHandler}
                  name="address"
                  className="InputBox"
                  id="address"
                  value={form.address || ""}
                  required
                />
              </p>
              <p className="item">
                <label>Code Postal :</label><br />
                <input
                  type="text"
                  onChange={onChangeHandler}
                  name="postalCode"
                  className="InputBox"
                  id="postalCode"
                  value={form.postalCode || ""}
                  required
                />
              </p>
  
              {/* File Uploads */}
              {[
                { label: "Photo de Profil", name: "photoAvatar" },
                { label: "Photo de CIN", name: "photoCin" },
                { label: "Photo de Permis Recto", name: "photoPermisRec" },
                { label: "Photo de Permis Verso", name: "photoPermisVer" },
                { label: "Photo de VTC", name: "photoVtc" },
                { label: "Carte Grise", name: "cartegrise" },
                { label: "Assurance", name: "assurance" },
              ].map((field, idx) => (
                <p className="item" key={idx}>
                  <label>{field.label} :</label><br />
                  <img
                    src={voiture?.[field.name] || ""}
                    alt=""
                    className="itemImg"
                  />
                  <input
                    type="file"
                    onChange={(e) => setFieldValue(field.name, e.target.files[0])}
                    name={field.name}
                    className="InputBox"
                    id={field.name}
                  />
                </p>
              ))}
  
              {/* Submit Button */}
              <p className="item">
                <button id="sub_btn" type="submit">
                  Mettre à Jour
                </button>
              </p>
              <ToastContainer />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
  
};

export default UpdChauf;
