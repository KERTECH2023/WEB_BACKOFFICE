import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import TemplateFacture from "../../pages/SingleFact/TemplateFacture.jsx";
import "./SingleF.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import Chart from "../../components/chart/Chart";
import { useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import imageCompression from "browser-image-compression";

const SingleF = () => {
  const navigate = useNavigate(); // Permet de naviguer vers d'autres pages
  const { id } = useParams(); // Récupère l'ID depuis l'URL
  const role = window.localStorage.getItem("userRole"); // Récupère le rôle de l'utilisateur depuis le stockage local
  const [facture, setFacture] = useState(null); // État pour stocker la facture
  const [chauffeur, setChauffeur] = useState(null); // État pour stocker le chauffeur

  // Fonction pour récupérer les données d'un chauffeur par son ID
  const getChauffeurById = async (id) => {
    const response = await fetch(
      process.env.REACT_APP_BASE_URL + `/Chauff/searchchauf/${id}`
    );
    const data = await response.json();
    return data;
  };

  // Fonction pour récupérer les données d'une facture par son ID
  const getFactureById = async (id) => {
    const response = await fetch(
      process.env.REACT_APP_BASE_URL + `/Chauff/factures/${id}`
    );
    const data = await response.json();
    return data;
  };

  // Utilisation de useEffect pour récupérer les données au chargement du composant
  useEffect(() => {
    const fetchData = async () => {
      try {
        const factureData = await getFactureById(id); // Récupère les données de la facture
        console.log("Facture Data:", factureData); // Pour vérifier les données de la facture
        setFacture(factureData); // Met à jour l'état de la facture

        // Si la facture contient un chauffeur, récupère ses informations
        if (factureData.chauffeur) {
          const chauffeurData = await getChauffeurById(factureData.chauffeur);
          console.log("Chauffeur Data:", chauffeurData); // Pour vérifier les données du chauffeur
          setChauffeur(chauffeurData); // Met à jour l'état du chauffeur
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
      }
    };

    fetchData();
  }, [id]); // Dépendance à l'ID pour relancer la requête si l'ID change

  // Fonction pour compresser une image
  const compressImage = async (imageBlob) => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1024,
    };

    try {
      const response = await fetch(imageBlob);
      const imageFile = await response.blob();
      const compressedImage = await imageCompression(imageFile, options);

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

  // Fonction pour générer un PDF et éventuellement l'envoyer par email
  const handlePrint = async (sendByEmail = false) => {
    const container = document.createElement("div");
    document.body.appendChild(container);

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

      const pdfBlob = pdf.output("blob");

      const pdfb = pdfsend.output("blob");
      ReactDOM.unmountComponentAtNode(container);
      document.body.removeChild(container);

      if (sendByEmail) {
        await sendEmailWithFacture(
          pdfb,
          chauffeur.email,
          facture.Month,
          facture._id
        );
      } else {
        const pdfURL = URL.createObjectURL(pdfBlob);
        window.open(pdfURL, "_blank");
      }
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
    }
  };

  // Fonction pour envoyer la facture par email
  const sendEmailWithFacture = async (pdfBlob, email, Month, id) => {
    const formData = new FormData();
    formData.append("file", pdfBlob, "facture.pdf");
    formData.append("email", email);
    formData.append("Month", Month);
    formData.append("id", id);

    try {
      await axios.post(
        process.env.REACT_APP_BASE_URL + "/Chauff/sendFacture",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success("Facture envoyée avec succès par e-mail");
    } catch (error) {
      toast.error("Erreur lors de l'envoi de la facture par e-mail");
      console.error(error);
    }
  };

  // Fonction pour mettre à jour une facture comme payée
  const handleSubmite = () => {
    axios
      .put(process.env.REACT_APP_BASE_URL + `/Chauff/updatefacture/${id}`, {
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
        toast.error("Erreur lors de la mise à jour de la facture", {
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
                {/* Rendu des informations du chauffeur */}
                <div className="detailItem">
                  <span className="itemKey">Nom:</span>
                  <span className="itemValue">{chauffeur && chauffeur.Nom}</span>
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
                  <span className="itemKey">Email:</span>
                  <span className="itemValue">
                    {chauffeur && chauffeur.email}
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
                  <span className="itemKey">Montant Accumulé:</span>
                  <span className="itemValue">
                    {facture && facture.totalFareAmount}
                  </span>
                </div>
              </div>
            </div>
            <button
              className="btn-payer"
              onClick={() => {
                handleSubmite();
              }}
            >
              Payer
            </button>
            <button
              className="btn-envoyer"
              onClick={() => handlePrint(true)}
            >
              Envoyer la Facture
            </button>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default SingleF;
