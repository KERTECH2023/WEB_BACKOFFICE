import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const UpdChauf = () => {
  const [formData, setFormData] = useState({
    chauffeur: {},
    vehicle: {},
    files: {
      photoAvatar: null,
      photoCin: null,
      photoPermisRec: null,
      photoPermisVer: null,
      photoVtc: null,
      cartegrise: null,
      assurance: null,
    }
  });

  const role = window.localStorage.getItem("userRole");
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      const [chauffeurRes, vehicleRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_BASE_URL}/Chauff/searchchauf/${id}`),
        axios.get(`${process.env.REACT_APP_BASE_URL}/Voi/getvoi/${id}`)
      ]);

      setFormData(prev => ({
        ...prev,
        chauffeur: chauffeurRes.data,
        vehicle: vehicleRes.data
      }));
    } catch (error) {
      toast.error("Error fetching data");
      console.error("Error fetching data:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Determine if the field belongs to vehicle or chauffeur form
    const isVehicleField = ['modelle', 'immatriculation', 'cartegrise', 'assurance'].includes(name);
    
    setFormData(prev => ({
      ...prev,
      [isVehicleField ? 'vehicle' : 'chauffeur']: {
        ...prev[isVehicleField ? 'vehicle' : 'chauffeur'],
        [name]: value
      }
    }));
  };

  const handleFileChange = (name, file) => {
    setFormData(prev => ({
      ...prev,
      files: {
        ...prev.files,
        [name]: file
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Update chauffeur data
      const chauffeurFormData = new FormData();
      Object.entries(formData.chauffeur).forEach(([key, value]) => {
        chauffeurFormData.append(key, value);
      });
      Object.entries(formData.files).forEach(([key, file]) => {
        if (file && !['cartegrise', 'assurance'].includes(key)) {
          chauffeurFormData.append(key, file);
        }
      });

      // Update vehicle data
      const vehicleFormData = new FormData();
      Object.entries(formData.vehicle).forEach(([key, value]) => {
        vehicleFormData.append(key, value);
      });
      if (formData.chauffeur.Nom && formData.chauffeur.phone) {
        vehicleFormData.append('phone', formData.chauffeur.phone);
        vehicleFormData.append('Nom', formData.chauffeur.Nom);
      }
      if (formData.files.cartegrise) {
        vehicleFormData.append('cartegrise', formData.files.cartegrise);
      }
      if (formData.files.assurance) {
        vehicleFormData.append('assurance', formData.files.assurance);
      }

      await Promise.all([
        axios.put(
          `${process.env.REACT_APP_BASE_URL}/Chauff/updatechauf/${id}`,
          chauffeurFormData,
          { headers: { "Content-Type": "multipart/form-data" } }
        ),
        axios.put(
          `${process.env.REACT_APP_BASE_URL}/Voi/updatevoi/${formData.vehicle.id}`,
          vehicleFormData,
          { headers: { "Content-Type": "multipart/form-data" } }
        )
      ]);

      toast.success("Update successful!");
      setTimeout(() => navigate("/Chauffeur"), 3000);
    } catch (error) {
      toast.error("Error updating data");
      console.error("Error updating data:", error);
    }
  };

  const renderField = (label, name, type = "text", options = null, disabled = false) => (
    <div className="item">
      <label>{label}:</label><br />
      {options ? (
        <select
          name={name}
          value={formData.chauffeur[name] || ""}
          onChange={handleInputChange}
          disabled={disabled}
          required
        >
          <option value="">-</option>
          {options.map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={
            name === 'modelle' || name === 'immatriculation'
              ? formData.vehicle[name] || ""
              : formData.chauffeur[name] || ""
          }
          onChange={handleInputChange}
          className="InputBox"
          disabled={disabled}
          required
        />
      )}
    </div>
  );

  const renderFileUpload = (label, name, entity = 'chauffeur') => (
    <div className="item">
      <label>{label}:</label><br />
      <img
        src={formData[entity][name] || ""}
        alt=""
        className="itemImg"
      />
      <input
        type="file"
        onChange={(e) => handleFileChange(name, e.target.files[0])}
        className="InputBox"
      />
    </div>
  );

  return (
    <div className="new">
      <Sidebar />
      <div className="newContainer">
        <Navbar />
        <div className="top">
          <h1>Mettre à jour Agent : {formData.chauffeur.Nom || "N/A"}</h1>
        </div>
        <div className="bottom">
          <div className="right">
            <form onSubmit={handleSubmit}>
              {/* Personal Information */}
              {renderField("Nom", "Nom")}
              {renderField("Prénom", "Prenom")}
              {renderField("Email", "email", "email", null, role === "Agent")}
              {renderField("Phone", "phone")}
              
              {/* Vehicle Information */}
              {renderField("Modèle Voiture", "modelle")}
              {renderField("Immatriculation Voiture", "immatriculation")}
              
              {/* Other Details */}
            
              {renderField("N° Permis", "cnicNo", "text", null, role === "Agent")}
              {renderField("Adresse", "address")}
              
              
              {/* File Uploads */}
              {renderFileUpload("Photo de Profil", "photoAvatar")}
              {renderFileUpload("Photo de CIN", "photoCin")}
              {renderFileUpload("Photo de Permis Recto", "photoPermisRec")}
              {renderFileUpload("Photo de Permis Verso", "photoPermisVer")}
              {renderFileUpload("Photo de VTC", "photoVtc")}
              {renderFileUpload("Carte Grise", "cartegrise", "vehicle")}
              {renderFileUpload("Assurance", "assurance", "vehicle")}
              
              <div className="item">
                <button type="submit" id="sub_btn">
                  Mettre à Jour
                </button>
              </div>
            </form>
            <ToastContainer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdChauf;
