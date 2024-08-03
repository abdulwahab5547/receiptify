import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Login({ setIsLoggedIn }) {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/login', formData);
            if (response.data.token) {
                // Save token to localStorage
                localStorage.setItem('authToken', response.data.token);
    
                // Update logged-in state in parent component
                setIsLoggedIn(true);

                // Show success message
                toast.success("You've successfully logged in!");
    
                // Log success for debugging
                console.log('Logged in:', response.data);
            } else {
                throw new Error('Token not received from server');
            }
        } catch (error) {
            toast.error('There was an error logging into your account!');
            console.error('Error logging in:', error);
        }
    };

    return (
        <div>
            <div className="inner-bg max-width p-2 py-4">
                <h4 className="h4 text-center pb-3">Log In</h4>
                
                <form className="receipt-inputs px-3 " onSubmit={handleSubmit}>
                <hr style={{ backgroundColor: 'white', height: '2px', border: 'none', width: '100%' }} className='horizontal-line' />
                    <div className="py-2">
                        <input
                            className="py-2 px-2 form-control"
                            type="text"
                            placeholder="Email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="py-2">
                        <input
                            className="py-2 px-2 form-control"
                            type="password"
                            placeholder="Password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="text-center pt-3">
                        <button type="submit" className="mx-1 add-item-btn my-1 p-2 px-3">Log In</button>
                    </div>
                </form>
                <ToastContainer />
            </div>
        </div>
    );
}

export default Login;
