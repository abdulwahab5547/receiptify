import React, { useState, useEffect, useRef} from 'react';
import barcode from './barcode.png';
import html2canvas from 'html2canvas';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ToggleSwitch from './ToggleSwitch';
import ReceiptLogo from './receipt-logo.png';
import LogoUpload from './LogoUpload';

function MainPart({currency}) {
    const [rows, setRows] = useState([]); // Define rows state here

    const addRow = () => {
        setRows([...rows, { name: '', quantity: 1, price: '' }]);
    };

    const handleInputChange = (index, event) => {
        const { name, value } = event.target;
        const newRows = [...rows];
        newRows[index][name] = value;
        setRows(newRows);
    };

    const calculateTotalAmount = () => {
        return rows.reduce((total, row) => {
            return total + (parseFloat(row.price) * parseFloat(row.quantity) || 0);
        }, 0);
    };

    const [companyName, setCompanyName] = useState('');
    const [slogan, setSlogan] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [tax, setTax] = useState('');

    const subtotal = calculateTotalAmount();
    const taxAmount = (subtotal * tax) / 100;
    const netPayable = subtotal + taxAmount;

    const handleCompanyNameChange = (event) => {
        setCompanyName(event.target.value);
    };

    const handleSloganChange = (event) => {
        setSlogan(event.target.value);
    };

    const handleCustomerNameChange = (event) => {
        setCustomerName(event.target.value);
    };
    
    const handleTaxChange = (event) => {
        setTax(event.target.value);
    };

    const [currentDate, setCurrentDate] = useState(new Date());

    // Update the date every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentDate(new Date());
        }, 1000);

        // Clear the interval on component unmount
        return () => clearInterval(timer);
    }, []);

    const formattedDate = currentDate.toLocaleDateString();

    // Download and upload

    const [file, setFile] = useState(null);
    const [uploadUrl, setUploadUrl] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleDownload = async () => {
        const element = document.getElementById('the-receipt');
        if (element) {
          html2canvas(element).then(async (canvas) => {
            // Create an image URL from the canvas
            const imgData = canvas.toDataURL('image/png');
    
            // Create a link element
            const link = document.createElement('a');
            link.href = imgData;
            link.download = 'receipt.png';
    
            // Append the link to the body (required for Firefox)
            document.body.appendChild(link);
    
            // Trigger the download
            link.click();
    
            // Remove the link from the body
            document.body.removeChild(link);
    
            const response = await fetch(imgData);
            const blob = await response.blob();
            const file = new File([blob], 'receipt.png', { type: 'image/png' });
    
            // Set the file state
            setFile(file);
    
            // Upload the file
            handleUpload(file);
          });
        }
      };

    const handleUpload = async (file) => {
        if (!file) {
        alert('Please select a file first.');
        return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.post('/upload', formData, {
                headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`
                },
            });

        if (response.status === 200) {
            console.log('File uploaded successfully:', response.data.url);
            setUploadUrl(response.data.url);
        } else {
            console.error('Failed to upload file');
        }
        } catch (error) {
        console.error('Error uploading file:', error);
        }
    };


    // Fetching company name and slogan

    const [userData, setUserData] = useState({
        companyName: '',
        companySlogan: '',
      });
    
      // Getting data
    
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
                }
            }
        };
    
        fetchUserData();
      }, []); 

    //   Toggle code

    const [showCompanyName, setShowCompanyName] = useState(true);
    const [showSlogan, setShowSlogan] = useState(true);
    const [showCustomerName, setShowCustomerName] = useState(true);
    const [showBarcode, setShowBarcode] = useState(true);
    const [showTime, setShowTime] = useState(true);
    const [showDate, setShowDate] = useState(true);
    const [showThanks, setShowThanks] = useState(true);
    const [showCredits, setShowCredits] = useState(true);
    const [showCompanyLogo, setShowCompanyLogo] = useState(false);

    // Toggle functions for each state variable

    const handleShowCompanyLogo = () => {
        setShowCompanyLogo(prev => !prev);
    };

    const handleShowCompanyName = () => {
        setShowCompanyName(prev => !prev);
    };

    const handleShowSlogan = () => {
        setShowSlogan(prev => !prev);
    };

    const handleShowCustomerName = () => {
        setShowCustomerName(prev => !prev);
    };

    const handleShowBarcode = () => {
        setShowBarcode(prev => !prev);
    };

    const handleShowTime = () => {
        setShowTime(prev => !prev);
    };

    const handleShowDate = () => {
        setShowDate(prev => !prev);
    };

    const handleShowThanks = () => {
        setShowThanks(prev => !prev);
    };

    const handleShowCredits = () => {
        setShowCredits(prev => !prev);
    };

    // Font size slider
    const [receiptHeight, setReceiptHeight] = useState(30);
    const handleReceiptHeight = (event) => {
        setReceiptHeight(event.target.value);
    };

    const [receiptWidth, setReceiptWidth] = useState(10);
    const handleReceiptWidth = (event) => {
        setReceiptWidth(event.target.value);
    };

    const [companyLogoSize, setCompanyLogoSize] = useState(60);

    const handleCompanyLogoSize = (event) => {
        setCompanyLogoSize(event.target.value);
    };

    const [companyFontSize, setCompanyFontSize] = useState();

    const handleCompanyFontSize = (event) => {
        setCompanyFontSize(event.target.value);
    };

    const [sloganFontSize, setSloganFontSize] = useState();

    const handleSloganFontSize = (event) => {
        setSloganFontSize(event.target.value);
    };

    const [receiptFontSize, setReceiptFontSize] = useState();

    const handleReceiptFontSize = (event) => {
        setReceiptFontSize(event.target.value);
    };

    // Email logic

    const [isOverlayVisible, setOverlayVisible] = useState(false);
    const [customerEmail, setCustomerEmail] = useState('');
    const overlayRef = useRef(null);

    const openOverlay = () => {
        setOverlayVisible(true);
    };

    const closeOverlay = () => {
        setOverlayVisible(false);
    };

    const handleEmailChange = (event) => {
        setCustomerEmail(event.target.value);
    };

    const handleEmailSend = async () => {
        const element = document.getElementById('the-receipt');
        if (element) {
          const canvas = await html2canvas(element);
          const imgData = canvas.toDataURL('image/png');
    
          // Convert base64 URL to a blob
          const response = await fetch(imgData);
          const blob = await response.blob();
    
          const formData = new FormData();
          formData.append('email', customerEmail);
          formData.append('receipt', blob, 'receipt.png');
    
          fetch('/send-email', {
            method: 'POST',
            body: formData
          })
          .then(response => {
            if (response.ok) {
              console.log('Email sent successfully');
              toast.success("The receipt has been emailed.");
              closeOverlay(); // Close overlay on success
            } else {
              console.error('Failed to send email');
            }
          })
          .catch(error => {
            console.error('Error:', error);
          });
        }
      };

      useEffect(() => {
        const handleClickOutside = (event) => {
          if (overlayRef.current && !overlayRef.current.contains(event.target)) {
            closeOverlay();
          }
        };
    
        if (isOverlayVisible) {
          document.addEventListener('mousedown', handleClickOutside);
        } else {
          document.removeEventListener('mousedown', handleClickOutside);
        }
    
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
      }, [isOverlayVisible]);


    // Logo upload logic
    const [logoUrl, setLogoUrl] = useState('');

    const handleLogoChange = (newLogoUrl) => {
        setLogoUrl(newLogoUrl);
        setShowCompanyLogo(true);
        // Perform any additional actions needed when the logo is changed
        console.log('New logo URL:', newLogoUrl);
    };
    

    return (
        <div className="main-part row d-flex justify-content-around pb-3">
            <ToastContainer />
            <div className="col-12 col-sm-12 col-md-7 col-lg-7 pb-3">
                <div className="inner-bg p-3 px-4 py-4">
                    <h4 className="h4 pb-2">
                        Enter Receipt Details
                    </h4>
                    <hr style={{ backgroundColor: 'white', height: '2px', border: 'none', width: '100%' }} className='horizontal-line' />
                    <div className='receipt-inputs'>
                        <div className='d-flex justify-content-between row pb-3'>
                            <div className="col">
                                <p className="pb-2 m-0 profile-text">Company name</p>
                                <input
                                    className='py-2 px-2 form-control'
                                    type="text"
                                    placeholder="Company Name"
                                    name="companyName"
                                    value={userData.companyName || companyName}
                                    onChange={handleCompanyNameChange}
                                />
                            </div>
                            <div className="col">
                                <p className="pb-2 m-0 profile-text">Slogan</p>
                                <input
                                    className='py-2 px-2 form-control'
                                    type="text"
                                    placeholder="Slogan (Optional)"
                                    name="slogan"
                                    value={userData.companySlogan || slogan}
                                    onChange={handleSloganChange}
                                />
                            </div>
                            
                        </div>
                        <div className='d-flex row justify-content-between'>
                            <div className="col">
                                <p className="pb-2 m-0 profile-text">Customer name</p>
                                <input
                                    className='py-2 px-2 form-control'
                                    type="text"
                                    placeholder="Customer Name"
                                    name="customerName"
                                    value={customerName}
                                    onChange={handleCustomerNameChange}
                                />
                            </div>
                            <div className="col">
                                <p className="pb-2 m-0 profile-text">Tax</p>
                                <input
                                    className='py-2 px-2 form-control'
                                    type="number"
                                    placeholder="Tax (%)"
                                    name="tax"
                                    value={tax}
                                    onChange={handleTaxChange}
                                />
                            </div>
                        </div>
                        <div className='d-flex row justify-content-between pt-3'>
                            <div className="col">
                                <div>
                                <p className="pb-3 m-0 profile-text pb-2">Company logo</p>
                                    <LogoUpload onChange={handleLogoChange} setLogoUrl={setLogoUrl} logoUrl={logoUrl}/>
                                </div>
                            </div>
                            <div className='col'>

                            </div>
                        </div>
                        
                        
                        <div className='receipt-items my-3 pt-3 px-3'>
                            {rows.map((row, index) => (
                                <div className="row items-row mb-3" key={index}>
                                    <div className="col p-0">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Item Name"
                                            name="name"
                                            value={row.name}
                                            onChange={(event) => handleInputChange(index, event)}
                                        />
                                    </div>
                                    <div className="col p-0">
                                        <input
                                            type="number"
                                            className="form-control"
                                            placeholder="Quantity"
                                            name="quantity"
                                            value={row.quantity}
                                            onChange={(event) => handleInputChange(index, event)}
                                        />
                                    </div>
                                    <div className="col p-0">
                                        <input
                                            type="number"
                                            className="form-control"
                                            placeholder="Price"
                                            name="price"
                                            value={row.price}
                                            onChange={(event) => handleInputChange(index, event)}
                                        />
                                    </div>
                                </div>
                            ))}

                        </div>
                        <button type="button" onClick={addRow} className="mx-1 add-item-btn my-1 p-2 px-3">Add Item</button>
                    </div>
                </div>
                <div className="inner-bg p-3 p-4 mt-5">
                    <h4 className="h4 pb-3">
                        Customization
                    </h4>
                    {/* <hr style={{ backgroundColor: '#5224D2', height: '2px', border: 'none', width: '100%' }} className='horizontal-line' />
                    <div className='templates'>
                        <h5 className="h5 pb-3">
                            Template
                        </h5>
                    </div> */}

                    <hr style={{ backgroundColor: 'white', height: '2px', border: 'none', width: '100%' }} className='horizontal-line' />
                    <div className='row customization-sliders pt-2'>
                            <h5 className="h5 pb-3">
                                Size Adjustments
                            </h5>
                            <div className='col-md-4 col-lg-4 col-12 col-sm-12 pb-3'>
                                <div className='range'>
                                <p className="pb-1 m-0 slider-text">Height</p>
                                <div className='d-flex range-gap align-items-center'>
                                    <input
                                        type="range"
                                        min="20"
                                        max="120"
                                        value={receiptHeight}
                                        onChange={handleReceiptHeight}
                                    />
                                <div>
                                    <p className='m-0'>{receiptHeight}px</p>
                                </div>
                                
                                </div>
                                
                                </div>
                            </div>
                            <div className='col-md-4 col-lg-4 col-12 col-sm-12 pb-3'>
                                <div className='range'>
                                <p className="pb-1 m-0 slider-text">Width</p>
                                <div className='d-flex range-gap align-items-center'>
                                    <input
                                        type="range"
                                        min="0"
                                        max="50"
                                        value={receiptWidth}
                                        onChange={handleReceiptWidth}
                                    />
                                <div>
                                    <p className='m-0'>{receiptWidth}px</p>
                                </div>
                                
                                </div>
                                
                                </div>
                            </div>
                            <div className='col-md-4 col-lg-4 col-12 col-sm-12 pb-3'>
                                <div className='range'>
                                <p className="pb-1 m-0 slider-text">Company logo</p>
                                <div className='d-flex range-gap align-items-center'>
                                    <input
                                        type="range"
                                        min="30"
                                        max="120"
                                        value={companyLogoSize}
                                        onChange={handleCompanyLogoSize}
                                    />
                                <div>
                                    <p className='m-0'>{companyLogoSize}px</p>
                                </div>
                                
                                </div>
                                
                                </div>
                            </div>
                            <div className='col-md-4 col-lg-4 col-12 col-sm-12 pb-3'>
                                <div className='range'>
                                <p className="pb-1 m-0 slider-text">Company name</p>
                                <div className='d-flex range-gap align-items-center'>
                                    <input
                                        type="range"
                                        min="20"
                                        max="50"
                                        value={companyFontSize}
                                        onChange={handleCompanyFontSize}
                                    />
                                <div>
                                    <p className='m-0'>{companyFontSize}px</p>
                                </div>
                                
                                </div>
                                
                                </div>
                                
                            </div>
                            <div className='col-md-4 col-lg-4 col-12 col-sm-12 pb-3'>
                                <div className='range'>
                                <p className="pb-1 m-0 slider-text">Slogan</p>
                                <div className='d-flex range-gap align-items-center'>
                                <input
                                    type="range"
                                    min="13"
                                    max="28"
                                    value={sloganFontSize}
                                    onChange={handleSloganFontSize}
                                />
                                <div>
                                    <p className='m-0'>{sloganFontSize}px</p>
                                </div>
                                </div>
                                
                                </div>
                                
                            </div>
                            <div className='col-md-4 col-lg-4 col-12 col-sm-12 pb-3'>
                                <div className='range'>
                                <p className="pb-1 m-0 slider-text">Text</p>
                                <div className='d-flex range-gap align-items-center'>
                                <input
                                    type="range"
                                    min="10"
                                    max="18"
                                    value={receiptFontSize}
                                    onChange={handleReceiptFontSize}
                                />
                                <div>
                                    <p className='m-0'>{receiptFontSize}px</p>
                                </div>
                                </div>
                                
                                </div>
                                
                            </div>
                            <div>
                            
                        </div>
                    </div>
                    <hr style={{ backgroundColor: 'white', height: '2px', border: 'none', width: '100%' }} className='horizontal-line' />
                    <div className='row customization-toggles pt-2'>
                        <h5 className="h5 pb-2">
                            Show/Hide Items
                        </h5>
                        <div className="col-md-4 col-lg-4 col-12 col-sm-4">
                            <ToggleSwitch
                                isChecked={showCompanyLogo}
                                onToggle={handleShowCompanyLogo}
                                label="company logo"
                            />
                        </div>
                        <div className="col-md-4 col-lg-4 col-12 col-sm-4">
                            
                            <ToggleSwitch
                                isChecked={showCompanyName}
                                onToggle={handleShowCompanyName}
                                label="company name"
                            />
                            
                        </div>
                        <div className="col-md-4 col-lg-4 col-12 col-sm-4">
                            <ToggleSwitch
                                isChecked={showSlogan}
                                onToggle={handleShowSlogan}
                                label="slogan"
                            />

                        </div>

                        <div className="col-md-4 col-lg-4 col-12 col-sm-4">
                            <ToggleSwitch
                                isChecked={showCustomerName}
                                onToggle={handleShowCustomerName}
                                label="customer name"
                            />
                        </div>
                        <div className="col-md-4 col-lg-4 col-12 col-sm-4">
                            <ToggleSwitch
                                isChecked={showBarcode}
                                onToggle={handleShowBarcode}
                                label="barcode"
                            />
                        </div>
                        <div className="col-md-4 col-lg-4 col-12 col-sm-4">
                            <ToggleSwitch
                                isChecked={showTime}
                                onToggle={handleShowTime}
                                label="time"
                            />
                        </div>
                        <div className="col-md-4 col-lg-4 col-12 col-sm-4">
                            <ToggleSwitch
                                isChecked={showDate}
                                onToggle={handleShowDate}
                                label="date"
                            />
                        </div>
                        <div className="col-md-4 col-lg-4 col-12 col-sm-4">
                            <ToggleSwitch
                                isChecked={showThanks}
                                onToggle={handleShowThanks}
                                label="thanks"
                            />
                        </div>
                        <div className="col-md-4 col-lg-4 col-12 col-sm-4">
                            <ToggleSwitch
                                isChecked={showCredits}
                                onToggle={handleShowCredits}
                                label="credits"
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-12 col-sm-12 col-md-4 col-lg-4">
                <div className="inner-bg p-3 px-4 py-4">
                    <h4 className="h4 pb-1">
                        Your Receipt
                    </h4>
                    <hr style={{ backgroundColor: 'white', height: '2px', border: 'none', width: '100%' }} className='horizontal-line' />
                    <div className='receipt-adj px-3 mb-3 pt-2'>
                        <div style={{paddingTop: `${receiptHeight}px`, paddingBottom: `${receiptHeight}px`, paddingLeft: `${receiptWidth}px`, paddingRight: `${receiptWidth}px`}} id='the-receipt' className='the-receipt'>
                            <div className='receipt-content px-3 py-2 pb-3'>
                                {showCompanyLogo && 
                                    <div className='receipt-company-logo-div text-center pb-3'>
                                        <img 
                                            className='img-fluid' 
                                            src={logoUrl}
                                            alt="Company Logo"
                                            style={{ width: `${companyLogoSize}px`, height: `${companyLogoSize}px` }}
                                        />
                                    </div>
                                }
                                
                                {showCompanyName && <h5 style={{ fontSize: `${companyFontSize}px` }} className='text-center r-company'>{userData.companyName || companyName}</h5>}
                                {showSlogan && <h6 style={{ fontSize: `${sloganFontSize}px` }} className='text-center r-slogan'>{userData.companySlogan || slogan}</h6>}
                                {showCustomerName && <p style={{ fontSize: `${receiptFontSize}px` }} className='r-p py-2 customer-para'>Customer name: {customerName}</p>}
                                <div className='dotted-line pb-2 px-2'>
                                </div>
                                <div className='receipt-items-attributes row px-3'>
                                    <div className="col p-0">
                                        <p style={{ fontSize: `${receiptFontSize}px` }}>Item</p>
                                    </div>
                                    <div className="col p-0">
                                        <p style={{ fontSize: `${receiptFontSize}px` }}>Qty.</p>
                                    </div>
                                    <div className="col p-0">
                                        <p style={{ fontSize: `${receiptFontSize}px` }}>Price</p>
                                    </div>
                                </div>
                                <div className='dotted-line pb-2 px-2'></div>
                                <div className='receipt-items px-3 my-3'>
                                    {rows.map((row, index) => (
                                        <div key={index} className="row items-row mb-1">
                                            <div className="col p-0">
                                                <p style={{ fontSize: `${receiptFontSize}px` }}>{row.name}</p>
                                            </div>
                                            <div className="col p-0">
                                                <p style={{ fontSize: `${receiptFontSize}px` }}>{row.quantity}</p>
                                            </div>
                                            <div className="col p-0">
                                                <p style={{ fontSize: `${receiptFontSize}px` }}> {row.price}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>  
                                <div className='dotted-line pb-2 px-2'></div>
                                <div className='r-calculations row px-3'>
                                    <div className='col p-0'>

                                    </div>
                                    <div className='col p-0'>
                                        <p style={{ fontSize: `${receiptFontSize}px` }} className='r-subtotal'>Subtotal:</p>
                                    </div>
                                    <div className='col p-0'>
                                        <p style={{ fontSize: `${receiptFontSize}px` }} className='r-subtotal'>{currency} {subtotal.toFixed(2)}</p>
                                    </div>
                                </div>
                                <div className='r-calculations row px-3'>
                                    <div className='col p-0'>

                                    </div>
                                    <div className='col p-0'>
                                        <p style={{ fontSize: `${receiptFontSize}px` }} className='r-subtotal'>Tax:</p>
                                    </div>
                                    <div className='col p-0'>
                                        <p style={{ fontSize: `${receiptFontSize}px` }} className='r-subtotal'>{currency} {taxAmount.toFixed(2)} ({tax}%)</p>
                                    </div>
                                </div>
                                <div className='dotted-line pb-2 px-2'>
                                </div>
                                <div className='r-calculations row px-3'>
                                    <div className='col p-0'>

                                    </div>
                                    <div className='col p-0'>
                                        <p style={{ fontSize: `${receiptFontSize}px` }} className='r-subtotal'>Net payable:</p>
                                    </div>
                                    <div className='col p-0'>
                                        <p style={{ fontSize: `${receiptFontSize}px` }} className='r-subtotal'>{currency} {netPayable.toFixed(2)}</p>
                                    </div>
                                </div>
                                {showBarcode && <div className='barcode py-3'>
                                    <img className="barcode-img img-fluid" src={barcode}/>
                                </div>}
                                <div className='d-flex row justify-content-between pt-2 px-1'>
                                    {showDate&& <div className='col'>
                                        <p style={{ fontSize: `${receiptFontSize}px` }} className='r-para'>{formattedDate}</p>
                                    </div>}
                                    
                                    {showTime &&
                                    <div className='col text-end'>
                                        <p style={{ fontSize: `${receiptFontSize}px` }} className='r-para'>{currentDate.toLocaleTimeString()}</p>
                                    </div>}
                                    
                                </div>
                                {showThanks && <div className='pt-2 px-2'>
                                    <p className='r-thank-para text-center'>Thank You</p>    
                                </div>}
                                {showCredits && <div className='pt-2 px-1'>
                                    <div className='d-flex align-items-center credits-div'>
                                        <div className='receipt-logo-div'>
                                            <img className="img-fluid" src={ReceiptLogo} />
                                        </div>
                                        <div>
                                            <p style={{ fontSize: `${receiptFontSize}px` }} className='r-big-para m-0'>Powered by: Receptify</p>
                                            <p style={{ fontSize: `${receiptFontSize}px` }} className='r-big-para m-0'>App by: <a className="receipt-author-link" href="https://abdulwahab5547.github.io/portfolio/">Abdul Wahab</a></p>  
                                        </div>
                                        
                                    </div>
                                      
                                </div>}
                            </div>
                            
                        </div>
                        
                    </div>
                    <div className='d-flex justify-content-center pt-3 pb-2'>
                        <button onClick={handleDownload} type="button" className="mx-1 add-item-btn my-1 p-2 px-3">Download Receipt</button>
                        <button onClick={openOverlay} type="button" className="mx-1 add-item-btn my-1 p-2 px-3">Email</button>
                        {isOverlayVisible && (
                            <div className="email-overlay">
                                <div className="email-overlay-content py-3 px-4" ref={overlayRef}>
                                    <h4 className='h4 py-2'>Enter Customer's Email Address</h4>
                                    <input className='my-2 form-control'
                                    type="email"
                                    value={customerEmail}
                                    onChange={handleEmailChange}
                                    placeholder="Customer's Email"
                                    />
                                    <div className='py-2 text-center'><button className="add-item-btn my-1 p-2 px-3 mx-1" onClick={handleEmailSend}>Send Email</button></div>
                                    
                                    
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* {uploadUrl && (
                        <div>
                        <p>Image uploaded successfully:</p>
                        <a href={uploadUrl} target="_blank" rel="noopener noreferrer">View Image</a>
                        </div>
                    )} */}
                </div>
            </div>
        </div>
    );
}

export default MainPart;
