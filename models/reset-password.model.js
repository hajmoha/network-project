const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');


const ResetPassword = sequelize.define('ResetPassword', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    token: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    timestamps: true,
    tableName: 'reset_passwords'
});

module.exports = ResetPassword;