const nodemailer = require("nodemailer");

//**
//nombre usuario: info@onate.dev
//smtp: smtp.protonmail.ch
// 587

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true para 465, false para 587
  auth: {
    user: process.env.USER_CORREO,
    pass: process.env.TOKEN_CORREO_SMTP,
  },
});

module.exports = transporter;
