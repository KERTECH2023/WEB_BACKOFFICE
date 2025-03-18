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
    files: {}, // Initialisation des fichiers pour éviter les erreurs
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
      const chauffeurRes = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/Chauff/searchchauf/${id}`
      );

      setFormData((prev) => ({
        ...prev,
        chauffeur: chauffeurRes.data,
      }));
    } catch (error) {
      toast.error("Erreur lors de la récupération des données");
      console.error("Erreur lors de la récupération des données:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      chauffeur: {
        ...prev.chauffeur,
        [name]: value,
      },
    }));
  };

 

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      // Envoyer les données sous format JSON (pas `multipart/form-data`)
      await axios.put(
        `${process.env.REACT_APP_BASE_URL}/Chauff/Chauffchangemotdepasse/${id}`,
        { Motdepasse: formData.chauffeur.Motdepasse }, // Envoi seulement du mot de passe
        { headers: { "Content-Type": "application/json" } }
      );
  
      toast.success("Mise à jour réussie !");
      setTimeout(() => navigate("/Chauffeur"), 3000);
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
      console.error("Erreur lors de la mise à jour :", error);
    }
  };
  

  const renderField = (label, name, type = "text", options = null, disabled = false) => (
    <div className="item">
      <label>{label}:</label>
      <br />
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
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={formData.chauffeur[name] || ""}
          onChange={handleInputChange}
          disabled={disabled}
          required
        />
      )}
    </div>
  );

  return (
    <div className="new">
      <Sidebar />
      <div className="newContainer">
        <Navbar />
        <div className="top">
          <h1>
            Mettre à jour Mot de passe : {formData.chauffeur.Nom || "N/A"}
          </h1>
        </div>
        <div className="bottom">
          <div className="right">
            <form onSubmit={handleSubmit}>
              {renderField("Mot de passe", "Motdepasse", "text")}

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
