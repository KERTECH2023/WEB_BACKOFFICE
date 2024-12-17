import "./updchauf.scss"
import React, { useState, useEffect } from 'react'
import { useParams } from "react-router-dom"
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper 
} from '@mui/material';

const UpdChauf = () => {
  const [photoAvatar, setphotoAvatar] = useState({file :[]})
  const [photoCin, setphotoCin] = useState({file :[]})
  const [photoPermisRec, setphotoPermisRec] = useState({file :[]})
  const [photoPermisVer, setphotoPermisVer] = useState({file :[]})
  const [photoVtc, setphotoVtc] = useState({file :[]})
  const [form, setform] = useState({})
  const [vehicle, setVehicle] = useState(null)
  const [clickedFile, setClickedFile] = useState(null)
  const [isFileOpen, setIsFileOpen] = useState(false)

  const role = window.localStorage.getItem("userRole");
  const navigate = useNavigate()
  const {id} = useParams();
  
  useEffect(() => {
    if (id) {
      getSingleUser(id)
      getSingleVehicle(id)
    }
  }, [id])
  
  const getSingleUser = async (id)  => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/Chauff/searchchauf/${id}`);
      if(response.status === 200){
        setform({ ...response.data })
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des informations du chauffeur')
    }
  }

  const getSingleVehicle = async (id) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/Voi/getvoi/${id}`);
      if(response.status === 200){
        setVehicle({ ...response.data })
      }
    } catch (error) {
      console.error("Error fetching vehicle data:", error);
    }
  }

  const onChangeHandler = (e) => {
    setform({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  const handleFileClick = (file) => {
    setClickedFile(file);
    setIsFileOpen(true);
  };

  const handleCloseFile = () => {
    setClickedFile(null);
    setIsFileOpen(false);
  };

  const renderFile = (fileUrl, alt) => {
    if (!fileUrl) return null;

    const isPDF = fileUrl.toLowerCase().endsWith('.pdf');
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].some(ext => 
      fileUrl.toLowerCase().endsWith(ext)
    );

    return (
      <div className="cellWrapper">
        {isImage && (
          <img 
            src={fileUrl} 
            alt={alt} 
            className="image" 
            onClick={() => handleFileClick(fileUrl)}
            style={{ 
              width: '100px', 
              height: '100px', 
              objectFit: 'cover', 
              cursor: 'pointer' 
            }}
          />
        )}
        {isPDF && (
          <div 
            className="pdf-preview" 
            onClick={() => handleFileClick(fileUrl)}
            style={{ 
              cursor: 'pointer', 
              border: '1px solid #ccc', 
              padding: '10px',
              textAlign: 'center'
            }}
          >
            View PDF
          </div>
        )}
      </div>
    );
  };

  const renderFileModal = () => {
    if (!isFileOpen || !clickedFile) return null;

    const isPDF = clickedFile.toLowerCase().endsWith('.pdf');
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].some(ext => 
      clickedFile.toLowerCase().endsWith(ext)
    );

    return (
      <div 
        className="fileOverlay" 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}
      >
        <span 
          className="close" 
          onClick={handleCloseFile}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            color: 'white',
            fontSize: '30px',
            cursor: 'pointer'
          }}
        >
          &times;
        </span>
        {isImage && (
          <img 
            src={clickedFile} 
            alt="Full size" 
            className="fullImage"
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              objectFit: 'contain'
            }}
          />
        )}
        {isPDF && (
          <iframe 
            src={clickedFile} 
            width="90%" 
            height="90%" 
            title="PDF Viewer" 
            style={{ border: 'none' }} 
          />
        )}
      </div>
    );
  };

  const handleSubmit = e => {
    e.preventDefault()
  
    const data = new FormData();
    data.append('photoAvatar', e.target.photoAvatar.files[0]);
    data.append('photoCin', e.target.photoCin.files[0]);
    data.append('photoPermisRec', e.target.photoPermisRec.files[0]);
    data.append('photoPermisVer', e.target.photoPermisVer.files[0]);
    data.append('photoVtc', e.target.photoVtc.files[0]);

    for (const key in form) {
      data.append(key, form[key]);
    }
  
    axios
      .put(`${process.env.REACT_APP_BASE_URL}/Chauff/updatechauf/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then(response => {
        toast.success('Chauffeur mis à jour avec succès !', {
          position: toast.POSITION.TOP_RIGHT
        });
        setTimeout(() => navigate("/Chauffeur"), 3000);
      })
      .catch(err => {
        console.warn(err)
        toast.error('Erreur lors de la mise à jour !', {
          position: toast.POSITION.TOP_RIGHT
        });
      })
  }

  return (
    <div className="new">
      <Sidebar />
      <div className="newContainer">
        <Navbar />
        <div className="top">
          <h1>Mettre à jour Agent : {form.Nom} </h1>
        </div>
        <div className="bottom">
          <div className="right">
            <form action="" id="login" method="put" onSubmit={handleSubmit}>
              {/* Existing form fields */}
              <p className="item">
                <label>Nom :</label><br />
                <input 
                  type="text" 
                  onChange={onChangeHandler} 
                  name="Nom" 
                  className='InputBox' 
                  id="Nom" 
                  value={form.Nom || ""} 
                  required 
                /> 
              </p>
              {/* ... (rest of the existing form fields) ... */}
              
              <p className="item">
                <button id="sub_btn" type="submit" value="login">Mis A Jour</button>
              </p>
              <ToastContainer />
            </form>
          </div>
        </div>

        {/* Vehicle Details Section */}
        <div className="top" style={{ marginTop: '20px' }}>
          <h1>Détails du Véhicule</h1>
        </div>
        <div className="bottom">
          <TableContainer component={Paper} className="table">
            <Table sx={{ minWidth: 650 }} aria-label="vehicle details table">
              <TableHead>
                <TableRow>
                  <TableCell className="tableCell">Modèle</TableCell>
                  <TableCell className="tableCell">Matriculation</TableCell>
                  <TableCell className="tableCell">Carte Grise</TableCell>
                  <TableCell className="tableCell">Assurance</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vehicle && (
                  <TableRow key={vehicle.id}>
                    <TableCell className="tableCell">
                      {vehicle.modelle}
                    </TableCell>
                    <TableCell className="tableCell">
                      {vehicle.immatriculation}
                    </TableCell>
                    <TableCell className="tableCell">
                      {renderFile(vehicle.cartegrise, "Carte Grise")}
                    </TableCell>
                    <TableCell className="tableCell">
                      {renderFile(vehicle.assurance, "Assurance")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {renderFileModal()}
        </div>
      </div>
    </div>
  );
}

export default UpdChauf
