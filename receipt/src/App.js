import React, { useState, useEffect } from 'react';
import MainPart from './Components/MainPart'
import Start from './Components/Start';
import Register from './Components/Register';
import Login from './Components/Login';
import Profile from './Components/Profile';
import Loading from './Components/Loading';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Favicon from './favicon.ico';
import './App.css';

function App() {
  // Loading feature
  const [isLoading, setIsLoading] = useState(true);
  const [activeComponent, setActiveComponent] = useState('start');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [isPhoneNavVisible, setIsPhoneNavVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleStartButtonClick = () => {
    localStorage.setItem('hasVisited', 'true');
    setActiveComponent('main');
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogoutClick = () => {
    toast(
      ({ closeToast }) => (
        <div>
          <p>Are you sure you want to log out?</p>
          <button
            className="logout-button-yes"
            onClick={() => {
              localStorage.removeItem('authToken');
              setIsLoggedIn(false);
              setActiveComponent('main');
              closeToast();
              toast.success("You've been logged out.");
            }}
          >
            Yes
          </button>
          <button
            className="logout-button-cancel"
            onClick={closeToast}
          >
            Cancel
          </button>
        </div>
      ),
      {
        closeOnClick: false,
        autoClose: false,
      }
    );
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1300);

    return () => clearTimeout(timer);
  }, []);

  const handleLoginClick = () => setActiveComponent('login');
  const handleRegisterClick = () => setActiveComponent('register');
  const handleProfile = () => setActiveComponent('profile');
  const handleMainPart = () => setActiveComponent('start');
  const handleCurrencyChange = (e) => setSelectedCurrency(e.target.value);
  const handleNavToggle = () => setIsPhoneNavVisible(!isPhoneNavVisible);

  const renderComponent = () => {
    switch (activeComponent) {
      case 'login':
        return <Login setIsLoggedIn={setIsLoggedIn} />;
      case 'register':
        return <Register />;
      case 'profile':
        return <Profile />;
      case 'main':
        return <MainPart currency={selectedCurrency} />;
      case 'start':
      default:
        return <Start onButtonClick={handleStartButtonClick} />;
    }
  };

  // List of currencies
  const currencies = [
    { code: 'USD', name: 'United States Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound Sterling', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'PKR', name: 'Pakistani Rupees', symbol: '₨' },
  ];

  if (isLoading) {
    return <Loading />;
  }

  // Determine class names for bg-color div based on the active component
  const bgColorClass = ['bg-color'];
  if (['start', 'login', 'register'].includes(activeComponent)) {
    bgColorClass.push('d-flex', 'align-items-center');
  } else {
    bgColorClass.push('p-3', 'pt-5');
  }

  return (
    <div className="app">
      <div className='title d-flex justify-content-center'>
        <div className="nav-part d-flex justify-content-between align-items-center max-nav-width mx-1">
          <div className='logo-title-div d-flex align-items-center'>
            <div className='app-logo'>
              <img className='img-fluid' src={Favicon} alt="App Logo" />
            </div>
            <div className='app-title-div pt-1'>
              <h3 onClick={handleMainPart} className="app-title text-center py-2 pb-3 px-1">Receiptify</h3>
            </div>
          </div>
          <div className='d-flex align-items-center'>
            <div className='nav-link-div'>
              <ul className='d-flex nav-link-list align-items-center pt-3 px-3'>
                <li><a className='nav-btn' onClick={handleMainPart}>Home</a></li>
                <li>
                  {isLoggedIn ? (
                    <a className='nav-btn' onClick={handleLogoutClick}>Logout</a>
                  ) : (
                    <a className='nav-btn' onClick={handleLoginClick}>Login</a>
                  )}
                </li>
                <li><a className='nav-btn' onClick={handleRegisterClick}>Register</a></li>
              </ul>
            </div>
            <div className='mx-2 currency-div'>
              <select
                value={selectedCurrency}
                onChange={handleCurrencyChange}
                className="currency-part my-1 p-1 pb-2 px-2 pt-2"
              >
                {currencies.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    ({currency.code})
                  </option>
                ))}
              </select>
            </div>
            <div className='p-2 profile-icon'>
              <i onClick={handleProfile} className="pt-1 fa-solid fa-user"></i>
            </div>
            <div className='p-2 ham-icon'>
              <i onClick={handleNavToggle} className="pt-1 fa-solid fa-bars"></i>
            </div>
          </div>
          <div className={`phone-nav py-3 px-4 ${isPhoneNavVisible ? 'visible' : 'hidden'}`}>
            <div className=''>
              <ul className='nav-link-list p-0'>
                <li><a className='nav-btn' onClick={handleMainPart}>Home</a></li>
                <li>
                  {isLoggedIn ? (
                    <a className='nav-btn' onClick={handleLogoutClick}>Logout</a>
                  ) : (
                    <a className='nav-btn' onClick={handleLoginClick}>Login</a>
                  )}
                </li>
                <li><a className='nav-btn' onClick={handleRegisterClick}>Register</a></li>
              </ul>
            </div>
            <div className='phone-currency'>
              <select
                value={selectedCurrency}
                onChange={handleCurrencyChange}
                className="currency-part my-1 p-1"
              >
                {currencies.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    ({currency.code})
                  </option>
                ))}
              </select>
            </div>
            <div className='p-2 phone-icon'>
              <i onClick={handleProfile} className="pt-1 fa-solid fa-user"></i>
            </div>
          </div>
        </div>
      </div>
      <div className={bgColorClass.join(' ')}>
        <div className='max-content-width'>
          {renderComponent()}
        </div>
      </div>
    </div>
  );
}

export default App;