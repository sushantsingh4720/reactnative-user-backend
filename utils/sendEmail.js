import nodemailer from "nodemailer";

const sendEmail = async (mailOptions) => {
  try {
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: process.env.SMPT_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER_NAME, // generated ethereal user
        pass: process.env.SMTP_USER_PASSWORD, // generated ethereal password
      },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail(mailOptions);

    console.log("Message sent: %s", info.accepted[0]);
  } catch (err) {
    console.log(err);
  }
};

export default sendEmail;
