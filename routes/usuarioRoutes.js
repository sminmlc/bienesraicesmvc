import express  from "express";
import { formularioLogin, formularioRegistro } from "../controllers/usuarioController.js";
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

export default router;