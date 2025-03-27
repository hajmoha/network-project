const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const { authMiddleware, isAdmin } = require('../middleware/auth.middleware');
const multer = require('multer');
const cookieParser = require('cookie-parser');
const Post = require('../models/post.model');
const path = require('path');

// Set storage engine
const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, path.join(__dirname, '../static/uploads/'))
    },
    filename: function(req, file, cb){
        cb(null, Date.now() + file.originalname)
    }
})

const upload = multer({storage: storage})

router.get('/' ,  async (req, res) => {
    res.render('admin-dashboard')
})

router.get('/users' , async(req,  res)=>{
    try{
        const users = await userModel.findAll();
        res.json(users)
    }
    catch(err){
        console.log(err)
        res.status(500).send('we have an error')
    }
})

router.get('/users/:id' ,  async(req, res)=>{
    const {id} = req.params;
    try{
        const user = await userModel.findByPk(id);
        // show all info about the user
        res.json(user)
    }
    catch(err){
        console.log(err)
        res.status(500).send('we have an error')
    }
})

// delete user by admin
router.delete('/users/:id' , async(req , res)=>{
    try{
        const {id} = req.params;
        const user = await userModel.findByPk(id);
        await user.destroy();
        res.json({message: 'user deleted'})
    }
    catch(err){
        console.log(err)
        res.status(500).send('we have an error')
    }
})



// show all posts be admin
router.get('/posts', async(req, res) => {
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
// update post by admin
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

// delete post by admin
router.delete('/posts/:id' , async(req , res)=>{
    try{
        const {id} = req.params;
        const post = await Post.findByPk(id);
        await post.destroy();
        res.json({message: 'post deleted'})
    }
    catch(err){
        console.log(err)
        res.status(500).send('we have an error')
    }
})


module.exports = router