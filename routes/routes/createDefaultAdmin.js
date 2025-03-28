// created Defult Admin

const User = require('../../models/user.model');

async function createDefaultAdmin() {
    try{
        const adminExists = await User.findOne({where: {email: 'sumohast@gmail.com'}});
        if(adminExists) return;
        else{
            await User.create({
                username: 'admin',
                firstName: 'Admin',
                lastName: 'User',
                email: 'sumohast@gmail.com',
                password: '123', // pass should be hashed !!!
                role: 'admin',
                created_at: new Date(),
                updated_at: new Date()
            });
    }
} catch (error) {
    console.error('Unable to create default admin:', error);
}}

module.exports = createDefaultAdmin;