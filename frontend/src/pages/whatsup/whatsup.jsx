import React, { useState, useEffect } from "react";
import axios from "axios";

import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";

const Whatsup = () => {
  const [qrCode, setQrCode] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [messageatous, setMessageatous] = useState(""); // Correct state variable for "message to all"

  useEffect(() => {
    checkStatus();

    const interval = setInterval(() => {
      fetchQRCode();
      checkStatus();
    }, 2000); // Checks every 2 seconds

    return () => clearInterval(interval); // Cleans up the interval when the component is unmounted
  }, []);

  const checkStatus = async () => {
    try {
      const response = await axios.get(process.env.REACT_APP_BASE_URL + "/whatsapp/status");
      setIsConnected(response.data.isConnected);
    } catch (error) {
      console.error("Erreur lors de la vérification du statut", error);
    }
  };

  const fetchQRCode = async () => {
    if (isConnected) return; // Stops updating if already connected

    try {
      const response = await axios.get(process.env.REACT_APP_BASE_URL + "/whatsapp/qrcode");
      setQrCode(response.data.qrCode);
    } catch (error) {
      console.error("Erreur lors de la récupération du QR Code", error);
    }
  };

  const startWhatsApp = async () => {
    try {
      const response = await axios.post(process.env.REACT_APP_BASE_URL + "/whatsapp/start");
      alert(response.data.message);
      window.location.reload();
    } catch (error) {
      console.error("Erreur lors du démarrage de WhatsApp", error);
    }
  };

  const disconnectWhatsApp = async () => {
    try {
      const response = await axios.post(process.env.REACT_APP_BASE_URL + "/whatsapp/logout");
      alert(response.data.message);
      window.location.reload();
    } catch (error) {
      console.error("Erreur lors de la déconnexion", error);
    }
  };

  const sendMessage = async () => {
    if (!isConnected) {
      alert("WhatsApp n'est pas connecté. Veuillez scanner le QR Code.");
      return;
    }
    try {
      const response = await axios.post(process.env.REACT_APP_BASE_URL + "/whatsapp/send", { phone, message });
      alert(response.data.message);
      window.location.reload();
    } catch (error) {
      console.error("Erreur lors de l'envoi du message", error);
    }
  };

  const sendMessageatous = async () => {
    if (!isConnected) {
      alert("WhatsApp n'est pas connecté. Veuillez scanner le QR Code.");
      return;
    }
    try {
      // Corrected: Use messageatous state for the payload
      const response = await axios.post(process.env.REACT_APP_BASE_URL + "/whatsapp/sendchafftn", { message: messageatous });
      alert(response.data.message);
      window.location.reload();
    } catch (error) {
      console.error("Erreur lors de l'envoi du message", error);
    }
  };

  return (
    <div className="new">
      <Sidebar />
      <div className="newContainer">
        <Navbar />
        <div className="top"></div>
        <div style={{ fontFamily: "Arial, sans-serif", textAlign: "center", padding: "20px" }}>
          <div style={{
            maxWidth: "500px",
            margin: "auto",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            backgroundColor: "#fff"
          }}>
            <h1 style={{ color: "#333" }}>WhatsApp QR Code</h1>

            <div style={{ marginBottom: "20px" }}>
              {isConnected ? (
                <h2 style={{ color: "green" }}>✅ Connecté</h2>
              ) : (
                <h2 style={{ color: "red" }}>❌ Non connecté</h2>
              )}
            </div>
            {!isConnected && !qrCode && (
              <div>
                <button onClick={startWhatsApp} style={{
                  backgroundColor: "#007bff",
                  color: "white",
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontSize: "16px"
                }}>
                  Démarrer WhatsApp
                </button>
              </div>
            )}
            {!isConnected && qrCode && (
              <div>
                <img src={qrCode} alt="QR Code" style={{
                  width: "250px",
                  borderRadius: "8px",
                  marginBottom: "10px",
                  border: "2px solid #ddd"
                }} />
              </div>
            )}

            {isConnected && (
              <button onClick={disconnectWhatsApp} style={{
                backgroundColor: "red",
                color: "white",
                padding: "10px 20px",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "16px",
                marginTop: "10px"
              }}>
                Déconnecter
              </button>
            )}
            {isConnected && (
              <div style={{ marginTop: "20px" }}>
                <h3 style={{ color: "#333" }}>Envoyer un message</h3>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <input
                    type="text"
                    placeholder="Numéro de téléphone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{
                      width: "90%",
                      padding: "10px",
                      marginBottom: "10px",
                      borderRadius: "5px",
                      border: "1px solid #ccc"
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    style={{
                      width: "90%",
                      padding: "10px",
                      marginBottom: "10px",
                      borderRadius: "5px",
                      border: "1px solid #ccc"
                    }}
                  />
                  <button onClick={sendMessage} style={{
                    backgroundColor: "green",
                    color: "white",
                    padding: "10px 20px",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontSize: "16px"
                  }}>
                    Envoyer
                  </button>
                </div>
              </div>
            )}
            {isConnected && (
              <div style={{ marginTop: "20px" }}>
                <h3 style={{ color: "#333" }}>Envoyer un message à tous les chauffeurs</h3>
                <input
                  type="text"
                  placeholder="Message"
                  value={messageatous} // Corrected: Use messageatous for value
                  onChange={(e) => setMessageatous(e.target.value)} // Corrected: Use setMessageatous
                  style={{
                    width: "90%",
                    padding: "10px",
                    marginBottom: "10px",
                    borderRadius: "5px",
                    border: "1px solid #ccc"
                  }}
                />
                <button onClick={sendMessageatous} style={{
                  backgroundColor: "green",
                  color: "white",
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontSize: "16px"
                }}>
                  Envoyer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Whatsup;
