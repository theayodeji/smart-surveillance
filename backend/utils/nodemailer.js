import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// 📌 Configure the email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // You can use other providers (Outlook, SMTP, etc.)
    auth: {
        user: process.env.EMAIL_USER,  // Your email address
        pass: process.env.EMAIL_PASS   // Your email password or app-specific password
    }
});

// 📌 Function to send an alert email
export const sendAlertEmail = async (imageUrl, alertEmail) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: alertEmail, // The recipient's email address
            subject: '🚨 Motion Detected - Surveillance System Alert',
            html: `
                <h2>Motion Detected!</h2>
                <p>A new event has been logged in your surveillance system.</p>
                <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>Captured Image:</strong></p>
                <img src="${imageUrl}" alt="Captured Image" width="400">
                <p>Click <a href="${imageUrl}" target="_blank">here</a> to view the image.</p>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('📧 Alert Email sent:', info.response);
    } catch (error) {
        console.error('❌ Email sending failed:', error.message);
    }
};
