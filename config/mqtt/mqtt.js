const mqtt = require('mqtt');
const db = require('../db/mysql');

const connectURL = 'mqtt://e8faa1c0f8174e3db1d82dd501f86d7c.s1.eu.hivemq.cloud:8884/mqtt';
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`;

console.log('clientId', clientId)

const options = {
    clientId,
    clean: true,
    protocol: 'wss',
    username: 'wind2715',
    password: '123456789Hanoi'
};

const client = mqtt.connect(connectURL, options);
const topics = ['device', 'sensor', 'led_state', 'fan', 'speaker']

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


