const db = require('../config/db/mysql');

class SpeakerController {
    async getAllSpeakers(req, res) {
        try {
            const query = 'SELECT * FROM Speaker';
            db.query(query, [], (err, results) => {
                if (err) {
                    return res.status(400).send('Error getting all Speakers: ' + err.message);
                }
                console.log(results);
                res.status(200).json({ results });
            });
        } catch (error) {
            return res.status(400).send('Error getting all Speakers: ' + error.message);
        }     
    }

    async turnOnSpeaker(req, res) {
        try {
            let id = req.params.id;
            const query = 'UPDATE Speaker SET status = 1 WHERE id = ?';
            db.query(query, [id], (err, results) => {
                if (err) {
                    return res.status(400).send('Error turning on speaker: ' + err.message);
                }
                console.log(results);
                req.mqttPublish('speaker_status', `{speaker_id: ${id}, status: "ON"}`)
                res.status(200).json({ results });
            });
        } catch (error) {
            return res.status(400).send('Error turning on speaker: ' + error.message);
        }
    }

    async turnOffSpeaker(req, res) {
        try {
            let id = req.params.id;
            const query = 'UPDATE Speaker SET status = 0 WHERE id = ?';
            db.query(query, [id], (err, results) => {
                if (err) {
                    return res.status(400).send('Error turning off speaker: ' + err.message);
                }
                console.log(results);
                req.mqttPublish('speaker_status', `{speaker_id: ${id}, status: "OFF"}`)
                res.status(200).json({ results });
            });
        } catch (error) {
            return res.status(400).send('Error turning off speaker: ' + error.message);
        }
    }
}

module.exports = new SpeakerController();