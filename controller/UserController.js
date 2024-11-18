const { json } = require('express');
const db = require('../config/db/mysql');

class UserController {
    async login  (req, res) {
        const { username, password } = req.body;
        try {
            const query = 'SELECT * FROM User WHERE username = ? AND password = ?';
            db.query(query, [username, password], async (err, results) => {
                if (err) {
                    return res.status(400).send('Error logging in: ' + err.message);
                }
                if (results.length === 0) {
                    return res.status(400).send('User not found');
                }
                const user = results[0];
                // let isMatch = await bcrypt.compare(password, user.password);
                // if (!isMatch) {
                //     return res.status(400).send('Invalid credentials');
                // }
                // const token = jwt.sign({ userId: user.id }, 'secretkey', { expiresIn: '1h' });
                res.status(200).json(user);
            });
        } catch (error) {
            res.status(400).send('Error logging in: ' + error.message);
        }
    }

    async register (req, res) {
        const { email, name, username, password } = req.body;
        try {
            // const hashedPassword = await bcrypt.hash(password, 10);
            const query = 'INSERT INTO User (email, name, username, password, attribute) VALUES (?, ?, ?, ?, ?)';
            db.query(query, [email, name, username, password, "user"], (err, result) => {
                if (err) {
                    return res.status(400).send('Error registering user: ' + err.message);
                }
                res.status(201).json({"message": 'User registered successfully', "id": result.insertId, "email": email, "name": name, "username": username, "attribute": "user"});
            });
        } catch (error) {
            res.status(400).send('Error registering user: ' + error.message);
        }
    }

    async getAllUser (req, res) {
        try {
            const query = 'SELECT * FROM User';
            db.query(query, [], (err, results) => {
                if (err) {
                    return res.status(400).send('Error getting all user: ' + err.message);
                }
                console.log(results);
                res.status(200).json({ results });
            });
        } catch (error) {
            res.status(400).send('Error getting all user: ' + error.message);
        }
    }
}

module.exports = new UserController();