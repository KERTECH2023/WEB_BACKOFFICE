import React, { useEffect, useState } from 'react';
import "./singleclient.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

const SingleClient = () => {
    const [user, setUser] = useState();
    const [orders, setOrders] = useState([]);
    const navigate = useNavigate();
    const { id } = useParams();
    const role = window.localStorage.getItem("userRole");

    useEffect(() => {
        if (id) {
            getSingleUser(id);
        }
    }, [id]);

    const getSingleUser = async (id) => {
        try {
            const response = await axios.get(process.env.REACT_APP_BASE_URL + `/Client/searchCl/${id}`);
            if (response.status === 200) {
                setUser({ ...response.data });
                fetchOrders(response.data.cnicNo);
            }
        } catch (error) {
            console.error("Error fetching user data: ", error);
        }
    };

    const fetchOrders = async (cnicNo) => {
        try {
            const response = await axios.get(`https://api.backofficegc.com/Ride/ride-requests/${cnicNo}`);
            if (response.status === 200) {
                setOrders(response.data);
            }
        } catch (error) {
            console.error("Error fetching orders: ", error);
        }
    };

    const handleSubmit = () => {
        axios.put(
            process.env.REACT_APP_BASE_URL + `/Client/updatestatus/${id}`,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        )
        .then(response => {
            toast.success('Compte Client a été Desactivé avec Success !', {
                position: toast.POSITION.TOP_RIGHT
            });
            setTimeout(() => navigate("/Client"), 3000);
        })
        .catch(err => {
            console.warn(err);
            toast.error('Email exist Already !', {
                position: toast.POSITION.TOP_RIGHT
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
                        <h1 className="title">Information</h1>
                        <div className="item">
                            <img src={user && user.photoAvatar} alt="" className="itemImg" />
                            <div className="details">
                                <h1 className="itemTitle">{user && user.Nom} {user && user.Prenom}</h1>
                                <div className="detailItem">
                                    <span className="itemKey">Nom:</span>
                                    <span className="itemValue">{user && user.Nom}</span>
                                </div>
                                <div className="detailItem">
                                    <span className="itemKey">Prenom:</span>
                                    <span className="itemValue">{user && user.Prenom}</span>
                                </div>
                                <div className="detailItem">
                                    <span className="itemKey">Téléphone:</span>
                                    <span className="itemValue">{user && user.phone}</span>
                                </div>
                                <div className="detailItem">
                                    <span className="itemKey">N° CIN:</span>
                                    <span className="itemValue">{user && user.cnicNo}</span>
                                </div>
                                {role === "Admin" || role === "Agentad" ? (
                                    <div className="deleteButtons" onClick={() => handleSubmit()}>
                                        Desactivé Ce Compte
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bottom">
                    <h1 className="title">Liste de Courses</h1>
                    <div className="orders">
                        {orders.length > 0 ? (
                            <ul>
                                {orders.map((order, index) => (
                                    <li key={index}>Commande ID: {order.id} - Status: {order.status}</li>
                                ))}
                            </ul>
                        ) : (
                            <p>Aucune commande trouvée.</p>
                        )}
                    </div>
                </div>
                <ToastContainer />
            </div>
        </div>
    );
};

export default SingleClient;
