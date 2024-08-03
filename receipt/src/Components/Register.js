import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function Register() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        companyName: '',
        companySlogan: ''
    });

    const [showLogin, setShowLogin] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/signup', formData);
            toast.success('Your account has been registered successfully! Please log in.');
            console.log('User created:', response.data);
            setShowLogin(true);
        } catch (error) {
            toast.error('There was an erorr registering your account!');
            console.error('Error creating user:', error);
        }
    };

    return (
        <div>
            <div className="inner-bg max-width p-2 py-4">
                
                
                <form className="receipt-inputs px-3 pt-1" onSubmit={handleSubmit}>
                    <h4 className="h4 text-center pb-2">Sign Up</h4>
                    <hr style={{ backgroundColor: 'white', height: '2px', border: 'none', width: '100%' }} className='horizontal-line' />
                    <div className="d-flex first-and-last py-2">
                        <input
                            className="py-2 px-2 form-control"
                            type="text"
                            placeholder="First Name"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                        />
                        <input
                            className="py-2 px-2 form-control"
                            type="text"
                            placeholder="Last Name"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                        />
                    </div>
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
                    <div className="py-2">
                        <input
                            className="py-2 px-2 form-control"
                            type="text"
                            placeholder="Company Name"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="py-2">
                        <input
                            className="py-2 px-2 form-control"
                            type="text"
                            placeholder="Slogan (Optional)"
                            name="companySlogan"
                            value={formData.companySlogan}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="text-center pt-3">
                        <button type="submit" className="mx-1 add-item-btn my-1 p-2 px-3">Register</button>
                    </div>
                </form>
                <ToastContainer />
            </div>
        </div>
    );
}

export default Register;