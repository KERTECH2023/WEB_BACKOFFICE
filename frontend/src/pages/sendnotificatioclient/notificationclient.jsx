import React, { useState } from 'react';
import axios from 'axios';
import Sidebar from "../../components/sidebar/Sidebar"
import Navbar from "../../components/navbar/Navbar"

const SendNotificationPageClient = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [responseMessage, setResponseMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResponseMessage(null);
    setIsLoading(true);

    try {
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/chauff/sendnotificationclient`, {
        title,
        body,
      });

      setResponseMessage(`Succès : ${response.data.message}`);
    } catch (error) {
      setResponseMessage(
        `Erreur : ${error.response?.data?.message || 'Une erreur est survenue.'}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="list">
          <Sidebar/>
          <div className="listContainer">
            <Navbar/>
    <div style={{ padding: '20px', maxWidth: '500px', margin: 'auto' }}>
      <h2>Envoyer une notification</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>
            Titre :
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '8px',
                marginTop: '5px',
                borderRadius: '5px',
                border: '1px solid #ccc',
              }}
            />
          </label>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>
            Message :
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '8px',
                marginTop: '5px',
                borderRadius: '5px',
                border: '1px solid #ccc',
              }}
            ></textarea>
          </label>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '5px',
            backgroundColor: '#007BFF',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {isLoading ? 'Envoi en cours...' : 'Envoyer'}
        </button>
      </form>
      {responseMessage && (
        <div
          style={{
            marginTop: '20px',
            padding: '10px',
            borderRadius: '5px',
            backgroundColor: responseMessage.startsWith('Succès')
              ? '#D4EDDA'
              : '#F8D7DA',
            color: responseMessage.startsWith('Succès') ? '#155724' : '#721C24',
            border: `1px solid ${
              responseMessage.startsWith('Succès') ? '#C3E6CB' : '#F5C6CB'
            }`,
          }}
        >
          {responseMessage}
        </div>
      )}
    </div>
    </div>
        </div>
  );
};

export default SendNotificationPageClient;



