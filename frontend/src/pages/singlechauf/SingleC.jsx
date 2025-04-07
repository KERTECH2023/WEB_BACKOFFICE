import React, { useState, useEffect } from "react";
import "./singlec.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import List from "../../components/table/Table";
import ListVoi from "../../components/tablevoiture/TableVoi";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const SingleC = () => {
  const [user, setUser] = useState();
  const [showTextarea, setShowTextarea] = useState(false);  // To show/hide the text area
  const [rejectionReason, setRejectionReason] = useState('');  // To hold rejection reason

  const navigate = useNavigate();
  const { id } = useParams();
  const role = window.localStorage.getItem("userRole");
  console.log("role//", role);

  useEffect(() => {
    if (id) {
      getSingleUser(id);
    }
  }, [id]);
  console.log("user", id);

  const getSingleUser = async (id) => {
    const response = await axios.get(
      process.env.REACT_APP_BASE_URL + `/Chauff/searchchauf/${id}`
    );
    if (response.status === 200) {
      setUser({ ...response.data });
      console.log("data", response.data);
    }
  };
  console.log("USER**", user);

  const handleSubmit = () => {
    axios
      .put(process.env.REACT_APP_BASE_URL + `/Chauff/updatestatus/${id}`, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        toast.success("Compte Chauffeur  a été Desactivé avec Success !", {
          position: toast.POSITION.TOP_RIGHT,
        });
        setTimeout(() => navigate("/Chauffeur"), 3000);
      })
      .catch((err) => {
        console.warn(err);
        toast.error("Email exist Already!", {
          position: toast.POSITION.TOP_RIGHT,
        });
      });
  };


  const handleSubmite = async () => {
    try {
      const response = await axios.get(process.env.REACT_APP_BASE_URL + "/whatsapp/status");
  
      if (response.data?.isConnected === false) {
        if (
          window.confirm(
            "Attention ! Le message WhatsApp n'a pas été envoyé car vous n'êtes pas connecté. "
          )
        ) {
          window.location.href = "https://www.backofficegc.com/whatsuplogin";
          return;
        }
      }
  
      await axios.put(process.env.REACT_APP_BASE_URL + `/Chauff/updatestatuss/${id}`, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      toast.success("Compte Chauffeur a été Validé avec Success !", {
        position: toast.POSITION.TOP_RIGHT,
      });
  
      setTimeout(() => navigate("/Chauffeur"), 3000);
    } catch (err) {
      console.warn(err);
      toast.error("Email exist Already!", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };

  const handleRefuserClick = () => {
    setShowTextarea(true);
  };

  // Handle sending the rejection reason to the backend
  const handleSendRejection = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Veuillez entrer la cause du refus.");
      return;
    }

    try {
      await axios.post(process.env.REACT_APP_BASE_URL + `/chauff/${id}/reject`, { reason: rejectionReason });
      toast.success("La cause de refus a été envoyée avec succès.");
      setShowTextarea(false);
      setRejectionReason('');
    } catch (error) {
      console.error("Erreur lors de l'envoi de la cause de refus:", error);
      toast.error("Erreur lors de l'envoi.");
    }
  };

  return (
    <div className="single">
      <Sidebar />
      <div className="singleContainer">
        <Navbar />
        <div className="top">
          <div className="left">
            <h1 className="title">Information</h1>
            <div className="item">
              <img src={user && user.photoAvatar} alt="" className="itemImg" />
              <div className="details">
                <h1 className="itemTitle">
                  {user && user.Nom} {user && user.Prenom}
                </h1>
                <div className="detailItem">
                  <span className="itemKey">Nom:</span>
                  <span className="itemValue">{user && user.Nom}</span>
                </div>
                <div className="detailItem">
                  <span className="itemKey">Nom D'utilisateur:</span>
                  <span className="itemValue">{user && user.username}</span>
                </div>
                <div className="detailItem">
                  <span className="itemKey">Prenom:</span>
                  <span className="itemValue">{user && user.Prenom}</span>
                </div>
                <div className="detailItem">
                  <span className="itemKey">Nationalite:</span>
                  <span className="itemValue">{user && user.Nationalite}</span>
                </div>
                <div className="detailItem">
                  <span className="itemKey">email:</span>
                  <span className="itemValue">{user && user.email}</span>
                </div>
                <div className="detailItem">
                  <span className="itemKey">DateNaissance:</span>
                  <span className="itemValue">{user && user.DateNaissance}</span>
                </div>
                <div className="detailItem">
                  <span className="itemKey">Genre:</span>
                  <span className="itemValue">{user && user.gender}</span>
                </div>
                <div className="detailItem">
                  <span className="itemKey">Rôle:</span>
                  <span className="itemValue">{user && user.role}</span>
                </div>
                <div className="detailItem">
                  <span className="itemKey">Téléphone:</span>
                  <span className="itemValue">{user && user.phone}</span>
                </div>
                <div className="detailItem">
                  <span className="itemKey">Adresse:</span>
                  <span className="itemValue">{user && user.address}</span>
                </div>
                <div className="detailItem">
                  <span className="itemKey">Code Postal:</span>
                  <span className="itemValue">{user && user.postalCode}</span>
                </div>
                <div className="detailItem">
                  <span className="itemKey">N° Permis:</span>
                  <span className="itemValue">{user && user.licenseNo}</span>
                </div>
                <div className="detailItem">
                  <span className="itemKey">N° CIN:</span>
                  <span className="itemValue">{user && user.cnicNo}</span>
                </div>

                {role === "Admin" || role === "Agentad" ? (
                  <div>
                    <div className="DesaButton" onClick={() => handleSubmit()}>
                      Desactivé Ce Compte
                    </div>

                    {user && user.Cstatus !== "Validé" ? (
                      <div
                        className="activateButton"
                        onClick={() => handleSubmite()}
                      >
                        Activé Ce Compte
                      </div>
                    ) : null}

                    {/* "Refuser" button */}
                    <div>
                      <button className="refuserButton" onClick={handleRefuserClick}>
                        Refuser
                      </button>
                    </div>

                    {/* Textarea for rejection reason */}
                    {showTextarea && (
                      <div style={{ marginTop: '10px' }}>
                        <textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Entrez la cause du refus"
                          rows="4"
                          cols="50"
                          style={{ width: '100%', padding: '10px' }}
                        ></textarea>
                        <button
                          className="sendRejectionButton"
                          onClick={handleSendRejection}
                          style={{ marginTop: '10px', backgroundColor: 'blue', color: 'white' }}
                        >
                          Envoyer la cause
                        </button>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="right"></div>
        </div>
        <ToastContainer />
        <div className="bottom">
          <h1 className="title">Plus D'information </h1>
          <List />
        </div>
        <div className="bottom">
          <h1 className="title">Voiture Informations </h1>
          <ListVoi />
        </div>
      </div>
    </div>
  );
};

export default SingleC;
