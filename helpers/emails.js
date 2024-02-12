import nodemailer from 'nodemailer'
const emailRegistro = async (datos) => {
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const {email, nombre, token } = datos

    //Enviamos email
    await transport.sendMail({
        from: 'BienesRacices.com',
        to: email,
        subject: 'Confirma tu cuenta en BienesRacices.com',
        text: 'Confirma tu cuenta en BienesRacices.com',
        html:`<h2>Hola ${nombre}</h2>, <p></p>comprueba tu cuenta en BienesRacices.com</p>
        <p>Tu cuenta ya está lista, solo debes confirmarla en el siguiente enlace: <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/confirmar/${token}">Confirmar cuenta</a></p>
        <p>Si tu no creaste esta cuenta, puedes ignorar este mensaje.</p>`
    }); 
}

export { emailRegistro }