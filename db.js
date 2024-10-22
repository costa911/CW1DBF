// db.js
const mysql = require('mysql2');

let connection = null;

const createConnection = (credentials) => {
    connection = mysql.createConnection({
        host: 'localhost',
        user: credentials.username,
        password: credentials.password,
        database: 'SteppingIntoHistory'
    });

    return connection;
};

const getConnection = () => {
    if (!connection) {
        throw new Error('Database connection is not established.');
    }
    return connection;
};

module.exports = { createConnection, getConnection };