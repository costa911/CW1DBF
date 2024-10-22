// app.js
const express = require('express');
const session = require('express-session');
const path = require('path');
const { createConnection, getConnection } = require('./db');
const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));
// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Home page route
app.get('/', (req, res) => {
    res.render('login', { error: null }); // Pass empty error object for initial render
});

// Login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    try {
        // Create database connection with provided credentials
        const connection = createConnection({
            username: username,
            password: password
        });

        connection.connect((err) => {
            if (err) {
                console.error('Error connecting to database:', err);
                return res.render('login', { error: 'Invalid credentials' });
            }

            // Store user type in session based on username
            let userType = '';
            if (username === 'history_admin') userType = 'admin';
            else if (username === 'history_editor') userType = 'editor';
            else if (username === 'history_viewer') userType = 'viewer';

            req.session.userType = userType;
            req.session.username = username;
            res.redirect('/dashboard');
        });
    } catch (error) {
        console.error('Error:', error);
        res.render('login', { error: 'An error occurred' });
    }
});

// Dashboard route
app.get('/dashboard', (req, res) => {
    if (!req.session.username) {
        return res.redirect('/');
    }
    res.render('dashboard', {
        userType: req.session.userType,
        username: req.session.username
    });
});

// Logout route
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error logging out:', err);
        }
        res.redirect('/');
    });
});

// Show Tables route
app.get('/show-tables', (req, res) => {
    if (!req.session.username) {
        return res.redirect('/');
    }

    const connection = getConnection();  // Ensure the database connection is already established

    connection.query('SHOW TABLES', (err, results) => {
        if (err) {
            console.error('Error fetching tables:', err);
            return res.render('dashboard', { error: 'Unable to fetch tables', tables: [] });
        }

        const tableNames = results.map(row => Object.values(row)[0]); // Extract table names from results
        res.render('showTables', { tables: tableNames, userType: req.session.userType, username: req.session.username });
    });
});

// Start the server
app.listen(3000, () => {
    console.log('Server running on port 3000');
});
