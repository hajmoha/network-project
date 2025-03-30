const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const port = 3000;
const path = require('path');
const authRoutes = require('./routes/auth.route');
const userRoutes = require('./routes/user.route');
const adminRoutes = require('./routes/admin.route');
const homeRoutes = require('./routes/home.route');
const sequelize = require('./database/connection');
const { isAdmin, authMiddleware } = require('./middleware/auth.middleware');
const cookieParser = require('cookie-parser');
const adminExists = require('./routes/routes/createDefaultAdmin');

// created instance of express
const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'static')));
app.use('/uploads', express.static(path.join(__dirname, 'static/uploads')));

// set the view engine to ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('uploads', path.join(__dirname, 'uploads'));



// Middleware
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// set the path for static files
app.use(express.static(path.join(__dirname, 'static')));
app.use('/uploads', express.static(path.join(__dirname, 'static/uploads')));


// routers
app.use('/', homeRoutes);  
app.use('/auth', authRoutes);  
app.use('/user', authMiddleware, userRoutes);
app.use('/admin', authMiddleware, isAdmin, adminRoutes);



app.listen(port, async () => {
    try {
        await sequelize.authenticate();
        await adminExists();
        await sequelize.sync({
            force: false // true will drop the table if it already existss
        });
        
        console.log('Connection has been established successfully.');
        console.log(`Example app listening on port ${port}`);
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
});
