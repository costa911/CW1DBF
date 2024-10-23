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
        username: req.session.username,
        error: null // Ensure error is defined here
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
            return res.render('dashboard', { 
                error: 'Unable to fetch tables',
                userType: req.session.userType,
                username: req.session.username 
            });
        }

        const tableNames = results.map(row => Object.values(row)[0]); // Extract table names from results
        res.render('showTables', { tables: tableNames, userType: req.session.userType, username: req.session.username });
    });
});

// Show Tours route
app.get('/show-tours', (req, res) => {
    if (!req.session.username) {
        return res.redirect('/');
    }

    const connection = getConnection();  // Ensure the database connection is already established

    connection.query('SELECT * FROM Tour', (err, results) => {
        if (err) {
            console.error('Error fetching tours:', err);
            return res.render('dashboard', { 
                error: 'Unable to fetch tours',
                userType: req.session.userType,
                username: req.session.username 
            });
        }

        // Assuming your columns are named TourName and TourDate
        const tourDetails = results.map(row => ({
            name: row.TourName,   // Accessing TourName
            date: row.TourDate     // Accessing TourDate
        }));
        res.render('showTours', { tours: tourDetails, userType: req.session.userType, username: req.session.username });
    });
});

// Insert a new tour
app.post('/add-tour', (req, res) => {
    const { name, date, description } = req.body.newTour;
    const connection = getConnection();

    connection.query('INSERT INTO Tour (TourName, TourDate) VALUES (?, ?, ?)', [name, date, description], (err) => {
        if (err) {
            console.error('Error adding tour:', err);
            return res.redirect('/show-tours'); // Redirect on error
        }
        res.redirect('/show-tours'); // Redirect after success
    });
});

// Update an existing tour
app.post('/update-tour', (req, res) => {
    const { id, updatedTour } = req.body; // Assuming updatedTour contains the new values
    const connection = getConnection();

    connection.query('UPDATE Tour SET TourName = ?, TourDate = ? WHERE id = ?', [updatedTour.name, updatedTour.date, id], (err) => {
        if (err) {
            console.error('Error updating tour:', err);
            return res.redirect('/show-tours'); // Redirect on error
        }
        res.redirect('/show-tours'); // Redirect after success
    });
});

// Delete a tour
app.post('/delete-tour', (req, res) => {
    const { id } = req.body; // Assuming id is passed in the form
    const connection = getConnection();

    connection.query('DELETE FROM Tour WHERE id = ?', [id], (err) => {
        if (err) {
            console.error('Error deleting tour:', err);
            return res.redirect('/show-tours'); // Redirect on error
        }
        res.redirect('/show-tours'); // Redirect after success
    });
});

// Query existing tours (this could be part of your existing /show-tours route)
app.get('/show-tours', (req, res) => {
    const connection = getConnection();
    
    connection.query('SELECT * FROM Tour', (err, results) => {
        if (err) {
            console.error('Error fetching tours:', err);
            return res.render('dashboard', { error: 'Unable to fetch tours' });
        }

        res.render('showTours', { tours: results, userType: req.session.userType, username: req.session.username });
    });
});

// Show Books route
app.get('/show-book', (req, res) => {
    if (!req.session.username) {
        return res.redirect('/');
    }

    const connection = getConnection();  // Get the existing database connection

    connection.query('SELECT * FROM Book LIMIT 5', (err, results) => {
        if (err) {
            console.error('Error fetching books:', err);
            return res.render('dashboard', { 
                error: 'Unable to fetch books',
                userType: req.session.userType,
                username: req.session.username 
            });
        }

        const bookDetails = results.map(row => ({
            title: row.BookTitle,
            author: row.Author,
            year: row.YearPublished,
        }));
        
        res.render('showBooks', { 
            books: bookDetails, 
            userType: req.session.userType, 
            username: req.session.username 
        });
    });
});

app.get('/check-phpmyadmin-access', (req, res) => {
    if (!req.session.username) {
        return res.status(403).json({ error: 'Not logged in' });
    }
    
    if (req.session.userType !== 'admin' && req.session.userType !== 'editor') {
        return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Return the phpMyAdmin URL
    res.json({ url: 'http://localhost/phpmyadmin' });
});

// Start the server
app.listen(3000, () => {
    console.log('Server running on port 3000');
});