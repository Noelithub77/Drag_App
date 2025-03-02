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
    from: "draigon.guardianalert@gmail.com", // Sender address
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


sendEmail("noelmcv7@gmail.com", "ALERT!!", "⚠️ Warning: Looks like the person you’ve appointed has stepped off track and is involved with drugs again. Please step in and help them get back on the right path.");
export { sendEmail};
