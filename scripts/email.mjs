import nodemailer from 'nodemailer';

async function sendEmail(to, subject, text) {
  // Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "draigon.guardianalert@gmail.com",
    pass: "mtxx vfgf fsvo bppz"
  }
});

  // Set up email data
  let mailOptions = {
    from: "draigon_guardian_alert@outlook.com", // Sender address
    to: to, // List of receivers
    subject: subject, // Subject line
    text: text, // Plain text body
  };

  // Send mail with defined transport object
  try {
    let info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
  } catch (error) {
    console.error('Error sending email: ' + error);
  }
}


sendEmail("noelmcv7@gmail.com", "alert", "your apprentice has turned to the darkside");
export { sendEmail};
