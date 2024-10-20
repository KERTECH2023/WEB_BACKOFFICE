import React, { useState } from "react";
import { storage, ref, uploadBytesResumable, getDownloadURL } from "../config"; // Adjust the path to your Firebase config file

const SingleFacture = () => {
  const [file, setFile] = useState(null); // State to handle the selected file
  const [uploadProgress, setUploadProgress] = useState(0);
  const [downloadURL, setDownloadURL] = useState("");

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  // Handle file upload to Firebase
  const handleUpload = () => {
    if (!file) return alert("Please select a file first!");

    // Reference to the location in Firebase Storage
    const storageRef = ref(storage, `invoices/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    // Track the state of the upload
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress); // Update progress state
        console.log("Upload is " + progress + "% done");
      },
      (error) => {
        // Handle upload error
        console.error("Error uploading file:", error);
      },
      () => {
        // On successful upload, get the file's download URL
        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
          setDownloadURL(url); // Store the download URL in state
          console.log("File available at", url);
        });
      }
    );
  };

  return (
    <div>
      <h1>Upload Invoice</h1>
      
      {/* File input */}
      <input type="file" onChange={handleFileChange} />
      
      {/* Upload button */}
      <button onClick={handleUpload}>Consulter</button>

      {/* Display upload progress */}
      {uploadProgress > 0 && <p>Upload Progress: {uploadProgress}%</p>}
      
      {/* Display download URL if available */}
      {downloadURL && (
        <div>
          <p>Upload complete! File available at:</p>
          <a href={downloadURL} target="_blank" rel="noopener noreferrer">
            {downloadURL}
          </a>
        </div>
      )}
    </div>
  );
};

export default SingleFacture;
