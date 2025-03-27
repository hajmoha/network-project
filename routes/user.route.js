// we have profile user such that view-profile , pic-profile , change-pass , create-post , edit-post , delete-post 

const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const { authMiddleware , isAdmin} = require('../middleware/auth.middleware');
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

router.get('/profile', async (req, res) => {
    const user = await User.findOne({
        where: {
            email: req.user.email
        }
    })
    if (user){
        if(user.role === 'admin'){
            res.render('admin-dashboard', {user}) // add posts after adding posts to the database !
        }
        else{
            res.render('profile', {user}) // add posts after adding posts to the database !
        }
    }
    else {
        res.redirect('/auth/login')
    }
})

router.post('/profile' , async(req, res)=>{

    const {firstName, lastName, bio , password} = req.body;
    const {current_password , new_password , confirm_new_password} = req.body
    const profile_image = req.file?.filename;
    
    if(profile_image){
        
        const static_path = '/uploads/' + profile_image;
        await User.update({profile_image: static_path}, {
            where: {
                email: req.user.email
            }
        })
    }
    else if(current_password && new_password && confirm_new_password){
        const user = await User.findOne({
            where: {
                email: req.user.email
            }
        })
        if(user){
            if(user.password === current_password){
                if(new_password === confirm_new_password){
                    await User.update({password: new_password}, {
                        where: {
                            email: req.user.email
                        }
                    })
                }
                else{
                    res.render('profile', {error: 'Passwords do not match'})
                }
            }
            else{
                res.render('profile', {error: 'Incorrect Password'})
            }
        }
    }
    else{
        await User.update({firstName, lastName, bio}, {
            where: {
                email: req.user.email
            }
        })
    }
    res.redirect('/user/profile')
})

router.get('/create-post', async (req, res) => {

    try {
        const user = await User.findOne({
            where: {
                email: res.locals.decoded.email 
            }
        });
        res.render('create-post', { user });

    } catch (error) {
        console.error('Create post error:', error);
        res.redirect('/user/profile');
    }
});

const postStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../static/uploads/'))
    },
    filename: function (req, file, cb) {
        cb(null, 'post-cover-' + Date.now() + path.extname(file.originalname));
    }
});

const uploadPost = multer({ storage: postStorage });

router.post('/create-post', uploadPost.single('cover'), async (req, res) => {


    try {
        const user = await User.findOne({
            where: {
                email: res.locals.decoded.email 
            }
        });

        const postData = {
            title : req.body.title,
            content : req.body.content,
            user_id : user.id
        }

        if(req.file){
            postData.cover = req.file.filename;
        }
        await Post.create(postData);
        res.redirect('/user/profile');
    } catch (error) {
        console.error('Create post error:', error);
        res.status(500).send('Error creating post');
    }
})

router.get('/posts/:id', async (req, res) => {
    const user = await User.findOne({
        where: { email: res.locals.decoded.email } , 
    });
    const post = await Post.findOne({
        where: { id: req.params.id }
    });
    res.render('update-post', { post });
});

router.post('/posts/:id',  uploadPost.single('cover'), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;

        // Get current user
        const user = await User.findOne({
            where: { email: res.locals.decoded.email }
        });

        // Find post and verify ownership
        const post = await Post.findOne({
            where: { 
                id,
                user_id: user.id 
            }
        });

        if (!post) {
            return res.status(404).send('Post not found');
        }

        // Update data
        const updateData = {
            title,
            content
        };

        // Handle cover image if uploaded
        if (req.file) {
            updateData.cover = `/uploads/${req.file.filename}`;
        }

        // Update post
        await post.update(updateData);

        res.redirect('/user/profile');
    } catch (error) {
        console.error('Post update error:', error);
        res.status(500).send('Error updating post');
    }
});
router.delete('/posts/:id',  async (req, res) => {
    try {
        
        const postId = req.params.id;
        if (!postId) {
            return res.status(400).json({ success: false, message: "Invalid post ID" });
        }

        const user = await User.findOne({ where: { email: res.locals.decoded.email } });

        const post = await Post.findOne({
            where: { id: postId, user_id: user.id }
        });

        if (!post) {
            return res.status(403).json({ success: false, message: "Unauthorized or post not found" });
        }

        await Post.destroy({ where: { id: postId } });

        res.status(200).json({ success: true, message: "Post deleted successfully" });
    } catch (error) {
        console.error("Delete post error:", error);
        res.status(500).json({ success: false, message: "Error deleting post" });
    }
});
        
        
        


module.exports = router;