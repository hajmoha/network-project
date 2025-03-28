const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');
const User = require('./user.model');

const Post = sequelize.define('Post', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    cover: {
        type: DataTypes.STRING,
        allowNull: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'Posts',
    defaultScope: {
        include: [{
            model: User,
            as: 'user',
            attributes: ['username', 'email'] // فیلدهای مورد نیاز را وارد کنید
        }]
    }
});

// تنظیم ارتباط بین Post و User
Post.associate = (models) => {
    // استفاده از مدل User
    Post.belongsTo(User, {
        foreignKey: 'user_id',
        as: 'user'
    });
};

module.exports = Post;