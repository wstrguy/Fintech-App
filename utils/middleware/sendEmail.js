const nodemailer = require("nodemailer");

const { SMTP_USER, SMTP_PASSWORD } = process.env;

const sendEmail = async (options) => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    tls: {
      rejectUnauthorized: true,
    },
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD,
    },
    
  });


  // 2) Define the email options
  const mailOptions = {
    from: `Tech App ${SMTP_USER}`,
    to: options.email, //bcc is so that it hides the use of multiple emails at once.
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;