/* eslint-disable no-unused-vars */
import "./updchauf.scss";
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";

const UpdChauf = () => {
  const [form, setForm] = useState({});
  const [photoAvatar, setPhotoAvatar] = useState(null);
  const [photoCin, setPhotoCin] = useState(null);
  const [photoPermisRec, setPhotoPermisRec] = useState(null);
  const [photoPermisVer, setPhotoPermisVer] = useState(null);
  const [photoVtc, setPhotoVtc] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [clickedFile, setClickedFile] = useState(null);
  const role = window.localStorage.getItem("userRole");
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      getSingleUser(id);
      getVehicleDetails(id);
    }
  }, [id]);

  const getSingleUser = async (id) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/Chauff/searchchauf/${id}`);
      if (response.status === 200) {
        setForm({ ...response.data });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const getVehicleDetails = async (id) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/Voi/getvoi/${id}`);
      if (response.status === 200) {
        setVehicle(response.data);
      }
    } catch (error) {
      console.error("Error fetching vehicle data:", error);
    }
  };

  const onChangeHandler = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("photoAvatar", photoAvatar);
    data.append("photoCin", photoCin);
    data.append("photoPermisRec", photoPermisRec);
    data.append("photoPermisVer", photoPermisVer);
    data.append("photoVtc", photoVtc);

    for (const key in form) {
      data.append(key, form[key]);
    }

    try {
      const response = await axios.put(`${process.env.REACT_APP_BASE_URL}/Chauff/updatechauf/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.status === 200) {
        toast.success("Chauffeur mis à jour avec succès !");
        setTimeout(() => navigate("/Chauffeur"), 3000);
      }
    } catch (error) {
      console.error("Error updating chauffeur:", error);
      toast.error("Erreur lors de la mise à jour !");
    }
  };

  const handleFileClick = (file) => setClickedFile(file);
  const handleCloseFile = () => setClickedFile(null);

  const renderFile = (fileUrl, alt) => {
    if (!fileUrl) return null;
    const ext = fileUrl.toLowerCase().split(".").pop();
    const isPDF = ext === "pdf";
    const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(ext);

    return (
      <div onClick={() => handleFileClick(fileUrl)} style={{ cursor: "pointer" }}>
        {isImage ? <img src={fileUrl} alt={alt} style={{ width: "50px" }} /> : "Voir PDF"}
      </div>
    );
  };

  return (
    <div className="new">
      <Sidebar />
      <div className="newContainer">
        <Navbar />
        <div className="top">
          <h1>Mettre à jour Agent : {form.Nom}</h1>
        </div>
        <div className="bottom">
              <div className="right">
                <form action="" id="login" method="put" onSubmit={handleSubmit} >
                <p className="item">
                <label>Nom :</label><br />
                <input type="text" onChange={onChangeHandler} name="Nom" className='InputBox' id="Nom" value={form.Nom || ""
                } required /> 
            </p>
    
            <p className="item">
                <label>Prenom :</label><br />
                <input type="text" onChange={onChangeHandler} name="Prenom" className='InputBox' id="Prenom" value={form.Prenom || ""
                } required />
            </p>
            
            <p className="item">
                <label>Email :</label><br />
                <input type="email" onChange={onChangeHandler} name="email" className='InputBox' id="email" value={ form.email || ""
                } required  disabled={role === "Agent"} />
            </p>
    
            <p className="item">
                <label>Phone :</label><br />
                <input type="text" onChange={onChangeHandler} name="phone" className='InputBox' id="phone" value={form.phone || ""
                } required />
            </p>
            

            <p className="item">
<label>Gender :</label><br />

        <select onChange={onChangeHandler} value={form.gender || ""} name="gender" id="gender" >
        <option value="-">-</option>
    		<option value="male">male</option>
    		<option value="female">female</option>
    		
    		
   		</select>
       </p>

    

       <p className="item">
<label>Nationalite :</label><br />
        <select onChange={onChangeHandler} value={form.Nationalite || ""} name="Nationalite" id="Nationalite" >
        <option value="-">-</option>
    		<option value="Tunisian">Tunisian</option>
    		<option value="Francais">Francais</option>
        <option value="marocain">marocain</option>
    		
    		
   		</select>
       </p>
            <p className="item">
                <label>N° Permis :</label><br />
                <input type="text" onChange={onChangeHandler} name="cnicNo" className='InputBox' id="cnicNo" value={form.cnicNo || ""
                } required   disabled={role === "Agent"} />
            </p>
            <p className="item">
                <label>Adresse :</label><br />
                <input type="text" onChange={onChangeHandler} name="address" className='InputBox' id="address" value={form.address || ""
                } required />
            </p>
            <p className="item">
                <label>Code Postale :</label><br />
                <input type="text" onChange={onChangeHandler} name="postalCode" className='InputBox' id="postalCode" value={form.postalCode || ""
                } required />
            </p>
            
         
            <p className="item">
                <label>photo de profil  :</label><br />
                <img
                src={form.photoAvatar || ""}
                alt=""
                className="itemImg"
              />
             
                <input type="file"   onChange={e => setphotoAvatar(e.target.files[0])} name="photoAvatar" className='InputBox' id="photoAvatar" />
                
            </p>
    
            <p className="item">
                <label>photo de CIN  :</label><br />
                <img
                src={form.photoCin || ""}
                alt=""
                className="itemImg"
              />
             
                <input type="file"   onChange={e => setphotoCin(e.target.files[0])} name="photoCin" className='InputBox' id="photoCin" />
                
            </p>
            <p className="item">
                <label>photo de Permis Recto  :</label><br />
                <img
                src={form.photoPermisRec || ""}
                alt=""
                className="itemImg"
              />
             
                <input type="file"   onChange={e => setphotoPermisRec(e.target.files[0])} name="photoPermisRec" className='InputBox' id="photoPermisRec" />
                
            </p>
            <p className="item">
                <label>photo de Permis Verso  :</label><br />
                <img
                src={form.photoPermisVer || ""}
                alt=""
                className="itemImg"
              />
             
                <input type="file"   onChange={e => setphotoPermisVer(e.target.files[0])} name="photoPermisVer" className='InputBox' id="photoPermisVer" />
                
            </p>
            <p className="item">
                <label>photo de VTC  :</label><br />
                <img
                src={form.photoVtc || ""}
                alt=""
                className="itemImg"
              />
             
                <input type="file"   onChange={e => setphotoVtc(e.target.files[0])} name="photoVtc" className='InputBox' id="photoVtc" />
                
            </p>
   <p className="item">
                <button id="sub_btn" type="submit" value="login">Mis A Jour</button>
            </p>
            <ToastContainer />
            </form>
          </div>
          <div className="vehicle-details">
            <h2>Détails de la voiture</h2>
            {vehicle ? (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Modelle</TableCell>
                      <TableCell>Immatriculation</TableCell>
                      <TableCell>Carte Grise</TableCell>
                      <TableCell>Assurance</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>{vehicle.modelle}</TableCell>
                      <TableCell>{vehicle.immatriculation}</TableCell>
                      <TableCell>{renderFile(vehicle.cartegrise, "Carte Grise")}</TableCell>
                      <TableCell>{renderFile(vehicle.assurance, "Assurance")}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <p>Aucune information sur la voiture disponible.</p>
            )}
          </div>
        </div>
      </div>
      {clickedFile && (
        <div className="fileOverlay" onClick={handleCloseFile}>
          {clickedFile.endsWith(".pdf") ? (
            <iframe src={clickedFile} title="PDF Viewer" style={{ width: "90%", height: "90%", border: "none" }} />
          ) : (
            <img src={clickedFile} alt="Aperçu" style={{ maxWidth: "90%", maxHeight: "90%" }} />
          )}
          <span className="close">&times;</span>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default UpdChauf;
