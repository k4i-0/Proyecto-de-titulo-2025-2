const transporter = require("../config/mailer");

const enviarCorreo = async ({ para, asunto, html }) => {
  const info = await transporter.sendMail({
    from: `"Mi App" <${process.env.USER_CORREO}>`,
    to: para,
    subject: asunto,
    html,
  });

  return info;
};

module.exports = { enviarCorreo };
