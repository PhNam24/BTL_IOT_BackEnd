const mqtt = require('mqtt');
const db = require('../db/mysql');

const connectURL = 'wss://f0acd462864740079d29d753be0de1f2.s1.eu.hivemq.cloud:8884/mqtt';
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`;

const options = {
    clientId,
    clean: true,
    protocol: 'mqtts',
    username: 'btliot',
    password: 'Btliotn3@'
};

const client = mqtt.connect(connectURL, options);
const topics = ['device', 'sensor', 'led', 'fan', 'speaker']

function connect() {
    client.on('connect', () => {
        console.log('Connected to Mqtt Broker')
        topics.forEach((value, index) => {
            client.subscribe(`${value}`, (error) => {
                if (error) {
                    console.error('Subscription Failed', error)
                } else {
                    console.log(`Subscribe To ${value}`)
                }
            })
        })
    })
    client.on('error', (error) => {
        console.error('connection failed', error)
    })
}

function reconnect() {
    client.on('reconnect', (error) => {
        console.error('reconnect failed', error)
    })
}

function message() {
    var query = "INSERT INTO History (humidity, temperature, timestamp, sensor_id) VALUES (?, ?, ?, ?)";
    
    client.on('message', (topic, payload) => {
        console.log('Received Message:', topic, payload.toString());
        try {
            var json = JSON.parse(payload.toString());
            if (topic == 'device') {
                var sensor_id = json.sensorID.toString();
                var humidity = json.humidity;
                var temperature = json.temperature;
                var time_update = new Date(); // Lấy thời gian hiện tại

                db.query(query, [humidity, temperature, time_update, sensor_id], function (err, result) {
                    if (err) throw err;
                    console.log("Number of records inserted to history: " + result.affectedRows);
                });
            }
        } catch (err) {
            console.log(err);
        }
    });
}

module.exports = {
    client,
    connect,
    message
};


