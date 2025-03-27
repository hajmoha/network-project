const express = require('express')
const router = express.Router()
const User = require('../models/user.model')
const ResetPassword = require('../models/reset-password.model')
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// reteLimit is a middleware to limit the number of requests from an IP address
const rateLimit = require('express-rate-limit');


const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: "Too many login attempts, please try again later.",
    headers: true
});

const resetPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes ,
    max: 5, // limit each IP to 5 requests per windowMs ,
    message: "Too many password reset attempts, please try again later.",
    headers: true
});

function generateResetToken() {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(32, (err, buffer) => {
            if (err) {
                reject(err);
            } else {
                const token = buffer.toString('hex');
                resolve(token);
            }
        });
    });
}

router.get('/login', (req, res) => {
    res.render('login') // ./views/login.ejs
})

router.get('/register', (req, res) => {
    res.render('register')
})

router.post('/login', loginLimiter ,  async (req, res) => {
    const { email, password , rememberMe } = req.body

    const secretKey = 'your_secret_key';

    const user = await User.findOne({
        where: {
            email
        }
    })

    if (user) {
        if (user.password == password) {
            const payload = {
                "id": user._id,
                "email": user.email
            }

            // remmeber me for 30 days
            const expiresIn = rememberMe ? '30d' : '3h';
            const maxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 3 * 60 * 60 * 1000;

            const token = jwt.sign(payload, secretKey, {
                expiresIn: expiresIn,
            });

            res.cookie('token', token, {
                maxAge: maxAge,
                path: '/' , 
                httpOnly: true , 
                sameSite: 'strict' , 
            })
            res.redirect("/user/profile")


        } else {
            res.render('login', { "errorMessage": "The password is incorrect!" })
        }

    } else {
        res.render('login', { "errorMessage": "User not found!" })
    }
})

router.post('/register', async (req, res) => {
    const { email, password, firstname, lastname, username } = req.body

    const user = await User.findOne({
        where: {
            email
        }
    })

    if (user) {
        res.render('register', { "errorMessage": "User already exists!" })
    } else {
        const user = await User.create({
            lastName: lastname,
            firstName: firstname,
            password,
            email,
            username
        })

        res.redirect('/auth/login')
    }
})

router.get('/forget-password', (req, res) => {
    res.render('forget-password')
}) ; 

router.post('/forget-password', resetPasswordLimiter ,async (req, res) => {
    const { email } = req.body

    const user = await User.findOne({
        where: {
            email
        }
    })

    if (user) {
        
        const resetToken = {
            token: await generateResetToken(),
            expiresAt: new Date(Date.now() + 3600000) 
        };

        await ResetPassword.create({
            email,
            token: resetToken.token,
            expiresAt: resetToken.expiresAt
        })
        
        res.redirect('/auth/login')
    } else {
        res.redirect('/auth/login')
    }
})


router.post('/forget-password/:token', async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        const resetPassword = await ResetPassword.findOne({
            where: { token }
        });

        if (!resetPassword) {
            return res.status(400).send("Invalid or expired token");
        }

        // Check if the token has expired
        if (resetPassword.expiresAt < new Date()) {
            return res.status(400).send("Token has expired");
        }

        const user = await User.findOne({
            where: { email: resetPassword.email }
        });

        if (!user) {
            return res.status(404).send("User not found");
        }
        else{
            // change the password
            user.password = password;
            await user.save();
            // delete the reset password record
            await resetPassword.destroy();
            res.status(200).send("Password updated successfully");
        }

    } catch (error) {
        res.status(500).send("Internal server error");
    }

})

router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/auth/login')
})

module.exports = router