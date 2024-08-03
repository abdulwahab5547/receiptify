import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';

const LogoUpload = ({logoUrl, setLogoUrl}) => {

    const handleLogoChange = (acceptedFiles) => {
        const file = acceptedFiles[0];
        const reader = new FileReader();

        reader.onload = () => {
            const newLogoUrl = reader.result;
            setLogoUrl(newLogoUrl); // Update the logoUrl state in MainPart
            console.log('New logo URL:', newLogoUrl); // Log the new logo URL
        };

        reader.readAsDataURL(file);
    };

    const { getRootProps, getInputProps } = useDropzone({
        onDrop: handleLogoChange,
        accept: 'image/*',
    });

    return (
        <div className='d-flex align-items-center'>
            <div className='logo-upload-div' {...getRootProps()} style={{ border: '2px dashed #cccccc', padding: '12px', textAlign: 'center' }}>
                <input {...getInputProps()} />
                <p className='m-0'>Upload logo</p>
            </div>
            {logoUrl && (
                <div className=''>
                    <img className='p-2' src={logoUrl} alt="Company Logo" style={{ width: '60px', height: '60px'}} />
                </div>
            )}
        </div>
    );
};

export default LogoUpload;