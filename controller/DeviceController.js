const db = require('../config/db/mysql');

class DeviceController {
    async getAllDevices(req, res) {
        try {
            const query = 'SELECT * FROM Device';
            db.query(query, [], (err, results) => {
                if (err) {
                    return res.status(400).send('Error getting all devices: ' + err.message);
                }
                console.log(results);
                res.status(200).json({ results });
            });
        } catch (error) {
            return res.status(400).send('Error getting all devices: ' + error.message);
        }
    }

    async getDeviceById(req, res) {
        try {
            const query = 'SELECT * FROM Device WHERE id = ?';
            db.query(query, [req.params.id], (err, results) => {
                if (err) {
                    return res.status(400).send('Error getting device by id: ' + err.message);
                }
                console.log(results);
                res.status(200).json({ results });
            });
        } catch (error) {
            res.status(400).send('Error getting device by id: ' + error.message);
        }
    }

    async getDevicesByUserId(req, res) {
        try {
            const query = 'SELECT * FROM Device WHERE user_id = ?';
            db.query(query, [req.params.userid], (err, results) => {
                if (err) {
                    return res.status(400).send('Error getting device by id: ' + err.message);
                }
                console.log(results);
                res.status(200).json({ results });
            });
        } catch (error) {
            res.status(400).send('Error getting device by id: ' + error.message);
        }
    }
}

module.exports = new DeviceController();