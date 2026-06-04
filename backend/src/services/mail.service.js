const transporter = require("../config/mailer");

const enviarCorreo = async ({ para, asunto, html, attachments }) => {
  const info = await transporter.sendMail({
    from: `"Mi App" <${process.env.USER_CORREO}>`,
    to: para,
    subject: asunto,
    html,
    attachments,
  });

  return info;
};

module.exports = { enviarCorreo };
