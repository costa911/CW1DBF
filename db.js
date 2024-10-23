// db.js
const mysql = require('mysql2');

let connection = null;

const createConnection = (credentials) => {
    try {
        connection = mysql.createConnection({
            host: '127.0.0.1',
            port: 3306,
            user: credentials.username,
            password: credentials.password,
            database: 'SteppingIntoHistory'
        });

        // Test the connection
        connection.connect((err) => {
            if (err) {
                console.error('Error connecting to database:', {
                    host: '127.0.0.1',
                    port: 3306,
                    user: credentials.username,
                    database: 'SteppingIntoHistory',
                    error: err.message
                });
                throw err;
            }
            console.log('Successfully connected to database as', credentials.username);
        });

        return connection;
    } catch (error) {
        console.error('Error creating database connection:', error);
        throw error;
    }
};

const getConnection = () => {
    if (!connection) {
        throw new Error('Database connection is not established.');
    }
    return connection;
};

module.exports = { createConnection, getConnection };