import { check, validationResult } from 'express-validator';
import Usuario from '../models/Usuario.js';
import {generarId} from '../helpers/tokens.js'
import {emailRegistro} from '../helpers/emails.js'

const formularioLogin = (req, res) => {
    res.render('auth/login', {
        pagina: 'Iniciar Sesión'
    })
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
    await check('password').isLength({min: 6}).withMessage("La contraseña debe tener mínimo 6 carácteres.").run(req);
    await check('repetir-password').equals('password').withMessage("Las contraseñas no son iguales.").run(req);

    let resultado = validationResult(req);

    const {nombre: nombreUsuario} = req.body
    const {email: emailUsuario} = req.body
    const {password: passwordUsuario} = req.body

    //Verificar que no hay errores para enviar los datos
    if(!resultado.isEmpty()){
        //Hay errores
        res.render('auth/registro', {
            pagina: 'Crear cuenta',
            errores: resultado.array(),
            usuario:{
                nombre: nombreUsuario,
                email: emailUsuario
            },
            csrfToken: req.csrfToken()
        })
    }

    console.log('emailUsuario:', emailUsuario);

    //Verificamos el usuario para no duplicarlo
    const existeUsuaruo = await Usuario.findOne({where: {email: emailUsuario}});
    if(existeUsuaruo){
        res.render('auth/registro', {
            pagina: 'Crear cuenta',
            errores: [{msg: "El usuario ya está registrado"}],
            usuario:{
                nombre: nombreUsuario,
                email: emailUsuario
            },
            csrfToken: req.csrfToken()
        })
    }else{
        console.log('-- Creamos usuario -- ');
        console.log('Email:', emailUsuario);
        console.log('Nombre:', nombreUsuario);

        const usuario = await Usuario.create({nombreUsuario, emailUsuario, passwordUsuario,token: generarId()});

        res.render('template/mensaje',{
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
    const {token} = req.params;

    //validamos token
    const usuario = await Usuario.findOne({where: {token}})
    if(!usuario){
        return res.render('auth/confirmar-cuenta',{
            pagina: 'Error al confirmar tu cuenta',
            mensaje: 'Ha habido un error al confirmar tu cuenta, intentálo de nuevo',
            error: true
        })
    }
    //Confirmamos cuenta
    usuario.token  = null;
    usuario.confirmado = true;
    await usuario.save();

    res.render('auth/confirmar-cuenta',{
        pagina: 'Cuenta confirmada',
        mensaje: 'Cuenta confirmada correctamente'
    })
}

const formularioRecordarContrasena = (req, res) => {
    res.render('auth/recordar-contrasena', {
        pagina: 'Recordar contraseña'
    })
}


export {
    formularioLogin,
    formularioRegistro,
    registrar,
    confirmar,
    formularioRecordarContrasena
}