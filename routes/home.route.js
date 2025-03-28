const express = require('express');
const router = express.Router(); 
const Post = require('../models/post.model');

router.get('/' , async(req , res) => {
    const posts = await Post.findAll();
    res.render('index', { posts });
});

router.get('/about-admin', async(req , res) => {
    res.render('about-admin');
});

router.get('/posts/:id', async(req , res) => {
    const post = await Post.findByPk(req.params.id);
    res.render('public-post',  { post  });
});


module.exports = router;