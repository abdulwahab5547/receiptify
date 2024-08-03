import nodemailer from 'nodemailer';


const sendEmail = async (recipientEmail, receiptFileBuffer) => {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SENDER_EMAIL,
        pass: process.env.GMAIL_EMAIL_PASS 
      }
    });
  
    const mailOptions = {
        from: process.env.SENDER_EMAIL, // Sender address
        to: recipientEmail, // Use the email address passed as a parameter
        subject: 'Your receipt is here! - Receiptify', // Subject line
        text: 'Please find your receipt attached.', // Plain text body
        attachments: [
          {
            filename: 'receipt.png',
            content: receiptFileBuffer, // Ensure this is the file buffer
            contentType: 'image/png'
          }
        ]
      };
  
    try {
      await transporter.sendMail(mailOptions);
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  };

export default sendEmail;