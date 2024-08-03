import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Profile() {
    const [userData, setUserData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        companyName: '',
        companySlogan: '',
    });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('authToken'); // Retrieve token from localStorage

                if (!token) {
                    console.error('No token found');
                    toast.info('Please log in to use all features.');
                    return;
                }

                const response = await axios.get('/api/user', {
                    headers: {
                        Authorization: `Bearer ${token}` // Include token in Authorization header
                    }
                });

                console.log('User data response:', response.data);

                setUserData(response.data);
            } catch (error) {
                if (error.response && error.response.status === 401) {
                    console.error('Token is invalid or expired:', error);
                    toast.error('Session expired. Please log in again.');
                    localStorage.removeItem('authToken');
                    window.location.href = '/login';
                } else if (error.response && error.response.status === 404) {
                    console.error('Route not found:', error);
                    toast.error('The requested resource was not found.');
                } else {
                    console.error('Error fetching user data:', error);
                    toast.error("There was an error fetching user data. Make sure you're logged in.");
                }
            }
        };

        fetchUserData();
    }, []);

    const handleChange = (e) => {
        setUserData({
            ...userData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('authToken'); // Retrieve token from localStorage
    
            if (!token) {
                console.error('No token found');
                toast.info('Please log in to use all features.');
                return;
            }
    
            await axios.put('/api/user', userData, {
                headers: {
                    Authorization: `Bearer ${token}` // Include token in Authorization header
                }
            });
    
            toast.success('Your account details have been updated successfully!');
        } catch (error) {
            toast.error('There was an error updating your account details!');
            console.error('Error updating user data:', error);
        }
    };


    // Receipt history

    const [receipts, setReceipts] = useState([]);

    useEffect(() => {
        const fetchReceipts = async () => {
        try {
            const token = localStorage.getItem('authToken'); // Adjust based on where you store the token
            const response = await axios.get('/api/user/receipts', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
            });

            if (response.status === 200) {
            setReceipts(response.data.receiptUrls);
            } else {
            console.error('Failed to fetch receipts');
            }
        } catch (error) {
            console.error('Error fetching receipts:', error);
        }
        };

        fetchReceipts();
    }, []);

    // Select image feature

    const [selectedImage, setSelectedImage] = useState(null);

    const handleImageClick = (url) => {
        setSelectedImage(url);
      };
    
      const handleOverlayClick = () => {
        setSelectedImage(null);
      };

    return (
        <div className="row d-flex justify-content-around pb-4">
            <ToastContainer />
            <div className="col-12 col-sm-12 col-md-7 col-lg-7 pb-3">
                <div className="inner-bg p-3 py-4 px-4">
                    <h4 className="h4 pb-2">Your Account Details</h4>
                    <hr style={{ backgroundColor: 'white', height: '2px', border: 'none', width: '100%' }} className='horizontal-line' />
                    <form className='receipt-inputs pt-1' onSubmit={handleSubmit}>
                        <div className='py-2'>
                            <p className="pb-2 m-0 profile-text">First name</p>
                            <input
                                className='py-2 px-2 form-control'
                                type="text"
                                placeholder="First Name"
                                name="firstName"
                                value={userData.firstName || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className='py-2'>
                        <p className="pb-2 m-0 profile-text">Last name</p>
                            <input
                                className='py-2 px-2 form-control'
                                type="text"
                                placeholder="Last Name"
                                name="lastName"
                                value={userData.lastName || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className='py-2'>
                            <p className="pb-2 m-0 profile-text">Email</p>
                            <input
                                className='py-2 px-2 form-control'
                                type="text"
                                placeholder="Email"
                                name="email"
                                value={userData.email || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className='py-2'>
                            <p className="pb-2 m-0 profile-text">Password</p>
                            <input
                                className='py-2 px-2 form-control'
                                type="password"
                                placeholder="Password"
                                name="password"
                                value={userData.password || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className='py-2'>
                            <p className="pb-2 m-0 profile-text">Company name</p>
                            <input
                                className='py-2 px-2 form-control'
                                type="text"
                                placeholder="Company Name"
                                name="companyName"
                                value={userData.companyName || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className='py-2'>
                            <p className="pb-2 m-0 profile-text">Slogan</p>
                            <input
                                className='py-2 px-2 form-control'
                                type="text"
                                placeholder="Slogan (Optional)"
                                name="companySlogan"
                                value={userData.companySlogan || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="text-center pt-4 pb-1">
                            <button type="submit" className="mx-1 add-item-btn my-1 p-2 px-3">Save Changes</button>
                        </div>
                    </form>
                </div>
            </div>
            <div className="col-12 col-sm-12 col-md-4 col-lg-4">
                <div className="inner-bg p-3 py-4 px-4">
                    <h4 className="h4 pb-2">
                        Your Receipts
                    </h4>
                    <hr style={{ backgroundColor: 'white', height: '2px', border: 'none', width: '100%' }} className='horizontal-line' />
                    <div className='px-2 pt-3'>
                        <div className='row'>
                            {receipts.slice().reverse().map((url, index) => (
                                <img
                                className='img-fluid pb-4 col-sm-12 col-12 col-md-6 col-lg-6'
                                key={index}
                                src={url}
                                alt={`Receipt ${index + 1}`}
                                onClick={() => handleImageClick(url)}
                                />
                            ))}
                        </div>
                    </div>
                    {selectedImage && (
                        <div className='overlay' onClick={handleOverlayClick}>
                        <img className='overlay-image' src={selectedImage} alt='Enlarged Receipt' />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Profile;
