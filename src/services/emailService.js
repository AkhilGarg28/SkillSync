const nodemailer = require('nodemailer');

let transporter;

async function getTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    transporter = nodemailer.createTransport({
      jsonTransport: true,
    });
  }
  return transporter;
}

const sendResetEmail = async (email, token) => {
  const mailTransporter = await getTransporter();
  const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:3000';
  const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

  const mailOptions = {
    from: process.env.SMTP_USER || 'no-reply@skillsync.com',
    to: email,
    subject: 'Password Reset Request',
    text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n` +
      `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
      `${resetUrl}\n\n` +
      `If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    html: `<p>You are receiving this email because you (or someone else) have requested the reset of the password for your account.</p>` +
      `<p>Please click on the following link, or paste this into your browser to complete the process:</p>` +
      `<p><a href="${resetUrl}">${resetUrl}</a></p>` +
      `<p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`
  };

  return await mailTransporter.sendMail(mailOptions);
};

module.exports = {
  sendResetEmail,
  getTransporter,
};
