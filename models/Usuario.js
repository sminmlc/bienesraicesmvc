import { DataTypes } from "sequelize";
import bcrypt from 'bcrypt';
import db from '../config/db.js';

const Usuario = db.define('usuarios', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    nombre: { type: DataTypes.STRING, allowNull: true },
    email: { type: DataTypes.STRING, allowNull: true },
    password: { type: DataTypes.STRING, allowNull: true },
    token: { type: DataTypes.STRING },
    confirmado: { type: DataTypes.BOOLEAN }
},{
    hooks: {
        beforeCreate: async function (usuario) {
            if (!usuario.password) {
                throw new Error('Password is required');
              }
            const salt = await bcrypt.genSalt(10);
            usuario.password = await bcrypt.hash(usuario.password, salt);
        }
    }
});

//Métodos personalizados
Usuario.prototype.verificarContrasena = function(password){
    return bcrypt.compareSync(password, this.password);
}

export default Usuario;