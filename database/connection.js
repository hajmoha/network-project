
// conection to the database

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('project', 'network', 'network', {
    host: 'localhost', 
    dialect: 'mysql',
    
});


module.exports = sequelize;