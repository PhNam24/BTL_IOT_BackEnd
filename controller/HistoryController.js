const db = require('../config/db/mysql');

class HistoryController {
    // Hàm hỗ trợ phân trang, trả về một Promise
    getData(user_id, device_id, page = 1, limit = 10) {
        return new Promise((resolve, reject) => {
            const deviceQuery = 'SELECT * FROM Device WHERE id = ?';
            db.query(deviceQuery, [device_id], (err, results) => {
                if (err) {
                    return reject('Error getting device by id: ' + err.message);
                }
                const device = results[0];
                if (!device) {
                    return reject('Device not found');
                }
                if (device.user_id !== user_id) {
                    return reject('Device unavailable for user');
                }

                const countQuery = 'SELECT COUNT(*) AS total FROM History WHERE device_id = ?';
                db.query(countQuery, [device_id], (countErr, countResults) => {
                    if (countErr) {
                        return reject('Error getting history count: ' + countErr.message);
                    }

                    const total = countResults[0].total;
                    const totalPages = Math.ceil(total / limit);
                    const offset = (page - 1) * limit;

                    const historyQuery = 'SELECT temperature, humidity, timestamp FROM History WHERE device_id = ? ORDER BY timestamp DESC LIMIT ? OFFSET ?';
                    db.query(historyQuery, [device_id, limit, offset], (historyErr, historyResults) => {
                        if (historyErr) {
                            return reject('Error getting history data: ' + historyErr.message);
                        }

                        resolve({
                            page: page,
                            limit: limit,
                            totalRecords: total,
                            totalPages: totalPages,
                            data: historyResults
                        });
                    });
                });
            });
        });
    }

    // http get history
    async getCurrentData(req, res) {
        const { user_id, device_id } = req.body;
        try {
            const deviceQuery = 'SELECT * FROM Device WHERE id = ?';
            db.query(deviceQuery, [device_id], (err, results) => {
                if (err) {
                    res.status(400).send('Error getting device by id: ' + err.message);
                }
                console.log(results);
                const device = results[0];
                if (!device) {
                    res.status(404).send('Device not found');
                }
                if (device.user_id !== user_id) {
                    res.status(403).send('Device unavailable for user');
                }
                const historyQuery = 'SELECT temperature, humidity, timestamp FROM History WHERE device_id = ? ORDER BY timestamp DESC';
                db.query(historyQuery, [device_id], (historyErr, historyResults) => {
                    if (historyErr) {
                        res.status(400).send('Error getting history data: ' + historyErr.message);
                    }
                    res.status(200).json({"user_id": user_id, "device_id": device_id, "historyResults": historyResults});
                });
            });
        } catch (error) {
            res.status(400).send('Error getting history: ' + error);
        }
    }
}

module.exports = new HistoryController();