const { createConnection } = require('mysql2');

const db = createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'btl_iot',
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});


module.exports = db;