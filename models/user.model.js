const {DataTypes } = require('sequelize');
const sequelize = require('../database/connection')
const Post = require('./post.model');

const User = sequelize.define(
    'User',
    {
      // Model attributes are defined here
      id : {
        type : DataTypes.INTEGER,
        allowNull : false,
        primaryKey : true,
        autoIncrement : true
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true , 
        require:true ,
        set(value){
            this.setDataValue('username', value ? value.toLowerCase() : '');
        }
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      created_at : {
        type : DataTypes.DATE,
        allowNull : false
      },
      updated_at : {
        type : DataTypes.DATE,
        allowNull : false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique:true ,
        require: true,
        set(value){
            this.setDataValue('email', value ? value.toLowerCase() : '');
        }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      profile_image : {
        type : DataTypes.STRING,
        allowNull : true
      } , 
      bio : {
        type : DataTypes.STRING,
        allowNull : true
      }  , 
      current_password : {
        type : DataTypes.STRING,
        allowNull : true
      } , 
      role:{
        type : DataTypes.ENUM , 
        values : ['user' , 'admin'] , 
        defaultValue : 'user'
      } ,

     
    },
    {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
  );


  module.exports = User ;