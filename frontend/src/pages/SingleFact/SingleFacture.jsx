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

  const getChauffeurById = async (id) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/Chauff/searchchauf/${id}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching chauffeur:", error);
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
    }
  };

  const checkPdfExists = async (id) => {
    const pdfRef = ref(storage, `factures/${id}.pdf`);
    try {
      const url = await getDownloadURL(pdfRef);
      setPdfUrl(url);
    } catch (error) {
      console.log("PDF does not exist yet");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedFacture = await getFactureById(id);
        setFacture(fetchedFacture);
        const fetchedChauffeur = await getChauffeurById(fetchedFacture.chauffeurId);
        setChauffeur(fetchedChauffeur);
        await checkPdfExists(id);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
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

      const storageRef = ref(storage, `factures/${facture._id}.pdf`);
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
      toast.error("Erreur lors de l'envoi de la facture par e-mail");
      console.error(error);
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
        toast.success("Facture de chauffeur a été bien payé", {
          position: toast.POSITION.TOP_RIGHT,
        });

        setTimeout(() => navigate("/Chauffeur"), 3000);
      })
      .catch((err) => {
        console.warn(err);
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
          <span className="itemValue">{chauffeur.Cstatus}</span>
        </div>
        <div className="detailItem">
          <span className="itemKey">Type:</span>
          <span className="itemValue">{chauffeur.type}</span>
        </div>
        <div className="detailItem">
          <span className="itemKey">Rating:</span>
          <span className="itemValue">
            {`${chauffeur.ratingsAverage} (${chauffeur.ratingsQuantity} votes)`}
          </span>
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
            <div className="item" id="factureContent">
              {chauffeur && (
                <img src={chauffeur.photoAvatar} alt="" className="itemImg" />
              )}
              <div className="details">
                <h1 className="itemTitle">
                  {chauffeur ? `${chauffeur.Nom} ${chauffeur.Prenom}` : ""}
                </h1>
                {renderChauffeurDetails()}
              </div>
            </div>

            {!pdfUrl && (
              <button onClick={() => handlePrint(false)} className="consultButton">
                Consulter
              </button>
            )}
            
            {role !== "admin" && (
              <button onClick={handleSubmite} className="sendButton">
                Payer Facture
              </button>
            )}

            <button onClick={() => handlePrint(true)} className="sendButton">
              Envoyer par Email
            </button>

            {uploadProgress > 0 && (
              <div className="progressBar">
                <span>Uploading: {Math.round(uploadProgress)}%</span>
                <div
                  className="progress"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
          </div>
          <div className="right">
            {pdfUrl && (
              <iframe
                src={pdfUrl}
                width="100%"
                height="600px"
                style={{ border: "none" }}
                title="Facture PDF"
              />
            )}
          </div>
        </div>
        <ToastContainer />
      </div>
    </div>
  );
};

export default SingleF;
