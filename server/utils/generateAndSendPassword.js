import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const generatePassword = () => {
  const length = 8;
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";
  for (let i = 0, n = charset.length; i < length; ++i) {
    password += charset.charAt(Math.floor(Math.random() * n));
  }
  return password;
};

export const sendPasswordByEmail = async (email, password) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "A tua nova password",
    html: `
   <!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background-color: #f5f5f7;
            margin: 0;
            padding: 0;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            padding: 20px;
            border-radius: 12px;
            background-color: #ffffff;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .header {
            font-size: 24px;
            font-weight: 600;
            text-align: center;
            color: #1d1d1f;
            margin-bottom: 20px;
        }
        .content {
            font-size: 16px;
            line-height: 1.6;
            color: #1d1d1f;
        }
        .content p {
            margin: 0 0 16px;
        }
        .password {
            display: block;
            font-size: 18px;
            font-weight: 500;
            text-align: center;
            color: #007aff;
            margin: 20px 0;
        }
        .footer {
            margin-top: 30px;
            font-size: 14px;
            color: #86868b;
            text-align: center;
        }
        @media (max-width: 600px) {
            .container {
                padding: 15px;
            }
            .header {
                font-size: 20px;
            }
            .content {
                font-size: 14px;
            }
            .password {
                font-size: 16px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">A tua nova password</div>
        <div class="content">
            <p>Olá,</p>
            <p>Antes de tudo queremos-te agradecer pela tua inscrição na Sonder Hub, se tiveres alguma dúvida ou problema, podes sempre contar connosco.</p>
            <p>Dentro de 24 horas deves receber a tua fatura com todos os dados da tua inscrição.</p>
            <p>Segue abaixo a tua password:</p>
            <p class="password"><strong>${password}</strong></p>
            <p>Utiliza esta password juntamente com este E-Mail para entrares na nossa aplicação. Nunca a divulgues, pois ela é a tua única chave para aceder à aplicação.</p>
            <p>Depois de entrares não te esqueças de a trocar para deixares a tua conta ainda mais segura!</p>
        </div>
        <div class="footer">
            Obrigado,<br>
            Sonder Hub
        </div>
    </div>
</body>
</html>

    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password email sent to ${email}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Erro ao enviar o email.");
  }
};
