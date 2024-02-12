import express  from "express";
import { formularioLogin, formularioRegistro, formularioRecordarContrasena, registrar, confirmar } from "../controllers/usuarioController.js";
const router = express.Router();

//Routing
router.get('/', function(req, res){
    res.json({msg: 'Respuesta del servidor'})
});

router.post('/', function(req, res){
    res.json({msg: 'Información sobre nosotros'})
});

router.get('/login',formularioLogin);
router.get('/registro',formularioRegistro);
router.post('/registro',registrar);
router.get('/recordar-contrasena',formularioRecordarContrasena);
router.get('/confirmar/:token',confirmar);

export default router;