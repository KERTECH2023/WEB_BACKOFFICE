import React, { useEffect, useState } from "react";
import "./tablevoi.scss";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { useParams } from "react-router-dom";
import axios from "axios";

const ListVoi = () => {
  const [user, setUser] = useState(null);
  const [clickedFile, setClickedFile] = useState(null);
  const [isFileOpen, setIsFileOpen] = useState(false);

  const { id } = useParams();

  useEffect(() => {
    if (id) {
      getSingleUservoi(id);
    }
  }, [id]);

  const getSingleUservoi = async (id) => {
    try {
      const response = await axios.get(process.env.REACT_APP_BASE_URL + `/Voi/getvoi/${id}`);
      if (response.status === 200) {
        setUser({ ...response.data });
      }
    } catch (error) {
      console.error("Error fetching vehicle data:", error);
    }
  };

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
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].some(ext => fileUrl.toLowerCase().endsWith(ext));

    return (
      <div className="cellWrapper">
        {isImage && (
          <img 
            src={fileUrl} 
            alt={alt} 
            className="image" 
            onClick={() => handleFileClick(fileUrl)}
          />
        )}
        {isPDF && (
          <div 
            className="pdf-preview" 
            onClick={() => handleFileClick(fileUrl)}
            style={{ cursor: 'pointer', border: '1px solid #ccc', padding: '10px' }}
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
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].some(ext => clickedFile.toLowerCase().endsWith(ext));

    return (
      <div className="fileOverlay">
        <span className="close" onClick={handleCloseFile}>
          &times;
        </span>
        {isImage && (
          <img src={clickedFile} alt="Full size" className="fullImage" />
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

  return (
    <TableContainer component={Paper} className="table">
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell className="tableCell">Modelle</TableCell>
            <TableCell className="tableCell">Matriculation</TableCell>
            <TableCell className="tableCell">Carte Grise</TableCell>
            <TableCell className="tableCell">Assurance</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow key={user && user.id}>
            <TableCell className="tableCell">{user && user.modelle}</TableCell>
            <TableCell className="tableCell">{user && user.immatriculation}</TableCell>
            <TableCell className="tableCell">
              {renderFile(user && user.cartegrise, "Carte Grise")}
            </TableCell>
            <TableCell className="tableCell">
              {renderFile(user && user.assurance, "Assurance")}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      {renderFileModal()}
    </TableContainer>
  );
};

export default ListVoi;
