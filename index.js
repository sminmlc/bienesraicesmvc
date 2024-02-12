import express  from "express";
import csurf from "csurf";
import cookieParser from "cookie-parser";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import db from './config/db.js'

//Crear la app
const app = express();

//Habilitar lectura de datos de formularios
app.use(express.urlencoded({extended:true}));

//Habilitar cookie parser
app.use(cookieParser())

//Habilitar CSRF
app.use(csurf({cookie:true}))

//Conexión a la BD
try {
    await db.authenticate();
    db.sync();
    console.log("Conexión correcta a la BD");
} catch (error) {
    console.log(error);
}

//Habilitar pug
app.set('view engine', 'pug')
app.set('views', './views')

//Carpeta pública
app.use(express.static('public'))

//Routing
app.use('/auth', usuarioRoutes)


//Definir puerto y arrancar el proyecto
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`El servidor funciona con el puerto ${port}`);
});