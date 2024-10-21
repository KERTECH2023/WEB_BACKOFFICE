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
import {
  storage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "../../config";

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

  const getChauffeurById = async (id) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/Chauff/searchchauf/${id}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching chauffeur:", error);
      throw error;
    }
  };

  const getFactureById = async (id) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/Chauff/factures/${id}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching facture:", error);
      throw error;
    }
  };

  const checkPdfExists = async (chauffeurId, mois, annee) => {
    const pdfFileName = `${chauffeurId}_${mois}_${annee}.pdf`; // Format: idchauffeur_month_year.pdf
    const pdfRef = ref(storage, `factures/${pdfFileName}`);
    
    try {
      console.log("Checking for PDF:", `factures/${pdfFileName}`);
      const url = await getDownloadURL(pdfRef);
      console.log("PDF URL found:", url);
      setPdfUrl(url);
      setPdfError(null);
    } catch (error) {
      if (error.code === 'storage/object-not-found') { // Handle 404 case
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedFacture = await getFactureById(id);
        setFacture(fetchedFacture);
        console.log("Fetched facture:", fetchedFacture);

        const fetchedChauffeur = await getChauffeurById(fetchedFacture.chauffeurId);
        setChauffeur(fetchedChauffeur);
        console.log("Fetched chauffeur:", fetchedChauffeur);

        const { mois, annee } = fetchedFacture;  // Assuming your facture has mois (month) and annee (year) fields
        await checkPdfExists(fetchedFacture.chauffeurId, mois, annee);
        
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

    try {
      const canvas = await html2canvas(container, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      pdf.addImage(
        imgData,
        "PNG",
        0,
        0,
        pdf.internal.pageSize.width,
        pdf.internal.pageSize.height
      );

      const pdfBlob = pdf.output("blob");

      ReactDOM.unmountComponentAtNode(container);
      document.body.removeChild(container);

      const pdfFileName = `${facture.chauffeurId}_${facture.mois}_${facture.annee}.pdf`; // Store with new format
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
              sendEmailWithFacture(
                pdfBlob,
                chauffeur.email,
                facture.mois,
                facture._id
              );
            } else {
              window.open(downloadURL, "_blank");
            }
          });
        }
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Erreur lors de la génération du PDF");
    }
  };

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
        setTimeout(() => navigate("/Chauffeur"), 3000);
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
        <div className="detailItem">
          <span className="itemKey">Address:</span>
          <span className="itemValue">{chauffeur.address}</span>
        </div>
        <div className="detailItem">
          <span className="itemKey">CIN:</span>
          <span className="itemValue">{chauffeur.cnicNo}</span>
        </div>
        <div className="detailItem">
          <span className="itemKey">Role:</span>
          <span className="itemValue">{chauffeur.role}</span>
        </div>
        <div className="detailItem">
          <span className="itemKey">Status:</span>
          <span className="itemValue">{chauffeur.status}</span>
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
            <h1 className="title">Information Chauffeur</h1>
            <div className="item">
              {renderChauffeurDetails()}
              {role !== "userChauffeur" && (
                <button onClick={handleSubmite} className="editButton">
                  Payer facture
                </button>
              )}
            </div>
          </div>
          <div className="right">
            {pdfUrl ? (
              <iframe
                src={pdfUrl}
                width="100%"
                height="600px"
                style={{ border: "none" }}
                title="Facture PDF"
              />
            ) : pdfError ? (
              <div className="pdfError">
                {pdfError}
                <button onClick={() => handlePrint(false)} className="generateButton">
                  Generate Facture
                </button>
              </div>
            ) : null}
          </div>
        </div>
        <ToastContainer />
      </div>
    </div>
  );
};

export default SingleF;
