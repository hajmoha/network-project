const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const { authMiddleware, isAdmin } = require('../middleware/auth.middleware');
const multer = require('multer');
const cookieParser = require('cookie-parser');
const Post = require('../models/post.model');
const path = require('path');
const { create } = require('domain');

// Set storage engine for profile image
const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, path.join(__dirname, '../static/uploads/'));
    },
    filename: function(req, file, cb){
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });
// Profile GET route
router.get('/profile', authMiddleware,async (req, res) => {
    try {
        const user = await User.findOne({
            where: {
                email: req.user.email
            }
        });

        if (!user) {
            return res.redirect('/auth/login');
        }

        if (user.role === 'admin') {
            res.render('admin-dashboard', { user });
        } else {
            // Fetch user's posts to display on profile
            const posts = await Post.findAll({
                where: { user_id: user.id },
                order: [['createdAt', 'DESC']]
            });
            res.render('profile', { user, posts });
        }
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).redirect('/auth/login');
    }
});

// Profile POST route with comprehensive error handling
router.post('/profile',authMiddleware, upload.single('image'), async (req, res) => {
    try {
        const { firstName, lastName, bio } = req.body;
        const { current_password, new_password, confirm_new_password } = req.body;
        const profile_image = req.file;

        const user = await User.findOne({
            where: { email: req.user.email }
        });

        if (!user) {
            return res.status(404).render('profile', { error: 'User not found' });
        }

        // Handle profile image upload
        if (profile_image) {
            const static_path = '/uploads/' + profile_image.filename;
            await user.update({ profile_image: static_path });
            return res.redirect('/user/profile');
        }

        // Handle password change
        if (current_password && new_password && confirm_new_password) {
            // Simple password validation - you might want to use bcrypt in real implementation
            if (user.password !== current_password) {
                return res.render('profile', { error: 'Incorrect current password' });
            }

            if (new_password !== confirm_new_password) {
                return res.render('profile', { error: 'New passwords do not match' });
            }

            await user.update({ password: new_password });
            return res.redirect('/user/profile');
        }

        // Handle profile info update
        const updateData = {};
        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;
        if (bio) updateData.bio = bio;

        // Only attempt update if there are fields to update
        if (Object.keys(updateData).length > 0) {
            const [updatedRows] = await User.update(updateData, {
                where: { email: req.user.email }
            });

            if (updatedRows > 0) {
                return res.redirect('/user/profile');
            } else {
                return res.render('profile', { error: 'No changes were made' });
            }
        }

        // If no updates were attempted
        res.redirect('/user/profile');

    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).render('profile', { 
            error: 'There was a problem updating the user!',
            details: error.message 
        });
    }
});

// Posts Create GET route
router.get('/posts/create', authMiddleware,async (req, res) => {
    try {
        const user = await User.findOne({
            where: { email: req.user.email }
        });
        res.render('create-post', { user });
    } catch (error) {
        console.error('Create post error:', error);
        res.redirect('/user/profile');
    }
});

// Posts storage configuration
const postStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../static/uploads/'))
    },
    filename: function (req, file, cb) {
        cb(null, 'post-cover-' + Date.now() + path.extname(file.originalname));
    }
});

const uploadPost = multer({ storage: postStorage });

// Posts Create POST route
router.post('/posts/create',authMiddleware, uploadPost.single('cover'), async (req, res) => {
    try {
        const user = await User.findOne({
            where: { email:req.user.email }
        });

        const postData = {
            title: req.body.title,
            content: req.body.content,
            user_id: user.id , 
            createdAt: new Date(),
            
        };

        if (req.file) {
            postData.cover = req.file.filename;
        }

        await Post.create(postData);
        res.redirect('/user/profile');
    } catch (error) {
        console.error('Create post error:', error);
        res.status(500).send('Error creating post');
    }
});

// Post Update GET route
router.get('/posts/:id', authMiddleware,async (req, res) => {
    try {
        const user = await User.findOne({
            where: { email: req.user.email }
        });

        const post = await Post.findOne({
            where: { 
                id: req.params.id,
                user_id: user.id 
            }
        });

        if (!post) {
            return res.status(404).send('Post not found');
        }

        res.render('update-post', { post, user });
    } catch (error) {
        console.error('Fetch post error:', error);
        res.status(500).send('Error fetching post');
    }
});

router.get('/posts/:id',authMiddleware, async (req, res) => {
    try {
        const user = await User.findOne({
            where: { email: req.user.email }
        });

        const post = await Post.findOne({
            where: { 
                id: req.params.id,
                user_id: user.id 
            }
        });

        if (!post) {
            return res.status(404).send('Post not found');
        }

        res.render('update-post', { post, user });
    } catch (error) {
        console.error('Fetch post error:', error);
        res.status(500).send('Error fetching post');
    }
});

// Post Update POST route
router.post('/posts/:id',authMiddleware, uploadPost.single('cover'), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;

        const user = await User.findOne({
            where: { email: req.user.email }
        });

        const post = await Post.findOne({
            where: { 
                id,
                user_id: user.id 
            }
        });

        if (!post) {
            return res.status(404).send('Post not found');
        }

        const updateData = { title, content };

        if (req.file) {
            updateData.cover = `/uploads/${req.file.filename}`;
        }

        await post.update(updateData);
        res.redirect('/user/profile');
    } catch (error) {
        console.error('Post update error:', error);
        res.status(500).send('Error updating post');
    }
});

// Post Delete route
router.delete('/posts/:id', authMiddleware,async (req, res) => {
    try {
        const postId = req.params.id;
        if (!postId) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid post ID" 
            });
        }

        const user = await User.findOne({ 
            where: { email: req.user.email } 
        });

        const post = await Post.findOne({
            where: { 
                id: postId, 
                user_id: user.id 
            }
        });

        if (!post) {
            return res.status(403).json({ 
                success: false, 
                message: "Unauthorized or post not found" 
            });
        }

        await Post.destroy({ where: { id: postId } });

        res.status(200).json({ 
            success: true, 
            message: "Post deleted successfully" 
        });
    } catch (error) {
        console.error("Delete post error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error deleting post" 
        });
    }
});

module.exports = router;