const nodemailer = require("nodemailer");

const hasSmtpConfig = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS);

const sendOtpEmail = async (to, otp) => {
  if (!hasSmtpConfig()) {
    console.log(`⚠️ SMTP not configured. OTP for ${to}: ${otp}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: String(process.env.SMTP_SECURE || "false") === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: "Spotty OTP Verification",
    text: `Your Spotty OTP is ${otp}. It is valid for 10 minutes.`,
  });
};

module.exports = { sendOtpEmail };
