import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import TemplateFacture from "../../pages/SingleFact/TemplateFacture.jsx";
import "./SingleF.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { PDFDocument, rgb } from 'pdf-lib';
import {
  storage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "../../config";

const extractMontant = (notes) => {
  const regex = /Montant net à payer:\s*([\d,.]+)/; // Regex to capture the amount
  const match = notes.match(regex);
  return match ? parseFloat(match[1].replace(',', '.')).toFixed(2) : " - ";
};

const SingleF = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const role = window.localStorage.getItem("userRole");
  const [facture, setFacture] = useState(null);
  const [chauffeur, setChauffeur] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfError, setPdfError] = useState(null);

  // Fetch Chauffeur by ID
  const getChauffeurById = async (id) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/facture/${id}/chauffeur`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching chauffeur:", error);
      throw error;
    }
  };

  // Fetch Facture by ID
  const getFactureById = async (id) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/facture/${id}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching facture:", error);
      throw error;
    }
  };

  // Check if PDF exists using the facture ID
  const checkPdfExists = async (factureId) => {
    const pdfFileName = `${factureId}.pdf`;
    const pdfRef = ref(storage, `factures/${pdfFileName}`);
    
    try {
      console.log("Checking for PDF:", `factures/${pdfFileName}`);
      const url = await getDownloadURL(pdfRef);
      console.log("PDF URL found:", url);
      setPdfUrl(url);
      setPdfError(null);
    } catch (error) {
      if (error.code === 'storage/object-not-found') {
        console.error("Facture PDF not found (404)");
        setPdfError("Facture does not exist. Please generate it.");
        setPdfUrl(null);
      } else {
        console.error("Error checking PDF existence:", error);
        setPdfError("Error accessing the PDF file");
        setPdfUrl(null);
      }
    }
  };

  // Load Facture and Chauffeur data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedFacture = await getFactureById(id);
        setFacture(fetchedFacture);
        console.log("Fetched facture:", fetchedFacture);

        const fetchedChauffeur = await getChauffeurById(id);
        setChauffeur(fetchedChauffeur);
        console.log("Fetched chauffeur:", fetchedChauffeur);

        await checkPdfExists(fetchedFacture._id);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
        toast.error("Erreur lors du chargement des données");
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  // Handle generating and uploading the PDF
  const handlePrint = async (sendByEmail = false) => {
    try {
      // Charger le fichier PDF existant depuis le dossier public
      const existingPdfBytes = await fetch('/FACTUREpdf.pdf').then((res) => res.arrayBuffer());
  
      // Charger le PDF avec pdf-lib
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
  
      // Obtenez la première page du PDF
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
  
      // Ajouter des informations dynamiques
      const { width, height } = firstPage.getSize();

  
      firstPage.drawText(`${chauffeur ? `${chauffeur.Nom} ${chauffeur.Prenom}` : 'Nom du Chauffeur'}`, {
        x: 50,
        y: height - 250,
        size: 12,
        color: rgb(0, 0, 0),
      });
  
      firstPage.drawText(`${chauffeur ? chauffeur.address : 'Adresse'}`, {
        x: 50,
        y: height - 270,
        size: 12,
        color: rgb(0, 0, 0),
      });
  
      firstPage.drawText(`${facture ? facture.numero : '-'}`, {
        x: 215,
        y: height - 140,
        size: 12,
        color: rgb(0, 0, 0),
      });
  
     firstPage.drawText(
     `${facture ? `${facture.mois}/${facture.annee}`: '-'}`, 
     {
     x: 40,
     y: height - 140,
     size: 12,
     color: rgb(0, 0, 0),
     }
     );


      firstPage.drawText(`${facture ? `Facture de Mois  ` : '-'}`, {
        x: 42,
        y: height - 450,
        size: 12,
        color: rgb(0, 0, 0),
      });

      firstPage.drawText(`${facture ? (facture.mois === 12 ? `${facture.mois}` : `${facture.mois} - ${facture.mois + 1}`) : '-'}`, {
      x: 50,
      y: height - 475,
      size: 12,
      color: rgb(0, 0, 0),
      });


      
      firstPage.drawText(`${facture ? facture.nbTrajet : '-'}`, {
        x: 220,
        y: height - 460,
        size: 12,
        color: rgb(0, 0, 0),
      });
  
      firstPage.drawText(`${facture ? `${parseFloat(facture.montantTTC).toFixed(2)} dt` : '-'}`, {
        x: 350,
        y: height - 460,
        size: 12,
        color: rgb(0, 0, 0),
      });
      firstPage.drawText(`${facture ? `${(parseFloat(facture.montantTTC) * 0.15).toFixed(2)} dt` : '-'}`, {
        x: 500,
        y: height - 460,
        size: 12,
        color: rgb(0, 0, 0),
      });

      firstPage.drawText(`${facture ? `${parseFloat(facture.fraisDeService).toFixed(2)} dt` : '-'}`, {
        x: 500,
        y: height - 612,
        size: 12,
        color: rgb(0, 0, 0),
      });
  
      // Sauvegarder le nouveau PDF en tant que blob
      const pdfBytes = await pdfDoc.save();
      const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
  
      // Téléchargement ou upload vers Firebase
      const pdfFileName = `${facture._id}.pdf`;
      const storageRef = ref(storage, `factures/${pdfFileName}`);
      const uploadTask = uploadBytesResumable(storageRef, pdfBlob);
  
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Error uploading file:", error);
          toast.error("Erreur lors du téléchargement du fichier");
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            console.log("File available at", downloadURL);
            setPdfUrl(downloadURL);
            setUploadProgress(0);
  
            if (sendByEmail) {
              sendEmailWithFacture(pdfBlob, chauffeur.email, facture.mois, facture._id);
            } else {
              window.open(downloadURL, "_blank");
            }
          });
        }
      );
    } catch (error) {
      console.error("Erreur lors de la manipulation du PDF :", error);
      toast.error("Erreur lors de la génération ou de l'upload du PDF");
    }
  };

  // Send email with the PDF
  const sendEmailWithFacture = async (pdfBlob, email, mois, id) => {
    const formData = new FormData();
    formData.append("file", pdfBlob, "facture.pdf");
    formData.append("email", email);
    formData.append("mois", mois);
    formData.append("id", id);

    try {
      await axios.post(
        `${process.env.REACT_APP_BASE_URL}/Chauff/sendFacture`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success("Facture envoyée avec succès par e-mail");
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Erreur lors de l'envoi de la facture par e-mail");
    }
  };

  // Handle facture payment
  const handleSubmite = () => {
    axios
      .patch(`${process.env.REACT_APP_BASE_URL}/facture/${id}/payer`, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        toast.success("Facture de chauffeur a été bien payée", {
          position: toast.POSITION.TOP_RIGHT,
        });
        setTimeout(() => navigate("/ConsultInvoices"), 3000);
      })
      .catch((err) => {
        console.warn("Error updating facture:", err);
        toast.error("Erreur lors de la mise à jour de la facture !", {
          position: toast.POSITION.TOP_RIGHT,
        });
      });
  };

  const renderChauffeurDetails = () => {
    if (!chauffeur) return null;

    return (
      <>
        <div className="detailItem">
          <span className="itemKey">Nom:</span>
          <span className="itemValue">{chauffeur.Nom}</span>
        </div>
        <div className="detailItem">
          <span className="itemKey">Prenom:</span>
          <span className="itemValue">{chauffeur.Prenom}</span>
        </div>
        <div className="detailItem">
          <span className="itemKey">Email:</span>
          <span className="itemValue">{chauffeur.email}</span>
        </div>
        <div className="detailItem">
          <span className="itemKey">Phone:</span>
          <span className="itemValue">{chauffeur.phone}</span>
        </div>
      </>
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="single">
      <Sidebar />
      <div className="singleContainer">
        <Navbar />
        <div className="top">
          <div className="left">
            <h1 className="title">Facture</h1>
            <div className="item">
              {chauffeur && (
                <img src={chauffeur.photoAvatar} alt="" className="itemImg" />
              )}
              <div className="details">
                <h1 className="itemTitle">
                  Facture de {chauffeur && chauffeur.Prenom}
                </h1>
                {renderChauffeurDetails()}
              </div>
            </div>
            <button
              className="updateButton"
              onClick={() => handlePrint(false)}
              disabled={uploadProgress > 0}
            >
              {uploadProgress > 0 ? `Uploading (${uploadProgress}%)...` : "Générer PDF"}
            </button>
            <button
              className="updateButton"
              onClick={() => handlePrint(true)}
              disabled={uploadProgress > 0}
            >
              {uploadProgress > 0 ? `Uploading (${uploadProgress}%)...` : "Envoyer par E-mail"}
            </button>
            {facture && facture.status !== "PAYE" && (
              <button className="updateButton" onClick={handleSubmite}>
                Payer
              </button>
            )}
          </div>
        </div>
        <div className="bottom">
          {pdfUrl ? (
            <div className="pdfViewer">
              <h2>Facture Générée:</h2>
              <iframe src={pdfUrl} width="100%" height="600px" title="Facture PDF"></iframe>
            </div>
          ) : (
            <div className="pdfError">
              <h2>{pdfError}</h2>
            </div>
          )}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default SingleF;
