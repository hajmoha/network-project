const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const Post = require('../models/post.model');
const { authMiddleware, isAdmin } = require('../middleware/auth.middleware');
const multer = require('multer');
const cookieParser = require('cookie-parser');
const path = require('path');

// Set storage engine
const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, path.join(__dirname, '../static/uploads/'));
    },
    filename: function(req, file, cb){
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Explicitly define associations
User.hasMany(Post, { foreignKey: 'user_id', as: 'posts' });
Post.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

router.get('/', async (req, res) => {
    res.render('admin-dashboard');
});

router.get('/users', async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    }
    catch(err) {
        console.log(err);
        res.status(500).send('we have an error');
    }
});

router.get('/users/:id', async(req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);
        
        if (!user) {
            return res.status(404).send('User not found');
        }
        
        res.render('edit-user', { user: user });
    } catch (err) {
        console.log(err);
        res.status(500).send('We have an error');
    }
});

router.post('/users/:id', async(req, res) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, email, role } = req.body;
        
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).send('User not found');
        }

        await user.update({
            firstName,
            lastName,
            email,
            role
        });

        res.redirect('/admin');
    } catch (err) {
        console.log(err);
        res.status(500).send('We have an error');
    }
});

router.delete('/users/:id', async (req, res) => {
    try {
        const {id} = req.params;
        const user = await User.findByPk(id);
        await user.destroy();
        res.json({message: 'user deleted'});
    }
    catch(err) {
        console.log(err);
        res.status(500).send('we have an error');
    }
});

router.get('/posts', async (req, res) => {
    try {
        const posts = await Post.findAll({
            include: [{
                model: User,
                as: 'user',
                attributes: ['username', 'email']
            }]
        });
        res.json(posts);
    } catch(err) {
        console.log(err);
        res.status(500).send('we have an error');
    }
});



router.get('/posts/:id', async (req, res) => {
    try {
        const post = await Post.findByPk(req.params.id);
        if (!post) {
            return res.status(404).send('Post not found');
        }
        res.render('update-post-admin', { post });
    } catch (error) {
        console.error('Error:', error);
        res.redirect('/admin');
    }
});

router.post('/posts/:id', upload.single('cover'), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;

        const post = await Post.findByPk(id);
        if (!post) {
            return res.status(404).send('Post not found');
        }

        const updateData = { title, content , cover: post.cover };
        if (req.file) {
            updateData.cover = '/uploads/' + req.file.filename;
        }

        await post.update(updateData);
        res.redirect('/admin');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error updating post');
    }
});

router.delete('/posts/:id', async (req, res) => {
    try {
        const {id} = req.params;
        const post = await Post.findByPk(id);
        await post.destroy();
        res.json({message: 'post deleted'});
    }
    catch(err) {
        console.log(err);
        res.status(500).send('we have an error');
    }
});

router.get('/logout', (req, res) => {   
    res.clearCookie('token');
    res.redirect('/');
});


module.exports = router;