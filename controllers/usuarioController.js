import { check, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import Usuario from '../models/Usuario.js';
import { generarJWT, generarId } from '../helpers/tokens.js'
import { emailRegistro, emailRecuperarContrasena } from '../helpers/emails.js'

const formularioLogin = (req, res) => {
    res.render('auth/login', {
        pagina: 'Iniciar Sesión',
        csrfToken: req.csrfToken()
    })
}

const autenticar = async (req, res) => {
    await check('email').isEmail().withMessage("El email es obligatorio.").run(req);
    await check('password').notEmpty().withMessage("La contraseña es obligatoria.").run(req);

    let resultado = validationResult(req);
    //Verificar que no hay errores para enviar los datos
    if (!resultado.isEmpty()) {
        //Hay errores
        res.render('auth/login', {
            pagina: 'Iniciar sesión',
            errores: resultado.array(),
            csrfToken: req.csrfToken()
        })
    }

    const { email: emailUsuario } = req.body
    const { password: passwordUsuario } = req.body

     //Verificamos si existe el usuario
     const usuario = await Usuario.findOne({ where: { email: emailUsuario } });
     if (!usuario) {
        res.render('auth/login', {
            pagina: 'Iniciar sesión',
            errores: [{msg: 'El usuario no existe'}],
            csrfToken: req.csrfToken()
        })
     }

     //Verificamos si el usuario está confirmado
     if (!usuario.confirmado) {
        res.render('auth/login', {
            pagina: 'Iniciar sesión',
            errores: [{msg: 'La cuenta no ha sido confirmada'}],
            csrfToken: req.csrfToken()
        })
     }

     //Validamos la contraseña
     if(!usuario.verificarContrasena(passwordUsuario)){
        res.render('auth/login', {
            pagina: 'Iniciar sesión',
            errores: [{msg: 'La contraseña es incorrecta'}],
            csrfToken: req.csrfToken()
        })
     }

     //Autenticar el usuario
     const token = generarJWT(usuario.id, usuario.nombre);
     //req.session.token = token;

     return res.cookie('_token',token,{
        httpOnly: true,
        //secure: true,
        sameSite: true
     }).redirect('/mispropiedades')
}

const formularioRegistro = (req, res) => {
    res.render('auth/registro', {
        pagina: 'Crear cuenta',
        csrfToken: req.csrfToken()
    })
}

const registrar = async (req, res) => {
    const { body } = req; // extract user data from the request body
    //Validación
    await check('nombre').notEmpty().withMessage("Debes rellenar el campo.").run(req);
    await check('email').isEmail().withMessage("El email no es válido.").run(req);
    await check('password').isLength({ min: 6 }).withMessage("La contraseña debe tener mínimo 6 carácteres.").run(req);
    await check('repetir-password').equals('password').withMessage("Las contraseñas no son iguales.").run(req);

    let resultado = validationResult(req);

    const { nombre: nombreUsuario } = req.body
    const { email: emailUsuario } = req.body
    const { password: passwordUsuario } = req.body

    //Verificar que no hay errores para enviar los datos
    if (!resultado.isEmpty()) {
        //Hay errores
        res.render('auth/registro', {
            pagina: 'Crear cuenta',
            errores: resultado.array(),
            usuario: {
                nombre: nombreUsuario,
                email: emailUsuario
            },
            csrfToken: req.csrfToken()
        })
    }

    //Verificamos el usuario para no duplicarlo
    const existeUsuario = await Usuario.findOne({ where: { email: emailUsuario } });
    if (existeUsuario) {
        res.render('auth/registro', {
            pagina: 'Crear cuenta',
            errores: [{ msg: "El usuario ya está registrado" }],
            usuario: {
                nombre: nombreUsuario,
                email: emailUsuario
            },
            csrfToken: req.csrfToken()
        })
    } else {
        const usuario = await Usuario.create({nombre:nombreUsuario, email:emailUsuario, password:passwordUsuario, token: generarId(), confirmado: false });

        res.render('templates/mensaje', {
            pagina: 'Cuenta creada correctamente',
            mensaje: 'Hemos enviado un email de confirmación, presiona en el enlace'
        })

        emailRegistro({
            nombre: usuario.nombre,
            email: usuario.email,
            token: usuario.token
        })

    }
}

const confirmar = async (req, res) => {
    const { token } = req.params;
    //validamos token
    const usuario = await Usuario.findOne({ where: { token } })
    if (!usuario) {
        return res.render('auth/confirmar-cuenta', {
            pagina: 'Error al confirmar tu cuenta',
            mensaje: 'Ha habido un error al confirmar tu cuenta, intentálo de nuevo',
            error: true
        })
    }
    //Confirmamos cuenta
    usuario.token = null;
    usuario.confirmado = true;
    await usuario.save();

    res.render('auth/confirmar-cuenta', {
        pagina: 'Cuenta confirmada',
        mensaje: 'Cuenta confirmada correctamente'
    })
}

const formularioRecordarContrasena = (req, res) => {
    res.render('auth/recordar-contrasena', {
        pagina: 'Recordar contraseña',
        csrfToken: req.csrfToken()
    })
}

const resetContrasena = async (req, res) => {
    //Validación

    await check('email').isEmail().withMessage("El email no es válido.").run(req);

    let resultado = validationResult(req);
    const { email: emailUsuario } = req.body

    //Verificar que no hay errores para enviar los datos
    if (!resultado.isEmpty()) {
        //Hay errores
        res.render('auth/recordar-contrasena', {
            pagina: 'Recupera tu contraseña a Bienes Raices',
            errores: resultado.array(),
            csrfToken: req.csrfToken()
        })
    }

    //Buscamos el usuario, generamos un token y enviamos email
    const usuario = await Usuario.findOne({ where: { email } })
    if (!usuario) {
        return res.render('auth/recordar-contrasena', {
            pagina: 'Recupera tu contraseña a Bienes Raices',
            errores: [{ msg: 'No se ha encontrado el usuario con este email' }],
            csrfToken: req.csrfToken()
        })
    }
    
    //Generar un token y enviar el email
    usuario.token = generarId();
    await usuario.save();

    //Enviamos email
    emailRecuperarContrasena({
        email,
        nombre: usuario.nombre,
        token: usuario.token
    })

    res.render('templates/mensaje', {
        pagina: 'Reestablecer la contraseña',
        mensaje: 'Hemos enviado un email con las instrucciones para resetear la contraseña'
    })
}

const comprobarToken = async (req, res) => {
    const {token} = req.params;
    const usuario = await Usuario.findOne({where: {token}})
    if(!usuario){
        res.render('auth/confirmar-cuenta', {
            pagina: 'Reestablecer la contraseña',
            mensaje: 'Hubo un error al validar tu información, intentalo de nuevo',
            error: true
        })
    }

    //Mostrar el formulario para modificar la contraseña
    res.render('auth/reset-contrasena',{
        pagina: 'Reestablecer tu contraseña',
        csrfToken: req.csrfToken()
    })
}

const nuevaContrasena = async (req, res) => {
    //Validamos la contraseña
    await check('password').isLength({ min: 6 }).withMessage("La contraseña debe tener mínimo 6 carácteres.").run(req);

    let resultado = validationResult(req);
    if (!resultado.isEmpty()) {
        //Hay errores
        res.render('auth/reset-contrasena', {
            pagina: 'Reestablecer tu contraseña',
            errores: resultado.array(),
            csrfToken: req.csrfToken()
        })
    }

    const {token} = req.params
    const { password: passwordUsuario } = req.params

    //Verificamos quién hace el cambio
    const usuario = await Usuario.findOne({where: {token}})

    const salt = await bcrypt.genSalt(10);
    usuario.password = await bcrypt.hash(password, salt);
    usuario.token = null;

    await usuario.save();

    res.render('auth/confimrar-cuenta',{
        pagina: 'Contraseña reestablecida',
        csrfToken: req.csrfToken(),
        mensaje: 'La contrasena se ha modificado correctamente.'
    })
}

export {
    formularioLogin,
    autenticar,
    formularioRegistro,
    registrar,
    confirmar,
    formularioRecordarContrasena,
    resetContrasena,
    comprobarToken,
    nuevaContrasena
}