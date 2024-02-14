import express  from "express";
import { formularioLogin, autenticar, formularioRegistro, formularioRecordarContrasena, registrar, confirmar, resetContrasena, comprobarToken, nuevaContrasena } from "../controllers/usuarioController.js";
const router = express.Router();

router.get('/login',formularioLogin);
router.post('/login',autenticar);
router.get('/registro',formularioRegistro);
router.post('/registro',registrar);
router.get('/recordar-contrasena',formularioRecordarContrasena);
router.get('/confirmar/:token',confirmar);
router.post('/recordar-contrasena/:token',resetContrasena);
router.get('/recordar-contrasena/:token',comprobarToken);
router.post('/recordar-contrasena/:token',nuevaContrasena);

export default router;