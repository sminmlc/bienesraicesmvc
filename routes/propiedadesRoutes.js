import express  from "express";
const router = express.Router();
import { admin } from "../controllers/propiedadController.js";

//Routing
router.get('/mis-propiedades', admin);

export default router;