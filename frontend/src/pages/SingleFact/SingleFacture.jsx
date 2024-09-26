// SingleF.jsx
import React from "react";
import ReactDOM from "react-dom";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import TemplateFacture from "../../pages/SingleFact/TemplateFacture.jsx";
import "./SingleF.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import Chart from "../../components/chart/Chart";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import imageCompression from "browser-image-compression";

const SingleF = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const role = window.localStorage.getItem("userRole");
  const [facture, setFacture] = useState(null);
  const [chauffeur, setChauffeur] = useState(null);

  const getChauffeurById = async (id) => {
    const response = await fetch(
      `http://localhost:3001/Chauff/searchchauf/${id}`
    );
    const data = await response.json();
    return data;
  };

  const getFactureById = async (id) => {
    const response = await fetch(`http://localhost:3001/Chauff/factures/${id}`);
    const data = await response.json();
    return data;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const factureData = await getFactureById(id);
        setFacture(factureData);

        if (factureData.chauffeur) {
          const chauffeurData = await getChauffeurById(factureData.chauffeur);
          setChauffeur(chauffeurData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [id]);

  const compressImage = async (imageBlob) => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1024,
    };

    try {
      // Convertir DataURL en Blob
      const response = await fetch(imageBlob);
      const imageFile = await response.blob();

      // Compresser l'image
      const compressedImage = await imageCompression(imageFile, options);

      // Convertir le Blob compressé en DataURL
      const compressedImageDataURL = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(compressedImage);
      });

      return compressedImageDataURL;
    } catch (error) {
      console.error("Erreur lors de la compression de l'image:", error);
    }
  };

  const handlePrint = async (sendByEmail = false) => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    // Rendre le composant React dans un conteneur temporaire
    ReactDOM.render(
      <TemplateFacture chauffeur={chauffeur} facture={facture} />,
      container
    );

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: "a4",
    });

    const pdfsend = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: "a4",
    });

    try {
      const canvas = await html2canvas(container, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      const compressedImgData = await compressImage(imgData);
      // Ajouter l'image au PDF
      pdf.addImage(
        imgData,
        "PNG",
        0,
        0,
        pdf.internal.pageSize.width,
        pdf.internal.pageSize.height
      );
      pdfsend.addImage(
        compressedImgData,
        "PNG",
        0,
        0,
        pdf.internal.pageSize.width,
        pdf.internal.pageSize.height
      );

      // Générer le PDF en tant que blob
      const pdfBlob = pdf.output("blob");

      const pdfb = pdfsend.output("blob");
      // Supprimer le conteneur après génération
      ReactDOM.unmountComponentAtNode(container);
      document.body.removeChild(container);

      if (sendByEmail) {
        // Si on souhaite envoyer le PDF par email
        await sendEmailWithFacture(
          pdfb,
          chauffeur.email,
          facture.Month,
          facture._id
        );
      } else {
        // Créer une URL blob pour le PDF et l'ouvrir dans un nouvel onglet
        const pdfURL = URL.createObjectURL(pdfBlob);
        window.open(pdfURL, "_blank");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const sendEmailWithFacture = async (pdfBlob, email, Month, id) => {
    const formData = new FormData();
    formData.append("file", pdfBlob, "facture.pdf");
    formData.append("email", email);
    formData.append("Month", Month);
    formData.append("id", id);

    try {
      await axios.post("http://localhost:3001/Chauff/sendFacture", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Facture envoyée avec succès par e-mail");
    } catch (error) {
      toast.error("Erreur lors de l'envoi de la facture par e-mail");
      console.error(error);
    }
  };

  const handleSubmite = () => {
    axios
      .put(`http://localhost:3001/Chauff/updatefacture/${id}`, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        toast.success("Facture de chauffeur a été bien payé", {
          position: toast.POSITION.TOP_RIGHT,
        });

        setTimeout(() => navigate("/Chauffeur"), 3000);
      })
      .catch((err) => {
        console.warn(err);
        toast.error("Email exist Already !", {
          position: toast.POSITION.TOP_RIGHT,
        });
      });
  };

  return (
    <div className="single">
      <Sidebar />

      <div className="singleContainer">
        <Navbar />
        <div className="top">
          <div className="left">
            <h1 className="title">Facture</h1>
            <div className="item" id="factureContent">
              <img
                src={chauffeur && chauffeur.photoAvatar}
                alt=""
                className="itemImg"
              />
              <div className="details">
                <h1 className="itemTitle">
                  {chauffeur && chauffeur.Nom} {chauffeur && chauffeur.Prenom}
                </h1>
                <div className="detailItem">
                  <span className="itemKey">Nom:</span>
                  <span className="itemValue">
                    {chauffeur && chauffeur.Nom}
                  </span>
                </div>
                <div className="detailItem">
                  <span className="itemKey">Nom D'utilisateur:</span>
                  <span className="itemValue">
                    {chauffeur && chauffeur.username}
                  </span>
                </div>
                <div className="detailItem">
                  <span className="itemKey">Prenom:</span>
                  <span className="itemValue">
                    {chauffeur && chauffeur.Prenom}
                  </span>
                </div>
                <div className="detailItem">
                  <span className="itemKey">email:</span>
                  <span className="itemValue">
                    {chauffeur && chauffeur.email}
                  </span>
                </div>
                <div className="detailItem">
                  <span className="itemKey">DateNaissance:</span>
                  <span className="itemValue">
                    {chauffeur && chauffeur.DateNaissance}
                  </span>
                </div>
                <div className="detailItem">
                  <span className="itemKey">Genre:</span>
                  <span className="itemValue">
                    {chauffeur && chauffeur.gender}
                  </span>
                </div>
                <div className="detailItem">
                  <span className="itemKey">Téléphone:</span>
                  <span className="itemValue">
                    {chauffeur && chauffeur.phone}
                  </span>
                </div>
                <div className="detailItem">
                  <span className="itemKey">Adresse:</span>
                  <span className="itemValue">
                    {chauffeur && chauffeur.address}
                  </span>
                </div>
                <div className="detailItem">
                  <span className="itemKey">N° Permis:</span>
                  <span className="itemValue">
                    {chauffeur && chauffeur.cnicNo}
                  </span>
                </div>
                <div className="detailItem">
                  <span className="itemKey">Mois:</span>
                  <span className="itemValue">{facture && facture.Month}</span>
                </div>{" "}
                <div className="detailItem">
                  <span className="itemKey">Montant Accumulé</span>
                  <span className="itemValue">
                    {facture && facture.totalFareAmount}
                  </span>
                </div>{" "}
                <div className="detailItem">
                  <span className="itemKey">Nombre Trajet:</span>
                  <span className="itemValue">
                    {facture && facture.nbretrajet}
                  </span>
                </div>{" "}
                <div className="detailItem">
                  <span className="itemKey">Montant Facture</span>
                  <span className="itemValue">
                    {facture && facture.montantTva}
                  </span>
                </div>{" "}
                <div className="detailItem">
                  <span className="itemKey">N° Permis:</span>
                  <span className="itemValue">
                    {chauffeur && chauffeur.cnicNo}
                  </span>
                </div>
                {role === "Admin" || role === "Agentad" ? (
                  <div>
                    <div
                      className="activateButton"
                      onClick={() => handlePrint(false)}
                    >
                      Consulter
                    </div>
                    {facture && !facture.envoieFacture && (
                      <div
                        className="activateButton"
                        onClick={() => handlePrint(true)}
                      >
                        Envoyer Facture par Email
                      </div>
                    )}

                    {facture && facture.isPaid === false ? (
                      <div
                        className="activateButton"
                        onClick={() => handleSubmite()}
                      >
                        Payer La Facture
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          <div className="right">
            <Chart aspect={3 / 1} title="User Spending ( Last 6 Months)" />
          </div>
        </div>
        <ToastContainer />
      </div>
    </div>
  );
};

export default SingleF;
