const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root1234',
    database: 'json_project',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

console.log('MySQL pool created!');

module.exports = pool;